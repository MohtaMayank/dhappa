import { GameState, Player, Team, CardDef, Run, Suit, GamePhase } from './shared/types';
import { getDeck, seededShuffle, pluckCard } from './utils/deckBuilder';
import { sortHand, generateId } from './shared/constants';

export const SCENARIO_KEYS = {
  INITIAL: 'initial',
  MIDGAME: 'midgame',
  ENDGAME: 'endgame',
  MANY_RUNS: 'many_runs',
  TESTING_RUNS: 'testing_runs',
  DHAPPA: 'dhappa',
  MERGE_RUNS: 'merge_runs'
} as const;

export type ScenarioKey = typeof SCENARIO_KEYS[keyof typeof SCENARIO_KEYS];

const createBasePlayers = (count: number): Player[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `p-${i}`,
    name: i === 0 ? 'You' : `Player ${i + 1}`,
    team: i % 2 === 0 ? Team.A : Team.B,
    hand: [],
    runs: [],
    hasOpened: false,
    isAI: i !== 0
  }));
};

const distributeCards = (deck: CardDef[], players: Player[], cardsPerPlayer: number) => {
  players.forEach(p => {
    const hand = deck.splice(0, cardsPerPlayer);
    p.hand = sortHand(hand);
  });
};

const createRun = (cards: CardDef[], isPure: boolean = true, isSet: boolean = false): Run => ({
  id: generateId(),
  cards,
  isPure,
  isSet
});

const getInitialScenario = (): GameState => {
  const deck = seededShuffle(getDeck());
  const players = createBasePlayers(4);
  distributeCards(deck, players, 27); // 4 players = 27 cards
  
  const discardPile = [deck.pop()!];
  
  return {
    players,
    currentPlayerIndex: 0,
    drawPile: deck,
    discardPile,
    phase: 'draw',
    selectedInHand: [],
    nPickPreview: null,
    lastDrawnCard: null,
    isNPickActive: false,
    isConfirmingDraw: false,
    isSelectingRun: false,
    runCreationAmbiguity: null, mustPlayCard: null,
    winner: null
  };
};

const getMidGameScenario = (): GameState => {
  const fullDeck = getDeck();
  
  // Helper to pluck a joker
  const pluckJoker = (deck: CardDef[]): CardDef => {
    const idx = deck.findIndex(c => c.value === 'Jo');
    return deck.splice(idx, 1)[0];
  };

  // Helper to pluck a '2'
  const pluckTwo = (deck: CardDef[]): CardDef => {
    const idx = deck.findIndex(c => c.value === '2');
    return deck.splice(idx, 1)[0];
  };

  const createRealisticRun = (suit: Suit, wildPositions: { pos: number, type: 'flying' | 'static' }[]): CardDef[] => {
    const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];
    return values.map((v, index) => {
      const wild = wildPositions.find(wp => wp.pos === index);
      if (wild) {
        const card = wild.type === 'flying' ? pluckJoker(fullDeck) : pluckTwo(fullDeck);
        return {
          ...card,
          represents: { value: v, suit }
        };
      }
      return pluckCard(fullDeck, v, suit)!;
    }).filter(Boolean).reverse();
  };

  // Helper for mid-sized runs with wilds
  const createMidRun = (suit: Suit, startVal: string, length: number, wildPositions: { pos: number, type: 'flying' | 'static' }[]): CardDef[] => {
    const allValues = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];
    const startIdx = allValues.indexOf(startVal);
    const runValues = allValues.slice(startIdx, startIdx + length);

    return runValues.map((v, idx) => {
        const wild = wildPositions.find(wp => wp.pos === idx);
        if (wild) {
            const card = wild.type === 'flying' ? pluckJoker(fullDeck) : pluckTwo(fullDeck);
            return { ...card, represents: { value: v, suit } };
        }
        return pluckCard(fullDeck, v, suit)!;
    }).reverse();
  };

  const players = createBasePlayers(4);

  // Forced cards for P0 to test mechanics
  const h8 = pluckCard(fullDeck, '8', Suit.Hearts);
  const s3 = pluckCard(fullDeck, '3', Suit.Spades);

  // --- Team A (Players 0 & 2) ---
  // P0: 1 Complete Run, 1 Mid Run (6 cards)
  players[0].runs = [
    createRun(createRealisticRun(Suit.Spades, [{ pos: 10, type: 'static' }]), false), // A..3, one static wild
    createRun(createMidRun(Suit.Hearts, '10', 6, [{ pos: 2, type: 'flying' }]), false) // 10, 9, Jo(8), 7, 6, 5
  ];
  players[0].hasOpened = true;

  // P2: 1 Mid Run (5 cards), 1 Small Run (3 cards)
  players[2].runs = [
    createRun(createMidRun(Suit.Clubs, 'K', 5, [{ pos: 1, type: 'static' }, { pos: 4, type: 'flying' }]), false), // K, 2(Q), J, 10, Jo(9)
    createRun(createMidRun(Suit.Diamonds, '5', 3, [{ pos: 0, type: 'static' }]), false) // 2(5), 4, 3
  ];
  players[2].hasOpened = true;


  // --- Team B (Players 1 & 3) ---
  // P1: 1 Complete Run, 1 Mid Run (7 cards)
  players[1].runs = [
    createRun(createRealisticRun(Suit.Diamonds, [{ pos: 5, type: 'flying' }]), false), // A..3, one flying wild
    createRun(createMidRun(Suit.Spades, '9', 7, [{ pos: 3, type: 'static' }, { pos: 6, type: 'static' }]), false) // 9, 8, 7, 2(6), 5, 4, 3
  ];
  players[1].hasOpened = true;

  // P3: 1 Mid Run (4 cards), 1 Small Run (4 cards)
  players[3].runs = [
    createRun(createMidRun(Suit.Hearts, 'A', 4, [{ pos: 2, type: 'flying' }]), false), // A, K, Jo(Q), J
    createRun(createMidRun(Suit.Clubs, '6', 4, [{ pos: 1, type: 'static' }]), false) // 6, 2(5), 4, 3
  ];
  players[3].hasOpened = true;


  const deck = seededShuffle(fullDeck); // Shuffle rest
  
  // Deal rest (approx 15-20 cards each for midgame)
  for (let i = 0; i < 4; i++) {
    players[i].hand = sortHand(deck.splice(0, 18));
  }

  // Inject forced cards
  if (h8) players[0].hand.push(h8);
  if (s3) players[0].hand.push(s3);
  players[0].hand = sortHand(players[0].hand);
  
  // Fill discard pile
  const discardPile = deck.splice(0, 15);
  
  return {
    players,
    currentPlayerIndex: 0,
    drawPile: deck,
    discardPile,
    phase: 'draw',
    selectedInHand: [],
    nPickPreview: null,
    lastDrawnCard: null,
    isNPickActive: false,
    isConfirmingDraw: false,
    isSelectingRun: false,
    runCreationAmbiguity: null, mustPlayCard: null,
    winner: null
  };
};

