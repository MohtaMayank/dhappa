import { Suit, WildType, CardDef } from '../types';
import { generateId } from '../constants';

export const getDeck = (): CardDef[] => {
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
      suit: Suit.Spades, // Placeholder
      isWild: true,
      wildType: WildType.Flying
    });
  }
  
  return deck;
};

export const shuffle = (cards: CardDef[]): CardDef[] => {
    return [...cards].sort(() => Math.random() - 0.5);
};

export const seededShuffle = (cards: CardDef[], seed: number = 12345): CardDef[] => {
  const result = [...cards];
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const pluckCard = (deck: CardDef[], value: string, suit: Suit): CardDef | undefined => {
    const idx = deck.findIndex(c => c.value === value && c.suit === suit);
    if (idx !== -1) {
        return deck.splice(idx, 1)[0];
    }
    return undefined;
};

export const pluckAnyCard = (deck: CardDef[]): CardDef | undefined => {
    return deck.pop();
}
