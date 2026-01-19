
import React from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface RunInspectorProps {
  cards: CardDef[] | null;
  onClose: () => void;
}

const RunInspector: React.FC<RunInspectorProps> = ({ cards, onClose }) => {
  if (!cards) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-emerald-950/40 rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
        
        <div className="relative z-10">
          <header className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-emerald-200 uppercase tracking-widest">
              Run Inspection
            </h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </header>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 overflow-y-auto max-h-[60vh] py-2 scrollbar-hide">
            {cards.map((card, idx) => (
              <div 
                key={idx} 
                className="animate-in zoom-in-95 fade-in duration-300 fill-mode-both"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <CardBase 
                  card={card} 
                  isStacked={false} 
                  className="!w-14 !h-20 sm:!w-16 sm:!h-24 shadow-xl"
                  isFirst={true} // In inspection, show all symbols clearly
                />
              </div>
            ))}
          </div>

          <footer className="mt-8 text-center">
            <p className="text-[10px] text-emerald-300/40 uppercase tracking-tighter">
              {cards.length} Cards Total • Tap anywhere to close
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RunInspector;
