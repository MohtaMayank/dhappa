
import React, { useMemo } from 'react';
import { CardDef, Run as RunType, Suit } from '../types';
import { SUIT_COLORS, SUIT_SYMBOLS } from '../constants';
import Run from './Run';

interface PlayerBoardProps {
  playerLabel: string;
  runs: RunType[];
  statusColor?: string;
  onInspectRun?: (cards: CardDef[]) => void;
}

// Map card values to numbers for sorting purposes
const CARD_VALUE_MAP: Record<string, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
};

const PlayerBoard: React.FC<PlayerBoardProps> = ({ 
  playerLabel, 
  runs, 
  statusColor = 'bg-emerald-400',
  onInspectRun
}) => {
  // Logic: Group by suit and sort rows by conventional order
  const groupedRuns = useMemo(() => {
    const groups: Record<Suit, RunType[]> = {
      [Suit.Hearts]: [],
      [Suit.Spades]: [],
      [Suit.Clubs]: [],
      [Suit.Diamonds]: []
    };

    // 1. Group runs by their primary suit (determined by the first card in the run)
    runs.forEach(run => {
      const suit = run.cards[0]?.suit;
      if (suit && groups[suit]) {
        groups[suit].push(run);
      }
    });

    // 2. Sort each suit group: Higher card runs to the left (descending order)
    Object.keys(groups).forEach((key) => {
      const suit = key as Suit;
      groups[suit].sort((a, b) => {
        const headA = a.cards[0];
        const headB = b.cards[0];
        
        const valA = headA ? (CARD_VALUE_MAP[headA.value] || 0) : 0;
        const valB = headB ? (CARD_VALUE_MAP[headB.value] || 0) : 0;
        
        // Return descending: higher values first
        return valB - valA;
      });
    });

    return groups;
  }, [runs]);

  const suitOrder = [Suit.Hearts, Suit.Spades, Suit.Clubs, Suit.Diamonds];

  return (
    <section className="flex-1 flex flex-col min-h-0 border-b border-white/5 last:border-b-0">
      <header className="bg-black/20 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2 border-b border-white/10 shrink-0">
        <div className={`w-1.5 h-1.5 rounded-full ${statusColor} shadow-sm shadow-black/50`}></div>
        <h2 className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
          {playerLabel}
        </h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
        {suitOrder.map((suit) => {
          const suitRuns = groupedRuns[suit];
          if (suitRuns.length === 0) return null;

          return (
            <div key={suit} className="flex items-start gap-1">
              {/* Vertical Suit Icon Column */}
              <div className="w-5 shrink-0 flex flex-col items-center pt-2.5">
                <span className={`${SUIT_COLORS[suit]} text-xl font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]`}>
                  {SUIT_SYMBOLS[suit]}
                </span>
              </div>
              
              {/* Horizontal Row of Runs for this suit */}
              <div className="flex-1 flex flex-wrap items-center gap-y-2">
                {suitRuns.map((run, idx) => (
                  <div key={run.id} className="flex items-center">
                    <Run 
                      data={run.cards} 
                      onInspect={onInspectRun}
                    />
                    {idx < suitRuns.length - 1 && (
                      <div className="mx-2 h-8 w-[1px] bg-white/10 self-center"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PlayerBoard;
