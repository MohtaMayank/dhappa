
import React from 'react';
import { Suit, WildType, CardDef } from './types';

export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.Hearts]: 'text-red-600',
  [Suit.Diamonds]: 'text-red-600',
  [Suit.Spades]: 'text-black', // True black for high contrast
  [Suit.Clubs]: 'text-black',  // True black for high contrast
};

export const SUIT_SYMBOLS: Record<Suit, React.ReactNode> = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Spades]: '♠',
  [Suit.Clubs]: '♣',
};

// Simple parser for the format: AC, 10S, W2->9S, WJo->JS
export const parseCardString = (s: string): CardDef => {
  const trimmed = s.trim();
  if (trimmed.includes('->')) {
    const [wildStr, targetStr] = trimmed.split('->');
    const wildType = wildStr.trim() === 'W2' ? WildType.Static : WildType.Flying;
    const target = parseCardString(targetStr.trim());
    return {
      ...target,
      isWild: true,
      wildType,
      represents: target
    };
  }

  const suitChar = trimmed.slice(-1) as Suit;
  const value = trimmed.slice(0, -1);
  return { value, suit: suitChar };
};

export const parseRunString = (s: string): CardDef[] => {
  return s.split(',').map(item => parseCardString(item));
};
