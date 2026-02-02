import { CardDef, Run, Suit, WildType } from './types';

// Rank values for sequence logic
export const RANK_ORDER: Record<string, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3
};

export const REVERSE_RANK: Record<number, string> = Object.entries(RANK_ORDER).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

export type RunContext = {
  type: 'SET' | 'SEQUENCE';
  suit?: Suit; // For sequences
  rank?: number; // For sets
  cards: {
    card: CardDef;
    representedRank: number;
    representedSuit: Suit;
  }[];
};

export function getRank(value: string): number {
  return RANK_ORDER[value] || 0;
}

export function inferRunContext(runCards: CardDef[]): RunContext | null {
  if (runCards.length < 3) return null; 

  const naturalCards = runCards.filter(c => !c.isWild);
  
  if (naturalCards.length === 0) return null;

  const firstNatural = naturalCards[0];
  const isSet = naturalCards.every(c => c.value === firstNatural.value);

  if (isSet && naturalCards.length >= 2) {
      // Enforce no duplicate natural cards (same suit) in a set
      const suits = naturalCards.map(c => c.suit);
      if (new Set(suits).size !== suits.length) return null;

      return {
          type: 'SET',
          rank: getRank(firstNatural.value),
          cards: runCards.map(c => ({
              card: c,
              representedRank: getRank(firstNatural.value),
              representedSuit: c.isWild ? Suit.Spades : c.suit 
          }))
      };
  }

  // SEQUENCE Check
  const suit = firstNatural.suit;
  if (!naturalCards.every(c => c.suit === suit)) return null;

  let validSequence = false;
  let determinedStartRank = -1;

  let firstNaturalRank = getRank(firstNatural.value);
  let firstNaturalIndex = runCards.indexOf(firstNatural);
  
  let startRankCandidate = firstNaturalRank - firstNaturalIndex;
  
  let match = true;
  for (let i = 0; i < runCards.length; i++) {
      const c = runCards[i];
      const expectedRank = startRankCandidate + i;
      
      // Check Bounds: Min 3, Max 14
      if (expectedRank < 3 || expectedRank > 14) {
          match = false;
          break;
      }

      if (!c.isWild) {
          if (getRank(c.value) !== expectedRank) {
              match = false;
              break;
          }
      }
  }
  
  if (match) {
      validSequence = true;
      determinedStartRank = startRankCandidate;
  }

  if (validSequence) {
      return {
          type: 'SEQUENCE',
          suit,
          cards: runCards.map((c, i) => ({
              card: c,
              representedRank: determinedStartRank + i,
              representedSuit: suit
          }))
      };
  }

  return null;
}

export type AddToRunResult = 
  | { type: 'INVALID'; reason: string }
  | { type: 'EXTEND'; cards: CardDef[]; position: 'HEAD' | 'TAIL' | 'AMBIGUOUS'; headRank?: number; tailRank?: number } 
  | { type: 'REPLACE_FLYING'; cardToReturn: CardDef }
  | { type: 'REPLACE_STATIC'; displacedCard: CardDef; newPosition: 'HEAD' | 'TAIL' | 'AMBIGUOUS'; headRank?: number; tailRank?: number };