const getEndGameScenario = (): GameState => {
  const fullDeck = getDeck();
  const players = createBasePlayers(4);

  // Helper to pluck a joker
  const pluckJoker = (deck: CardDef[]): CardDef => {
    const idx = deck.findIndex(c => c.value === 'Jo');
    return deck.splice(idx, 1)[0];
  };

  // Helper to pluck a '2'
  const pluckTwo = (deck: CardDef[]): CardDef => {
    const idx = deck.findIndex(c => c.value === '2');
    return deck.splice(idx, 1)[0];
  };

  const createRealisticRun = (suit: Suit, wildPositions: { pos: number, type: 'flying' | 'static' }[]): CardDef[] => {
    const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];
    return values.map((v, index) => {
      const wild = wildPositions.find(wp => wp.pos === index);
      if (wild) {
        const card = wild.type === 'flying' ? pluckJoker(fullDeck) : pluckTwo(fullDeck);
        return {
          ...card,
          represents: { value: v, suit }
        };
      }
      return pluckCard(fullDeck, v, suit)!;
    }).filter(Boolean).reverse();
  };

  // Helper for smaller runs (e.g. 4-5-6-7)
  const createSmallRun = (suit: Suit, startVal: string, length: number, wildPos: number = -1): CardDef[] => {
    const allValues = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];
    const startIdx = allValues.indexOf(startVal);
    const runValues = allValues.slice(startIdx, startIdx + length);
    
    return runValues.map((v, idx) => {
      if (idx === wildPos) {
        const card = pluckTwo(fullDeck);
        return { ...card, represents: { value: v, suit } };
      }
      return pluckCard(fullDeck, v, suit)!;
    }).reverse();
  };

  // Team A (Players 0 & 2)
  // Player 0: 3 Winning Runs (Lock Condition)
  
  // Custom Run for P0: Completed run with extra static wildcard
  const p0Run1 = createRealisticRun(Suit.Hearts, [{ pos: 1, type: 'flying' }, { pos: 4, type: 'static' }]);
  const extraWild = pluckTwo(fullDeck);
  // extraWild.represents is undefined by default
  p0Run1.push(extraWild);

  players[0].runs = [
    createRun(p0Run1, false),
    createRun(createRealisticRun(Suit.Diamonds, [{ pos: 2, type: 'flying' }, { pos: 5, type: 'static' }]), false),
    createRun(createRealisticRun(Suit.Spades, []), true)
  ];
  players[0].hasOpened = true;

  // Player 2: Support Run with Static Wild
  players[2].runs = [
    createRun(createSmallRun(Suit.Clubs, '7', 5, 2), false) // 5 cards (7,6,5,4,3), wild at pos 2 (5)
  ];
  players[2].hasOpened = true;

  // Team B (Players 1 & 3)
  // Player 1: 3 Winning Runs (Lock Condition)
  players[1].runs = [
    createRun(createRealisticRun(Suit.Clubs, [{ pos: 3, type: 'flying' }]), false),
    createRun(createRealisticRun(Suit.Hearts, [{ pos: 6, type: 'static' }]), false),
    createRun(createRealisticRun(Suit.Diamonds, [{ pos: 0, type: 'flying' }, { pos: 8, type: 'static' }]), false)
  ];
  players[1].hasOpened = true;

  // Player 3: Support Run with Static Wild
  players[3].runs = [
    createRun(createSmallRun(Suit.Spades, '9', 5, 1), false) // 5 cards (9,8,7,6,5), wild at pos 1 (8)
  ];
  players[3].hasOpened = true;

  // Shuffle remaining
  const deck = seededShuffle(fullDeck);

  // Distribute hands (3-6 cards each)
  players[0].hand = sortHand([pluckCard(deck, '10', Suit.Spades)!]); // Exactly 1 card to win by discarding
  players[1].hand = sortHand(deck.splice(0, 4));
  players[2].hand = sortHand(deck.splice(0, 5));
  players[3].hand = sortHand(deck.splice(0, 6));

  const discardPile = deck.splice(0, 20);

  return {
    players,
    currentPlayerIndex: 0,
    drawPile: deck,
    discardPile,
    phase: 'play',
    selectedInHand: [],
    nPickPreview: null,
    lastDrawnCard: null,
    isNPickActive: false,
    isConfirmingDraw: false,
    isSelectingRun: false,
    runCreationAmbiguity: null, mustPlayCard: null,
    winner: null
  };
};

