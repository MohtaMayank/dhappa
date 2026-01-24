
import React from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface DrawCardOverlayProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  revealedCard: CardDef | null;
}

const DrawCardOverlay: React.FC<DrawCardOverlayProps> = ({ isOpen, onConfirm, onCancel, revealedCard }) => {
  if (!isOpen && !revealedCard) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="relative w-full max-w-xs overflow-hidden">
        {/* State 1: Confirmation Request */}
        {isOpen && !revealedCard && (
          <div className="bg-emerald-950 border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center shadow-inner">
               <i className="fa-solid fa-dharmachakra text-white/40 text-2xl animate-spin-slow"></i>
            </div>
            <div className="text-center">
              <h3 className="text-white font-black uppercase tracking-widest mb-1">Draw Card?</h3>
              <p className="text-[10px] text-white/40 italic">Take the top card from the deck.</p>
            </div>
            <div className="flex w-full gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)]"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* State 2: Reveal the drawn card */}
        {revealedCard && (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in-75 duration-500">
            <div className="relative">
              {/* Pulsing glow background */}
              <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
              
              <div className="relative z-10 transition-transform duration-1000">
                <CardBase 
                  card={revealedCard} 
                  isFirst={true} 
                  className="!w-28 !h-40 sm:!w-32 !sm:h-48 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-white/20 scale-110"
                />
              </div>
            </div>

            <div className="text-center relative z-20">
              <h2 className="text-yellow-400 font-black text-xl uppercase tracking-[0.2em] drop-shadow-lg animate-bounce">
                YOU DREW
              </h2>
              <p className="text-white/60 font-bold text-xs uppercase tracking-widest mt-1">
                Adding to hand...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawCardOverlay;