export function validateAddToRun(cardsToAdd: CardDef[], targetRun: Run): AddToRunResult {
  const context = inferRunContext(targetRun.cards);
  if (!context) return { type: 'INVALID', reason: 'Invalid run structure' };

  // SET Extension
  if (context.type === 'SET') {
      const rank = context.rank!;
      const allMatch = cardsToAdd.every(c => c.isWild || getRank(c.value) === rank);
      if (allMatch) {
          return { type: 'EXTEND', cards: cardsToAdd, position: 'TAIL' };
      }
  }

  // SEQUENCE Extension
  if (context.type === 'SEQUENCE') {
      const targetSuit = context.suit!;
      
      // Filter out non-matching naturals
      const validSuit = cardsToAdd.every(c => c.isWild || c.suit === targetSuit);
      if (!validSuit) return { type: 'INVALID', reason: 'Cards do not match run suit' };

      // 1. Single Card Replace Logic (Keep existing logic)
      if (cardsToAdd.length === 1) {
          const card = cardsToAdd[0];
          // Check for Replace first (if natural)
          if (!card.isWild) {
               for (const item of context.cards) {
                  if (item.card.isWild) {
                      const rankMatch = item.representedRank === getRank(card.value);
                      const suitMatch = item.representedSuit === card.suit;
                      
                      if (rankMatch && suitMatch) {
                          if (item.card.wildType === WildType.Flying) {
                              return { type: 'REPLACE_FLYING', cardToReturn: item.card };
                          } else if (item.card.wildType === WildType.Static) {
                              const canHead = canExtendSequence(context, 'HEAD');
                              const canTail = canExtendSequence(context, 'TAIL');
                              const headRank = context.cards[0].representedRank - 1;
                              const tailRank = context.cards[context.cards.length - 1].representedRank + 1;
                              
                              if (canHead && canTail) return { type: 'REPLACE_STATIC', displacedCard: item.card, newPosition: 'AMBIGUOUS', headRank, tailRank };
                              if (canHead) return { type: 'REPLACE_STATIC', displacedCard: item.card, newPosition: 'HEAD' };
                              if (canTail) return { type: 'REPLACE_STATIC', displacedCard: item.card, newPosition: 'TAIL' };
                              return { type: 'REPLACE_STATIC', displacedCard: item.card, newPosition: 'TAIL' };
                          }
                      }
                  }
              }
          }
      }

      // 2. Multi-card / Single-card Extend Logic
      // Try arranging the new cards to see if they form a valid block
      
      const candidate1 = arrangeRun(cardsToAdd, false);
      const candidate2 = arrangeRun(cardsToAdd, true);

      // Helper to check if a combined sequence is valid
      const checkCombined = (combined: CardDef[]) => {
          const c = inferRunContext(combined);
          return !!c && c.type === 'SEQUENCE' && c.cards.length === combined.length;
      };

      // Check TAIL Extension
      const tail1 = checkCombined([...targetRun.cards, ...candidate1]);
      const tail2 = checkCombined([...targetRun.cards, ...candidate2]);
      const canTail = tail1 || tail2;
      const cardsForTail = tail1 ? candidate1 : candidate2;

      // Check HEAD Extension
      const head1 = checkCombined([...candidate1, ...targetRun.cards]);
      const head2 = checkCombined([...candidate2, ...targetRun.cards]);
      const canHead = head1 || head2;
      const cardsForHead = head1 ? candidate1 : candidate2;

      if (canHead && canTail) {
          // Special ambiguity check
          const arrangedForHead = cardsForHead;
          const arrangedForTail = cardsForTail;
          
          const headRank = context.cards[0].representedRank - arrangedForHead.length;
          const tailRank = context.cards[context.cards.length-1].representedRank + arrangedForTail.length;
          
          return { 
              type: 'EXTEND', 
              cards: arrangedForHead, 
              position: 'AMBIGUOUS',
              headRank,
              tailRank
          };
      }

      if (canTail) return { type: 'EXTEND', cards: cardsForTail, position: 'TAIL' };
      if (canHead) return { type: 'EXTEND', cards: cardsForHead, position: 'HEAD' };
  }

  return { type: 'INVALID', reason: 'Does not fit run' };
}

function canExtendSequence(context: RunContext, end: 'HEAD' | 'TAIL'): boolean {
    if (context.type === 'SET') return true; 

    if (end === 'HEAD') return context.cards[0].representedRank > 3; 
    if (end === 'TAIL') return context.cards[context.cards.length - 1].representedRank < 14; 
    return false;
}

export function checkRunAmbiguity(cards: CardDef[]): 'NONE' | 'AMBIGUOUS_ENDS' {
    const wilds = cards.filter(c => c.isWild);
    const naturals = cards.filter(c => !c.isWild);

    if (naturals.length <= 1) return 'NONE'; 

    const firstRank = getRank(naturals[0].value);
    const isSet = naturals.every(c => getRank(c.value) === firstRank);
    if (isSet) return 'NONE';

    // Sequence check (Strict A=14)
    const sorted = [...naturals].sort((a, b) => getRank(a.value) - getRank(b.value));
    const gaps = calculateTotalGaps(sorted); 
    
    const neededWilds = gaps;
    const remaining = wilds.length - neededWilds;
    
    if (remaining <= 0) return 'NONE';

    // Check if can extend BOTH head and tail
    const minRank = getRank(sorted[0].value);
    const maxRank = getRank(sorted[sorted.length-1].value);
    
    const canHead = (minRank - remaining) >= 3; 
    const canTail = (maxRank + remaining) <= 14; 

    if (canHead && canTail) return 'AMBIGUOUS_ENDS';

    return 'NONE';
}

