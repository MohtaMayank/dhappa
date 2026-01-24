
import React, { useState } from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface DiscardNPickerProps {
  pile: CardDef[];
  onPick: (n: number) => void;
  onClose: () => void;
  canPick: boolean;
}

const DiscardNPicker: React.FC<DiscardNPickerProps> = ({ pile, onPick, onClose, canPick }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-emerald-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-2 max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Discard Pile History</h3>
            <p className="text-[10px] text-white/40 italic">Pick any card to take it and everything on top of it.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        {/* 
          Increased pt-16 to provide enough space for the -translate-y-4 (hover) 
          plus the -top-10 tooltip without clipping.
        */}
        <div className="flex-1 overflow-x-auto overflow-y-visible pt-16 pb-10 px-4 scrollbar-hide">
          <div className="flex flex-row justify-center min-w-max">
            {pile.map((card, idx) => {
              const numFromTop = pile.length - idx;
              const isSelected = hoverIdx !== null && idx >= hoverIdx;
              
              return (
                <div 
                  key={card.id}
                  className={`ml-[-20px] transition-all duration-300 relative ${isSelected ? '-translate-y-4 scale-110 z-50' : 'hover:-translate-y-2'}`}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => canPick && onPick(numFromTop)}
                >
                  <CardBase card={card} isFirst={true} className={isSelected ? 'ring-2 ring-yellow-400 shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : ''} />
                  
                  {isSelected && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-full whitespace-nowrap shadow-lg z-[60] border border-black/10">
                       Pick {numFromTop} {numFromTop === 1 ? 'Card' : 'Cards'}
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rotate-45 border-r border-b border-black/10"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!canPick && (
          <p className="text-center text-red-400 text-[10px] font-bold uppercase animate-pulse mt-2">
            Wait for your turn to pick from the pile
          </p>
        )}
      </div>
    </div>
  );
};

export default DiscardNPicker;