const getManyRunsScenario = (): GameState => {
  const fullDeck = getDeck();
  const players = createBasePlayers(4);

  // Generate many runs for each player
  const suits = [Suit.Hearts, Suit.Spades, Suit.Clubs, Suit.Diamonds];
  
  players.forEach((p, pIdx) => {
    p.hasOpened = true;
    p.runs = [];
    
    // Create 8 runs per player
    for (let i = 0; i < 8; i++) {
        const suit = suits[(i + pIdx) % 4];
        // One long run (12 cards: A-3)
        if (i === 0) {
            const values = ['A','K','Q','J','10','9','8','7','6','5','4','3'];
            const longRunCards = values.map((val, idx) => {
                return { 
                    id: generateId(), 
                    suit, 
                    value: val, 
                    isWild: false
                };
            }).reverse();
            p.runs.push(createRun(longRunCards, true));
        } else {
            // Normal runs (3-5 cards)
            const len = 3 + (i % 3);
            const values = ['K','Q','J','10','9'];
            const runCards = values.slice(0, len).map((val, idx) => ({
                 id: generateId(), suit, value: val, isWild: false
            })).reverse();
            p.runs.push(createRun(runCards, true));
        }
    }
  });

  return {
    players,
    currentPlayerIndex: 0,
    drawPile: [],
    discardPile: [],
    phase: 'play',
    selectedInHand: [],
    nPickPreview: null,
    lastDrawnCard: null,
    isNPickActive: false,
    isConfirmingDraw: false,
    isSelectingRun: false,
    runCreationAmbiguity: null, mustPlayCard: null,
    winner: null
  };
};