export function arrangeRun(cards: CardDef[], preferHead = false): CardDef[] {
  const wilds = cards.filter(c => c.isWild);
  const naturals = cards.filter(c => !c.isWild);

  if (naturals.length <= 1) {
    return [...naturals.sort((a, b) => getRank(a.value) - getRank(b.value)), ...wilds];
  }

  const firstRank = getRank(naturals[0].value);
  const isSet = naturals.every(c => getRank(c.value) === firstRank);

  if (isSet) {
    return [...naturals, ...wilds];
  }

  // SEQUENCE (Strict A=14)
  const sorted = [...naturals].sort((a, b) => getRank(a.value) - getRank(b.value));
  const result: CardDef[] = [];
  const availableWilds = [...wilds];
  
  for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      if (i < sorted.length - 1) {
          const currRank = getRank(sorted[i].value);
          const nextRank = getRank(sorted[i+1].value);
          const gap = Math.max(0, nextRank - currRank - 1);
          
          if (gap > 0) {
              for (let k = 0; k < gap; k++) {
                  if (availableWilds.length > 0) {
                      result.push(availableWilds.shift()!);
                  }
              }
          }
      }
  }
  
  // Append remaining
  if (availableWilds.length > 0) {
      // Smart Auto-detection logic for forced direction
      const minRank = getRank(sorted[0].value);
      const maxRank = getRank(sorted[sorted.length-1].value);
      const remaining = availableWilds.length;
      
      const canHead = (minRank - remaining) >= 3;
      const canTail = (maxRank + remaining) <= 14;
      
      if (canHead && !canTail) {
          return [...availableWilds, ...result];
      }
      
      if (!canHead && canTail) {
          return [...result, ...availableWilds];
      }
      
      if (preferHead) {
          return [...availableWilds, ...result];
      }
  }
  
  return [...result, ...availableWilds];
}

function calculateTotalGaps(sortedCards: CardDef[]): number {
    let gaps = 0;
    for (let i = 0; i < sortedCards.length - 1; i++) {
        const r1 = getRank(sortedCards[i].value);
        const r2 = getRank(sortedCards[i+1].value);
        const diff = r2 - r1;
        if (diff > 0) gaps += (diff - 1);
        else gaps += 100; 
    }
    return gaps;
}

export interface RunStructure {
  active: {
    card: CardDef;
    representedRank: number;
    representedSuit: Suit;
  }[];
  excess: CardDef[];
  type: 'SET' | 'SEQUENCE';
}

export function analyzeRunStructure(cards: CardDef[]): RunStructure | null {
  let bestContext: RunContext | null = null;
  let bestStart = 0;
  let bestEnd = 0;

  // Find the longest valid sub-segment
  for (let start = 0; start < cards.length; start++) {
    for (let end = start + 3; end <= cards.length; end++) {
      const subset = cards.slice(start, end);
      const context = inferRunContext(subset);
      if (context) {
        if (!bestContext || subset.length > (bestEnd - bestStart)) {
          bestContext = context;
          bestStart = start;
          bestEnd = end;
        }
      }
    }
  }

  if (bestContext) {
    return {
      active: bestContext.cards,
      excess: [...cards.slice(0, bestStart), ...cards.slice(bestEnd)],
      type: bestContext.type
    };
  }

  return null;
}

export function applyRepresentations(cards: CardDef[]): CardDef[] {
  const context = inferRunContext(cards);
  if (!context) return cards;

  return context.cards.map(item => {
    if (item.card.isWild) {
      return {
        ...item.card,
        represents: {
          value: REVERSE_RANK[item.representedRank],
          suit: item.representedSuit
        }
      };
    }
    // For natural cards, ensure represents is cleared if it was somehow set
    const { represents, ...rest } = item.card;
    return rest;
  });
}