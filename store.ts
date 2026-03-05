/// <reference types="vite/client" />
import { create } from 'zustand';
import { GameState, Player, CardDef, Run, Team, GamePhase, Suit, WildType } from './shared/types';
import { createDeck, generateId, sortHand } from './shared/constants';
import { ScenarioKey, getScenario } from './scenarios';
import { validateAddToRun, AddToRunResult, arrangeRun, checkRunAmbiguity, RANK_ORDER, applyRepresentations, inferRunContext } from './shared/gameLogic';
import { io, Socket } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:8081`;
const socket: Socket = io(serverUrl);

interface GameStore extends GameState {
  // Client-only state
  godMode: boolean;
  isSelectingRun: boolean;
  addToRunAmbiguity: { 
    isOpen: boolean; 
    runId: string; 
    cards: CardDef[]; 
    headRank?: number; 
    tailRank?: number 
  } | null;
  mustPlayCard: string | null;
  runCreationAmbiguity: { isOpen: boolean; cards: CardDef[]; headRank?: number; tailRank?: number } | null;
  selectedInHand: string[];
  lastDrawnCard: CardDef | null;
  isConfirmingDraw: boolean;
  isNPickActive: boolean;
  nPickPreview: number | null;
  
  // Actions
  initGame: (playerName: string, roomId: string, passcode: string, token?: string) => void;
  drawFromDeck: () => void;
  pickFromDiscard: (n: number) => void;
  confirmDraw: () => void;
  cancelDraw: () => void;
  closeDrawOverlay: () => void;
  selectCardInHand: (cardId: string) => void;
  discardCard: (cardId: string) => void;
  startRunCreation: () => void;
  resolveCreateRunAmbiguity: (direction: 'HEAD' | 'TAIL') => void;
  cancelRunCreation: () => void;
  addToRun: (runId: string) => void;
  resolveAddToRunAmbiguity: (direction: 'HEAD' | 'TAIL') => void;
  cancelAddToRunAmbiguity: () => void;
  setSelectingRun: (isSelecting: boolean) => void;
  toggleNPick: (n: number | null) => void;
  toggleGodMode: () => void;
  loadScenario: (key: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // Socket listeners
  socket.on('state_update', (newState: GameState) => {
    const currentState = get();
    // Auto-select mustPlayCard if it just appeared
    if (newState.mustPlayCard && !currentState.mustPlayCard) {
      set({ ...newState, selectedInHand: [newState.mustPlayCard] });
    } else {
      set({ ...newState });
    }
  });

  socket.on('auth_success', (data: { roomId: string, playerIndex: number, token: string }) => {
    console.log('Authentication successful:', data);
    (window as any).ROOM_ID = data.roomId;
    
    // Persist to localStorage
    const authKey = `dhappa_auth_${data.roomId}`;
    localStorage.setItem(authKey, data.token);
  });

  socket.on('error', (message: string) => {
    console.error('Server error:', message);
    alert(message);
  });

  return {
    // Authoritative State (initialized to null/empty)
    players: [],
    currentPlayerIndex: 0,
    drawPile: [],
    discardPile: [],
    phase: 'draw',
    mustPlayCard: null,

    // Client State
    godMode: false,
    isSelectingRun: false,
    addToRunAmbiguity: null,
    runCreationAmbiguity: null,
    selectedInHand: [],
    lastDrawnCard: null,
    isConfirmingDraw: false,
    isNPickActive: false,
    nPickPreview: null,

    initGame: (playerName, roomId, passcode, token) => {
      (window as any).ROOM_ID = roomId; 
      socket.emit('join_room', roomId, playerName, passcode, token);
    },

    drawFromDeck: () => {
      if (get().phase !== 'draw') return;
      set({ isConfirmingDraw: true });
    },

    pickFromDiscard: (n: number) => {
      if (get().phase !== 'draw') return;
      socket.emit('game_action', (window as any).ROOM_ID, { type: 'PICK_FROM_DISCARD', payload: { n } });
    },

    confirmDraw: () => {
      set({ isConfirmingDraw: false });
      socket.emit('game_action', (window as any).ROOM_ID, { type: 'DRAW_FROM_DECK' });
    },

    cancelDraw: () => {
      set({ isConfirmingDraw: false });
    },

    closeDrawOverlay: () => {
      set({ lastDrawnCard: null });
    },

    selectCardInHand: (cardId) => {
      const { selectedInHand, mustPlayCard } = get();
      if (mustPlayCard === cardId && selectedInHand.includes(cardId)) {
        return; // Prevent deselecting
      }

      if (selectedInHand.includes(cardId)) {
        set({ selectedInHand: selectedInHand.filter(id => id !== cardId) });
      } else {
        set({ selectedInHand: [...selectedInHand, cardId] });
      }
    },

    discardCard: (cardId) => {
      socket.emit('game_action', (window as any).ROOM_ID, { 
        type: 'DISCARD_CARD', 
        payload: { cardId } 
      });
      set({ selectedInHand: [] });
    },

    startRunCreation: () => {
      const { selectedInHand, players, currentPlayerIndex } = get();
      const player = players[currentPlayerIndex];
      if (!player) return;
      const selectedCards = player.hand.filter(c => selectedInHand.includes(c.id));
      
      const ambiguity = checkRunAmbiguity(selectedCards);
      if (ambiguity === 'AMBIGUOUS_ENDS') {
        set({ runCreationAmbiguity: { isOpen: true, cards: selectedCards } });
      } else {
        socket.emit('game_action', (window as any).ROOM_ID, {
          type: 'CREATE_RUN',
          payload: { cards: selectedCards, options: {} }
        });
        set({ selectedInHand: [] });
      }
    },

    resolveCreateRunAmbiguity: (direction) => {
      const { runCreationAmbiguity } = get();
      if (!runCreationAmbiguity) return;
      
      const preferHead = direction === 'HEAD';

      socket.emit('game_action', (window as any).ROOM_ID, {
        type: 'CREATE_RUN',
        payload: { 
          cards: runCreationAmbiguity.cards, 
          options: { preferHead } 
        }
      });
      
      set({ runCreationAmbiguity: null, selectedInHand: [] });
    },

    cancelRunCreation: () => set({ runCreationAmbiguity: null }),

    addToRun: (runId) => {
      const { selectedInHand, players, currentPlayerIndex } = get();
      const player = players[currentPlayerIndex];
      if (!player) return;
      const selectedCards = player.hand.filter(c => selectedInHand.includes(c.id));

      // Check for ambiguity
      const runOwner = players.find(p => p.runs.some(r => r.id === runId));
      const targetRun = runOwner?.runs.find(r => r.id === runId);
      if (targetRun) {
        const validation = validateAddToRun(selectedCards, targetRun);
        if (validation.type === 'EXTEND' && validation.position === 'AMBIGUOUS') {
          set({ addToRunAmbiguity: { isOpen: true, runId, cards: selectedCards, headRank: validation.headRank, tailRank: validation.tailRank } });
          return;
        }
        if (validation.type === 'REPLACE_STATIC' && validation.newPosition === 'AMBIGUOUS') {
          set({ addToRunAmbiguity: { isOpen: true, runId, cards: selectedCards, headRank: validation.headRank, tailRank: validation.tailRank } });
          return;
        }
      }

      socket.emit('game_action', (window as any).ROOM_ID, {
        type: 'ADD_TO_RUN',
        payload: { runId, cards: selectedCards, options: {} }
      });
      
      set({ selectedInHand: [], isSelectingRun: false });
    },

    resolveAddToRunAmbiguity: (direction) => {
      const { addToRunAmbiguity } = get();
      if (!addToRunAmbiguity) return;
      
      const preferHead = direction === 'HEAD';

      socket.emit('game_action', (window as any).ROOM_ID, {
        type: 'ADD_TO_RUN',
        payload: { 
          runId: addToRunAmbiguity.runId, 
          cards: addToRunAmbiguity.cards, 
          options: { preferHead } 
        }
      });
      
      set({ addToRunAmbiguity: null, selectedInHand: [], isSelectingRun: false });
    },

    cancelAddToRunAmbiguity: () => set({ addToRunAmbiguity: null }),

    setSelectingRun: (isSelecting) => set({ isSelectingRun: isSelecting }),

    toggleNPick: (n) => {
      set({ isNPickActive: !!n, nPickPreview: n });
    },

    toggleGodMode: () => set((state) => ({ godMode: !state.godMode })),

    loadScenario: (key) => {
      socket.emit('game_action', (window as any).ROOM_ID, { type: 'LOAD_SCENARIO', payload: { key } });
    },
  };
});