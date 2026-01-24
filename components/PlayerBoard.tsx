
import React from 'react';
import { Player, Run as RunType, Suit } from '../types';
import { SUIT_COLORS, SUIT_SYMBOLS } from '../constants';
import Run from './Run';

interface PlayerBoardProps {
  players: Player[];
  onRunClick?: (runId: string) => void;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ 
  players, 
  onRunClick 
}) => {
  const suitOrder = [Suit.Hearts, Suit.Spades, Suit.Clubs, Suit.Diamonds];

  return (
    <section className="flex flex-col gap-10 py-4">
      {players.map((player) => {
        const hasRuns = player.runs.length > 0;
        
        return (
          <div key={player.id} className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
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
              <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest ml-11 italic">No runs played yet</p>
            ) : (
              <div className="flex flex-col gap-6 ml-11">
                {suitOrder.map((suit) => {
                  const suitRuns = player.runs.filter(r => r.cards[0]?.suit === suit || r.cards[0]?.represents?.suit === suit);
                  if (suitRuns.length === 0) return null;

                  return (
                    <div key={suit} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 opacity-40">
                        <span className={`${SUIT_COLORS[suit]} text-xs`}>{SUIT_SYMBOLS[suit]}</span>
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">{suit} SEQUENCE</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {suitRuns.map((run) => (
                          <Run 
                            key={run.id} 
                            data={run.cards} 
                            label={run.isPure ? "PURE" : "MIXED"}
                            onClick={() => onRunClick?.(run.id)}
                            className="hover:scale-105 transition-transform"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
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
