
export enum Suit {
  Hearts = 'H',
  Spades = 'S',
  Clubs = 'C',
  Diamonds = 'D'
}

export enum WildType {
  Static = 'W2',
  Flying = 'WJo'
}

export interface CardDef {
  value: string; // A, K, Q, J, 10-2, Jo
  suit: Suit;
  isWild?: boolean;
  wildType?: WildType;
  represents?: CardDef; // What it is substituting for
}

export interface Run {
  id: string;
  name: string;
  cards: CardDef[];
}
