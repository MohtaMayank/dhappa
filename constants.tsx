
import React from 'react';
import { Suit, WildType, CardDef } from './types';

export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.Hearts]: 'text-red-600',
  [Suit.Diamonds]: 'text-red-600',
  [Suit.Spades]: 'text-black',
  [Suit.Clubs]: 'text-black',
};

export const SUIT_SYMBOLS: Record<Suit, React.ReactNode> = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Spades]: '♠',
  [Suit.Clubs]: '♣',
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseCardString = (s: string): CardDef => {
  const trimmed = s.trim();
  const id = generateId();
  if (trimmed.includes('->')) {
    const [wildStr, targetStr] = trimmed.split('->');
    const wildType = wildStr.trim() === 'W2' ? WildType.Static : WildType.Flying;
    const target = parseCardString(targetStr.trim());
    return {
      ...target,
      id,
      isWild: true,
      wildType,
      represents: target
    };
  }

  const suitChar = trimmed.slice(-1) as Suit;
  const value = trimmed.slice(0, -1);
  return { id, value, suit: suitChar };
};

export const parseRunString = (s: string): CardDef[] => {
  return s.split(',').map(item => parseCardString(item));
};

export const createDeck = (): CardDef[] => {
  const suits = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
  const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const deck: CardDef[] = [];
  
  // 3 standard decks
  for (let i = 0; i < 3; i++) {
    suits.forEach(suit => {
      values.forEach(val => {
        deck.push({
          id: generateId(),
          value: val,
          suit,
          isWild: val === '2',
          wildType: val === '2' ? WildType.Static : undefined
        });
      });
    });
  }
  
  // 6 Jokers
  for (let i = 0; i < 6; i++) {
    deck.push({
      id: generateId(),
      value: 'Jo',
      suit: Suit.Spades, // Just a placeholder
      isWild: true,
      wildType: WildType.Flying
    });
  }
  
  return deck.sort(() => Math.random() - 0.5);
};

/**
 * Sorts hand based on game rules:
 * 1. Natural cards first, Wilds (2, Jo) last.
 * 2. Natural suits: Spades, Hearts, Clubs, Diamonds.
 * 3. Natural ranks: Ace (high) to 3 (low).
 */
export const sortHand = (cards: CardDef[]): CardDef[] => {
  const suitOrder = { [Suit.Spades]: 0, [Suit.Hearts]: 1, [Suit.Clubs]: 2, [Suit.Diamonds]: 3 };
  const rankOrder: Record<string, number> = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3
  };

  return [...cards].sort((a, b) => {
    // 1. Wilds check (Value 2 or Jo are considered wild for hand sorting)
    const isAWild = a.value === '2' || a.value === 'Jo';
    const isBWild = b.value === '2' || b.value === 'Jo';

    if (isAWild && !isBWild) return 1;
    if (!isAWild && isBWild) return -1;
    
    // Both are wilds: Sort 2s before Jokers
    if (isAWild && isBWild) {
      if (a.value === '2' && b.value === 'Jo') return -1;
      if (a.value === 'Jo' && b.value === '2') return 1;
      return 0;
    }

    // 2. Suit Order: Spades > Hearts > Clubs > Diamonds
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }

    // 3. Rank Order: Largest to Smallest
    return (rankOrder[b.value] || 0) - (rankOrder[a.value] || 0);
  });
};
