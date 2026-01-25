import { create } from 'zustand';
import { GameState, Player, CardDef, Run, Team, GamePhase, Suit, WildType } from './types';
import { createDeck, generateId, sortHand } from './constants';
import { ScenarioKey, getScenario } from './scenarios';
import { validateAddToRun, AddToRunResult, arrangeRun, checkRunAmbiguity, RANK_ORDER } from './gameLogic';

interface GameStore extends GameState {
  godMode: boolean;
  isSelectingRun: boolean;
  runCreationAmbiguity: { isOpen: boolean; cards: CardDef[]; headRank?: number; tailRank?: number } | null;
  initGame: (playerCount: number) => void;
  loadScenario: (key: ScenarioKey) => void;
  toggleGodMode: () => void;
  selectCard: (id: string) => void;
  drawFromDeck: () => void;
  pickFromDiscard: (n: number) => void;
  discardCard: (id: string) => void;
  createRun: (options?: { preferHead?: boolean; cards?: CardDef[] }) => void;
  resolveCreateRunAmbiguity: (direction: 'HEAD' | 'TAIL') => void;
  cancelCreateRunAmbiguity: () => void;
  addToRun: (runId: string, options?: { replaceDirection?: 'HEAD' | 'TAIL' }) => void;
  setSelectingRun: (isSelecting: boolean) => void;
  nextTurn: () => void;
  setNPickPreview: (n: number | null) => void;
  closeDrawOverlay: () => void;
  setIsConfirmingDraw: (isConfirming: boolean) => void;
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
  godMode: false,
  isConfirmingDraw: false,
  isSelectingRun: false,
  runCreationAmbiguity: null,

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
      lastDrawnCard: null,
      runCreationAmbiguity: null
    });
  },

  loadScenario: (key: ScenarioKey) => {
    const scenarioState = getScenario(key);
    set({ ...scenarioState, godMode: get().godMode });
  },

  toggleGodMode: () => set(state => ({ godMode: !state.godMode })),

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
      lastDrawnCard: drawnCard
    });
  },

  closeDrawOverlay: () => set({ lastDrawnCard: null, phase: 'play' }),

  pickFromDiscard: (n: number) => {
    const { discardPile, players, currentPlayerIndex, phase } = get();
    if (phase !== 'draw' || n > discardPile.length) return;

    const picked = discardPile.slice(-n);
    const remainingDiscard = discardPile.slice(0, -n);
    const bottomCard = picked[0];

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

  createRun: (options) => {
    const { selectedInHand, players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const cardsInRun = options?.cards || player.hand.filter(c => selectedInHand.has(c.id));
    
    if (cardsInRun.length < 3) return;

    if (options?.preferHead === undefined) {
        const ambiguity = checkRunAmbiguity(cardsInRun);
        if (ambiguity === 'AMBIGUOUS_ENDS') {
            // Need to calculate ranks for sequence ambiguity during creation too
            const naturals = cardsInRun.filter(c => !c.isWild);
            const sorted = [...naturals].sort((a, b) => (RANK_ORDER[a.value]||0) - (RANK_ORDER[b.value]||0));
            const remaining = cardsInRun.filter(c => c.isWild).length - ( (RANK_ORDER[sorted[sorted.length-1].value] - RANK_ORDER[sorted[0].value]) - (sorted.length-1) );
            
            const headRank = RANK_ORDER[sorted[0].value] - remaining;
            const tailRank = RANK_ORDER[sorted[sorted.length-1].value] + remaining;

            set({ runCreationAmbiguity: { isOpen: true, cards: cardsInRun, headRank, tailRank } });
            return;
        }
    }

    const arrangedCards = arrangeRun(cardsInRun, options?.preferHead);

    const isPure = arrangedCards.every(c => !c.isWild);
    const isSet = arrangedCards.every(c => c.value === arrangedCards[0].value) || 
                  (arrangedCards.every(c => c.value === 'A' || c.value === '3') && isPure);

    const newRun: Run = {
      id: generateId(),
      cards: arrangedCards,
      isPure,
      isSet
    };

    const newHand = player.hand.filter(c => !cardsInRun.find(cr => cr.id === c.id));
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = {
      ...player,
      hand: sortHand(newHand),
      runs: [...player.runs, newRun],
      hasOpened: player.hasOpened || isPure || (isSet && (newRun.cards[0].value === '3' || newRun.cards[0].value === 'A'))
    };

    set({ players: newPlayers, selectedInHand: new Set(), runCreationAmbiguity: null });
  },

  resolveCreateRunAmbiguity: (direction) => {
      const { runCreationAmbiguity } = get();
      if (!runCreationAmbiguity) return;
      get().createRun({ preferHead: direction === 'HEAD', cards: runCreationAmbiguity.cards });
  },

  cancelCreateRunAmbiguity: () => {
      set({ runCreationAmbiguity: null });
  },

  addToRun: (runId: string, options) => {
    const { selectedInHand, players, currentPlayerIndex } = get();
    if (selectedInHand.size === 0) return;

    const player = players[currentPlayerIndex];
    const cardsToAdd = player.hand.filter(c => selectedInHand.has(c.id));
    
    let targetRun: Run | undefined;
    let runOwnerIndex = -1;
    let runIndex = -1;

    players.some((p, pIdx) => {
      const rIdx = p.runs.findIndex(r => r.id === runId);
      if (rIdx !== -1) {
        targetRun = p.runs[rIdx];
        runOwnerIndex = pIdx;
        runIndex = rIdx;
        return true;
      }
      return false;
    });

    if (!targetRun || runOwnerIndex === -1) return;

    const validation = validateAddToRun(cardsToAdd, targetRun);

    if (validation.type === 'INVALID') {
        console.warn('Invalid Add to Run:', validation.reason);
        return;
    }

    const newPlayers = [...players];
    const newOwner = { ...newPlayers[runOwnerIndex] };
    const newCurrentPlayer = { ...newPlayers[currentPlayerIndex] }; 
    const newRun = { ...targetRun };

    // Apply changes based on validation type
    if (validation.type === 'EXTEND') {
        const position = validation.position === 'AMBIGUOUS' ? options?.replaceDirection : validation.position;

        if (!position) {
            console.warn('Ambiguous Extension requires direction');
            return;
        }

        if (position === 'HEAD') {
            newRun.cards = [...validation.cards, ...newRun.cards];
        } else {
            newRun.cards = [...newRun.cards, ...validation.cards];
        }
    } else if (validation.type === 'REPLACE_FLYING') {
       const jokerId = validation.cardToReturn.id;
       newRun.cards = newRun.cards.map(c => c.id === jokerId ? cardsToAdd[0] : c);
       newCurrentPlayer.hand = [...newCurrentPlayer.hand, validation.cardToReturn];
    } else if (validation.type === 'REPLACE_STATIC') {
       const displacedId = validation.displacedCard.id;
       const position = validation.newPosition === 'AMBIGUOUS' ? options?.replaceDirection : validation.newPosition;
       
       if (!position) {
           console.warn('Ambiguous Static Wild move requires direction');
           return;
       }

       const newCards = newRun.cards.map(c => c.id === displacedId ? cardsToAdd[0] : c);
       
       if (position === 'HEAD') {
           newRun.cards = [validation.displacedCard, ...newCards];
       } else {
           newRun.cards = [...newCards, validation.displacedCard];
       }
    }

    newOwner.runs = [...newOwner.runs];
    newOwner.runs[runIndex] = newRun;
    newPlayers[runOwnerIndex] = newOwner;

    if (runOwnerIndex === currentPlayerIndex) {
        const updatedHand = newOwner.hand.filter(c => !selectedInHand.has(c.id));
        if (validation.type === 'REPLACE_FLYING') {
            updatedHand.push(validation.cardToReturn);
        }
        newPlayers[currentPlayerIndex] = {
            ...newOwner,
            hand: sortHand(updatedHand)
        };
    } else {
        newPlayers[runOwnerIndex] = newOwner;
        
        let updatedHand = newCurrentPlayer.hand.filter(c => !selectedInHand.has(c.id));
        if (validation.type === 'REPLACE_FLYING') {
            updatedHand.push(validation.cardToReturn);
        }
        newPlayers[currentPlayerIndex] = {
            ...newCurrentPlayer,
            hand: sortHand(updatedHand)
        };
    }

    set({ players: newPlayers, selectedInHand: new Set(), isSelectingRun: false });
  },

  setSelectingRun: (isSelecting) => set({ isSelectingRun: isSelecting }),

  nextTurn: () => {
    set(state => ({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      phase: 'draw',
      isSelectingRun: false
    }));
  },

  setNPickPreview: (n) => set({ nPickPreview: n }),
  
  setIsConfirmingDraw: (isConfirming) => set({ isConfirmingDraw: isConfirming })
}));
