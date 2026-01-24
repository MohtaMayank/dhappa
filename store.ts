
import { create } from 'https://esm.sh/zustand';
import { GameState, Player, CardDef, Run, Team, GamePhase, Suit, WildType } from './types';
import { createDeck, generateId, sortHand } from './constants';

interface GameStore extends GameState {
  initGame: (playerCount: number) => void;
  selectCard: (id: string) => void;
  drawFromDeck: () => void;
  pickFromDiscard: (n: number) => void;
  discardCard: (id: string) => void;
  createRun: () => void;
  addToRun: (runId: string) => void;
  nextTurn: () => void;
  setNPickPreview: (n: number | null) => void;
  closeDrawOverlay: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  currentPlayerIndex: 0,
  drawPile: [],
  discardPile: [],
  phase: 'draw',
  selectedInHand: new Set(),
  nPickPreview: null,
  lastDrawnCard: null,
  isNPickActive: false,

  initGame: (playerCount: number) => {
    const deck = createDeck();
    const cardsPerPlayer = playerCount === 4 ? 27 : 21;
    
    const players: Player[] = Array.from({ length: playerCount }).map((_, i) => ({
      id: `p-${i}`,
      name: i === 0 ? 'You' : `Player ${i + 1}`,
      team: i % 2 === 0 ? Team.A : Team.B,
      hand: sortHand(deck.splice(0, cardsPerPlayer)),
      runs: [],
      hasOpened: false,
      isAI: i !== 0
    }));

    set({
      players,
      currentPlayerIndex: 0,
      drawPile: deck,
      discardPile: [deck.pop()!],
      phase: 'draw',
      selectedInHand: new Set(),
      lastDrawnCard: null
    });
  },

  selectCard: (id: string) => {
    const { selectedInHand } = get();
    const newSelected = new Set(selectedInHand);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    set({ selectedInHand: newSelected });
  },

  drawFromDeck: () => {
    const { drawPile, players, currentPlayerIndex, phase } = get();
    if (phase !== 'draw') return;

    const newDrawPile = [...drawPile];
    const drawnCard = newDrawPile.pop();
    if (!drawnCard) return;

    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = {
      ...newPlayers[currentPlayerIndex],
      hand: sortHand([...newPlayers[currentPlayerIndex].hand, drawnCard])
    };

    set({
      drawPile: newDrawPile,
      players: newPlayers,
      phase: 'play',
      lastDrawnCard: drawnCard
    });
  },

  closeDrawOverlay: () => set({ lastDrawnCard: null }),

  pickFromDiscard: (n: number) => {
    const { discardPile, players, currentPlayerIndex, phase } = get();
    if (phase !== 'draw' || n > discardPile.length) return;

    const picked = discardPile.slice(-n);
    const remainingDiscard = discardPile.slice(0, -n);
    const bottomCard = picked[0];

    // Rule: Must be able to play the bottom card immediately
    // For prototype simplicity, we assume they can or we'll let them handle it
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = {
      ...newPlayers[currentPlayerIndex],
      hand: sortHand([...newPlayers[currentPlayerIndex].hand, ...picked])
    };

    set({
      discardPile: remainingDiscard,
      players: newPlayers,
      phase: 'play',
      isNPickActive: false
    });
  },

  discardCard: (id: string) => {
    const { players, currentPlayerIndex, discardPile, phase } = get();
    if (phase !== 'play') return;

    const player = players[currentPlayerIndex];
    const cardToDiscard = player.hand.find(c => c.id === id);
    if (!cardToDiscard) return;

    const isDhappa = cardToDiscard.value === '2';
    const newDiscardPile = isDhappa ? [] : [...discardPile, cardToDiscard];
    const newHand = player.hand.filter(c => c.id !== id);

    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = { ...player, hand: sortHand(newHand) };

    set({
      players: newPlayers,
      discardPile: newDiscardPile,
      selectedInHand: new Set(),
      phase: 'draw',
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });
  },

  createRun: () => {
    const { selectedInHand, players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const cardsInRun = player.hand.filter(c => selectedInHand.has(c.id));
    
    if (cardsInRun.length < 3) return;

    // Determine if pure/set
    const isPure = cardsInRun.every(c => !c.isWild);
    const isSet = cardsInRun.every(c => c.value === cardsInRun[0].value) || 
                  (cardsInRun.every(c => c.value === 'A' || c.value === '3') && isPure);

    const newRun: Run = {
      id: generateId(),
      cards: [...cardsInRun],
      isPure,
      isSet
    };

    const newHand = player.hand.filter(c => !selectedInHand.has(c.id));
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = {
      ...player,
      hand: sortHand(newHand),
      runs: [...player.runs, newRun],
      hasOpened: player.hasOpened || isPure || (isSet && (newRun.cards[0].value === '3' || newRun.cards[0].value === 'A'))
    };

    set({ players: newPlayers, selectedInHand: new Set() });
  },

  addToRun: (runId: string) => {
    const { selectedInHand, players, currentPlayerIndex } = get();
    if (selectedInHand.size !== 1) return;

    const cardId = Array.from(selectedInHand)[0];
    const player = players[currentPlayerIndex];
    const cardToAdd = player.hand.find(c => c.id === cardId)!;

    const newPlayers = players.map(p => {
      const runIndex = p.runs.findIndex(r => r.id === runId);
      if (runIndex === -1) return p;

      const newRuns = [...p.runs];
      newRuns[runIndex] = {
        ...newRuns[runIndex],
        cards: [...newRuns[runIndex].cards, cardToAdd],
        isPure: false // Adding might break purity if it's wild, but logic simplified here
      };

      return { ...p, runs: newRuns };
    });

    // Remove from hand
    newPlayers[currentPlayerIndex] = {
      ...newPlayers[currentPlayerIndex],
      hand: player.hand.filter(c => c.id !== cardId)
    };

    set({ players: newPlayers, selectedInHand: new Set() });
  },

  nextTurn: () => {
    set(state => ({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      phase: 'draw'
    }));
  },

  setNPickPreview: (n) => set({ nPickPreview: n })
}));
