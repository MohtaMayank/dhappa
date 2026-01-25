
import React, { useMemo } from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';
import { analyzeRunStructure, REVERSE_RANK } from '../gameLogic';

interface RunInspectorProps {
  cards: CardDef[] | null;
  onClose: () => void;
}

const RunInspector: React.FC<RunInspectorProps> = ({ cards, onClose }) => {
  if (!cards) return null;

  const structure = useMemo(() => analyzeRunStructure(cards), [cards]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-emerald-900 rounded-2xl border border-emerald-500/20 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-emerald-100 uppercase tracking-widest">
                Run Inspection
              </h3>
              {structure && (
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {structure.type}
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-emerald-100 transition-colors border border-white/5"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </header>

          <div className="flex flex-col gap-8 overflow-y-auto max-h-[70vh] py-2 scrollbar-hide">
            
            {/* Active Sequence */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">
                Active Sequence
              </h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {structure ? (
                  structure.active.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="relative animate-in zoom-in-95 fade-in duration-300 fill-mode-both group"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <CardBase 
                        card={item.card} 
                        isStacked={false} 
                        className="!w-14 !h-20 sm:!w-16 sm:!h-24 shadow-xl"
                        isFirst={true} 
                      />
                      {/* Wildcard Indicator */}
                      {item.card.isWild && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-emerald-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg border border-white/20 z-10 flex items-center gap-1">
                          <span>{REVERSE_RANK[item.representedRank]}</span>
                          <i className={`fa-solid fa-${item.representedSuit === 'H' ? 'heart' : item.representedSuit === 'D' ? 'diamond' : item.representedSuit === 'C' ? 'clover' : 'play rotate-[-90deg]'}`}></i>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback if structure analysis fails (shouldn't happen for valid runs)
                  cards.map((card, idx) => (
                     <CardBase key={idx} card={card} isStacked={false} className="!w-14 !h-20 shadow-xl" />
                  ))
                )}
              </div>
            </div>

            {/* Excess Cards */}
            {structure && structure.excess.length > 0 && (
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black text-orange-300/60 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <i className="fa-solid fa-link-slash"></i>
                  Unused / Attached
                </h4>
                <div className="flex flex-wrap gap-2 sm:gap-3 opacity-80">
                  {structure.excess.map((card, idx) => (
                    <div 
                      key={`excess-${idx}`} 
                      className="relative animate-in zoom-in-95 fade-in duration-300 fill-mode-both grayscale-[0.3]"
                      style={{ animationDelay: `${(structure.active.length + idx) * 40}ms` }}
                    >
                       <CardBase 
                        card={card} 
                        isStacked={false} 
                        className="!w-14 !h-20 sm:!w-16 sm:!h-24 shadow-lg border-orange-500/30"
                        isFirst={true} 
                      />
                      <div className="absolute inset-0 bg-black/10 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="mt-auto pt-4 text-center border-t border-white/5">
            <p className="text-[10px] text-emerald-300/30 uppercase tracking-tighter">
              Tap outside to close
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RunInspector;
