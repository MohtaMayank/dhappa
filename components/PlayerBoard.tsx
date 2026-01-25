import React from 'react';
import { Player, Run as RunType, Suit, CardDef } from '../types';
import { SUIT_COLORS, SUIT_SYMBOLS } from '../constants';
import { getRank } from '../gameLogic';
import Run from './Run';

interface PlayerBoardProps {
  players: Player[];
  onRunClick?: (run: RunType) => void;
  isSelectingMode?: boolean;
  getRunValidity?: (run: RunType) => boolean;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ 
  players, 
  onRunClick,
  isSelectingMode,
  getRunValidity
}) => {
  const suitOrder = [Suit.Hearts, Suit.Spades, Suit.Clubs, Suit.Diamonds];

  // Helper to get value of run for sorting
  // Logic: Max rank in run. Since store uses Ascending order, Max is last card (or wild at end).
  // But wilds might be at end. Let's find max natural rank?
  // If run is pure wild (rare/impossible), use 0.
  const getRunValue = (run: RunType): number => {
      const naturals = run.cards.filter(c => !c.isWild);
      if (naturals.length === 0) return 0;
      // In Ascending sort, last natural is highest
      return Math.max(...naturals.map(c => getRank(c.value)));
  };

  return (
    <section className="flex flex-col gap-10 md:gap-4 py-4">
      {players.map((player) => {
        const hasRuns = player.runs.length > 0;
        
        return (
          <div key={player.id} className="flex flex-col gap-4 md:gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <header className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3 py-1 bg-white/5 rounded-r-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${player.team === 'Team A' ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-lg border border-white/20`}>
                {player.name[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{player.name}</span>
                <span className={`text-[7px] font-bold uppercase tracking-widest ${player.hasOpened ? 'text-emerald-400' : 'text-white/30'}`}>
                  {player.hasOpened ? 'OPENED' : 'NOT OPENED'}
                </span>
              </div>
            </header>

            {!hasRuns ? (
              <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest ml-11 md:ml-8 italic">No runs played yet</p>
            ) : (
              <div className="ml-11 md:ml-8">
                {/* Mobile View: Grouped by Suit */}
                <div className="flex flex-col gap-6 md:hidden">
                    {suitOrder.map((suit) => {
                    let suitRuns = player.runs.filter(r => r.cards[0]?.suit === suit || r.cards[0]?.represents?.suit === suit);
                    if (suitRuns.length === 0) return null;

                    suitRuns = suitRuns.sort((a, b) => getRunValue(b) - getRunValue(a));

                    return (
                        <div key={suit} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 opacity-40">
                            <span className={`${SUIT_COLORS[suit]} text-xs`}>{SUIT_SYMBOLS[suit]}</span>
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">{suit} SEQUENCE</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {suitRuns.map((run) => {
                            const isValid = isSelectingMode && getRunValidity ? getRunValidity(run) : true;
                            const opacityClass = isSelectingMode 
                                ? (isValid ? 'ring-2 ring-emerald-400 animate-pulse cursor-pointer' : 'opacity-20 grayscale pointer-events-none') 
                                : 'hover:scale-105 transition-transform';

                            // Strict Descending Sort
                            const displayCards = [...run.cards].sort((a,b) => getRank(b.value) - getRank(a.value));

                            return (
                                <Run 
                                key={run.id} 
                                data={displayCards} 
                                label={run.isPure ? "PURE" : "MIXED"}
                                onClick={() => onRunClick?.(run)}
                                className={opacityClass}
                                />
                            );
                            })}
                        </div>
                        </div>
                    );
                    })}
                </div>

                {/* Desktop View: Flat List */}
                <div className="hidden md:flex flex-wrap gap-3">
                    {player.runs
                        .sort((a, b) => getRunValue(b) - getRunValue(a))
                        .map((run) => {
                            const isValid = isSelectingMode && getRunValidity ? getRunValidity(run) : true;
                            const opacityClass = isSelectingMode 
                                ? (isValid ? 'ring-2 ring-emerald-400 animate-pulse cursor-pointer' : 'opacity-20 grayscale pointer-events-none') 
                                : 'hover:scale-105 transition-transform';

                            // Strict Descending Sort
                            const displayCards = [...run.cards].sort((a,b) => getRank(b.value) - getRank(a.value));

                            return (
                                <Run 
                                key={run.id} 
                                data={displayCards} 
                                label={run.isPure ? "PURE" : "MIXED"}
                                onClick={() => onRunClick?.(run)}
                                className={opacityClass}
                                />
                            );
                        })
                    }
                </div>
              </div>
            )}
          </div>
        );
      })}

      {players.every(p => p.runs.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 opacity-20">
          <i className="fa-solid fa-layer-group text-4xl mb-4"></i>
          <p className="text-xs font-black uppercase tracking-widest">The table is empty</p>
        </div>
      )}
    </section>
  );
};

export default PlayerBoard;