const getTestingRunsScenario = (): GameState => {
    const fullDeck = getDeck();
    const players = createBasePlayers(4);

    // Player 1 (Team A) - Pure Run + Joker
    const p1PureRun = [
        pluckCard(fullDeck, 'A', Suit.Hearts)!,
        pluckCard(fullDeck, 'K', Suit.Hearts)!,
        pluckCard(fullDeck, 'Q', Suit.Hearts)!
    ];
    const joker = fullDeck.find(c => c.value === 'Jo')!;
    const joIdx = fullDeck.indexOf(joker);
    fullDeck.splice(joIdx, 1);

    players[0].hand = sortHand([
        ...p1PureRun,
        joker,
        pluckCard(fullDeck, '10', Suit.Spades)!,
        pluckCard(fullDeck, 'J', Suit.Spades)!,
        pluckCard(fullDeck, 'Q', Suit.Spades)!,
        ...fullDeck.splice(0, 10)
    ]);

    // Player 3 (Team A) - Teammate who needs to add to P1's run
    players[2].hand = sortHand([
        pluckCard(fullDeck, 'J', Suit.Hearts)!,
        pluckCard(fullDeck, '10', Suit.Hearts)!,
        ...fullDeck.splice(0, 15)
    ]);

    // Players 2 & 4 (Team B)
    players[1].hand = sortHand(fullDeck.splice(0, 20));
    players[3].hand = sortHand(fullDeck.splice(0, 20));

    const discardPile = [fullDeck.pop()!];

    return {
        players,
        currentPlayerIndex: 0,
        drawPile: fullDeck,
        discardPile,
        phase: 'play',
        selectedInHand: [],
        nPickPreview: null,
        lastDrawnCard: null,
        isNPickActive: false,
        isConfirmingDraw: false,
        isSelectingRun: false,
        runCreationAmbiguity: null, mustPlayCard: null,
        winner: null
    };
};

const getDhappaScenario = (): GameState => {
    const fullDeck = getDeck();
    const players = createBasePlayers(4);
    
    // Player 1 has a '2'
    players[0].hand = sortHand([
        pluckCard(fullDeck, '2', Suit.Hearts)!,
        ...fullDeck.splice(0, 26)
    ]);
    
    // Fill discard pile
    const discardPile = fullDeck.splice(0, 10);
    
    return {
        players,
        currentPlayerIndex: 0,
        drawPile: fullDeck,
        discardPile,
        phase: 'play',
        selectedInHand: [],
        nPickPreview: null,
        lastDrawnCard: null,
        isNPickActive: false,
        isConfirmingDraw: false,
        isSelectingRun: false,
        runCreationAmbiguity: null, mustPlayCard: null,
        winner: null
    };
};

const getMergeRunsScenario = (): GameState => {
    const fullDeck = getDeck();
    const players = createBasePlayers(4);
    
    // Player 1 has two runs that can be merged by an 8 of Hearts or a wild
    // Run 1: 5, 6, 7 of Hearts
    // Run 2: 9, 10, J of Hearts
    // Gap: 8 of Hearts
    
    const h5 = pluckCard(fullDeck, '5', Suit.Hearts)!;
    const h6 = pluckCard(fullDeck, '6', Suit.Hearts)!;
    const h7 = pluckCard(fullDeck, '7', Suit.Hearts)!;
    const h9 = pluckCard(fullDeck, '9', Suit.Hearts)!;
    const h10 = pluckCard(fullDeck, '10', Suit.Hearts)!;
    const hJ = pluckCard(fullDeck, 'J', Suit.Hearts)!;
    
    players[0].runs = [
        createRun([h5, h6, h7], true),
        createRun([h9, h10, hJ], true)
    ];
    players[0].hasOpened = true;
    
    // P1 hand has 8 of Hearts and a Joker
    const h8 = pluckCard(fullDeck, '8', Suit.Hearts)!;
    const joker = fullDeck.find(c => c.value === 'Jo')!;
    const joIdx = fullDeck.indexOf(joker);
    fullDeck.splice(joIdx, 1);
    
    players[0].hand = sortHand([
        h8,
        joker,
        ...fullDeck.splice(0, 10)
    ]);
    
    return {
        players,
        currentPlayerIndex: 0,
        drawPile: fullDeck,
        discardPile: [fullDeck.pop()!],
        phase: 'play',
        selectedInHand: [],
        nPickPreview: null,
        lastDrawnCard: null,
        isNPickActive: false,
        isConfirmingDraw: false,
        isSelectingRun: false,
        runCreationAmbiguity: null, mustPlayCard: null,
        winner: null
    };
};

export const getScenario = (key: string): GameState => {
  switch (key) {
    case SCENARIO_KEYS.INITIAL: return getInitialScenario();
    case SCENARIO_KEYS.MIDGAME: return getMidGameScenario();
    case SCENARIO_KEYS.ENDGAME: return getEndGameScenario();
    case SCENARIO_KEYS.MANY_RUNS: return getManyRunsScenario();
    case SCENARIO_KEYS.TESTING_RUNS: return getTestingRunsScenario();
    case SCENARIO_KEYS.DHAPPA: return getDhappaScenario();
    case SCENARIO_KEYS.MERGE_RUNS: return getMergeRunsScenario();
    default: return getInitialScenario();
  }
};
