
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
  id: string;
  value: string; // A, K, Q, J, 10-2, Jo
  suit: Suit;
  isWild?: boolean;
  wildType?: WildType;
  represents?: {
    value: string;
    suit: Suit;
  };
}

export interface Run {
  id: string;
  cards: CardDef[];
  isPure: boolean; // No wildcards
  isSet: boolean; // Three of a kind (3s or Aces)
}

export enum Team {
  A = 'Team A',
  B = 'Team B'
}

export interface Player {
  id: string;
  name: string;
  team: Team;
  hand: CardDef[];
  runs: Run[];
  hasOpened: boolean;
  isAI?: boolean;
}

export type GamePhase = 'draw' | 'play' | 'discard';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  drawPile: CardDef[];
  discardPile: CardDef[];
  phase: GamePhase;
  selectedInHand: Set<string>;
  nPickPreview: number | null;
  lastDrawnCard: CardDef | null;
  isNPickActive: boolean;
  isConfirmingDraw: boolean;
}
