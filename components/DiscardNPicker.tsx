
import React, { useState } from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface DiscardNPickerProps {
  pile: CardDef[];
  onPick: (n: number) => void;
  onClose: () => void;
  canPick: boolean;
  isValidPick?: (n: number) => boolean;
}

const DiscardNPicker: React.FC<DiscardNPickerProps> = ({ pile, onPick, onClose, canPick, isValidPick }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const numFromTop = selectedIdx !== null ? pile.length - selectedIdx : 0;
  const isCurrentlyValid = selectedIdx !== null && (!isValidPick || isValidPick(numFromTop));

  const handlePick = () => {
    if (canPick && isCurrentlyValid && selectedIdx !== null) {
      onPick(numFromTop);
    }
  };

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

        <div className="flex-1 overflow-x-auto overflow-y-visible pt-16 pb-10 px-4 scrollbar-hide">
          <div className="flex flex-row justify-center min-w-max">
            {pile.map((card, idx) => {
              const currentNumFromTop = pile.length - idx;
              const isHovered = hoverIdx !== null && idx >= hoverIdx;
              const isSelected = selectedIdx !== null && idx >= selectedIdx;
              
              return (
                <div 
                  key={card.id}
                  className={`ml-[-20px] transition-all duration-300 relative ${isHovered || isSelected ? '-translate-y-4 scale-110 z-50' : 'hover:-translate-y-2'}`}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <CardBase 
                    card={card} 
                    isFirst={true} 
                    className={`${isSelected ? 'ring-2 ring-yellow-400 shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : ''} ${isHovered && !isSelected ? 'ring-2 ring-white/50' : ''}`} 
                  />
                  
                  {(isHovered || isSelected) && (
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 ${isSelected ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'} text-[9px] font-black px-2 py-1 rounded-full whitespace-nowrap shadow-lg z-[60] border border-black/10`}>
                       {isSelected ? 'Selected' : 'Pick'} {currentNumFromTop} {currentNumFromTop === 1 ? 'Card' : 'Cards'}
                       <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${isSelected ? 'bg-yellow-400' : 'bg-white/20'} rotate-45 border-r border-b border-black/10`}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <button
            onClick={handlePick}
            disabled={!canPick || !isCurrentlyValid}
            className={`
              px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all
              ${canPick && isCurrentlyValid 
                ? 'bg-yellow-400 text-black hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(250,204,21,0.4)]' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
              }
            `}
          >
            {selectedIdx === null ? 'Select Cards to Pick' : isCurrentlyValid ? `Pick ${numFromTop} Cards` : 'Invalid Pick'}
          </button>

          {!canPick && (
            <p className="text-center text-red-400 text-[10px] font-bold uppercase animate-pulse">
              Wait for your turn to pick from the pile
            </p>
          )}

          {canPick && selectedIdx !== null && !isCurrentlyValid && (
            <p className="text-center text-red-400 text-[10px] font-bold uppercase">
              Bottom card must be played immediately!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscardNPicker;
