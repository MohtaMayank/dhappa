import React from 'react';
import { CardDef } from '../types';
import { REVERSE_RANK } from '../gameLogic';
import CardBase from './CardBase';
import Run from './Run';

interface AmbiguityModalProps {
  isOpen: boolean;
  type?: 'CREATE_RUN' | 'ADD_TO_RUN';
  onResolve: (direction: 'HEAD' | 'TAIL') => void;
  onCancel: () => void;
  displacedCard?: CardDef;
  headRank?: number;
  tailRank?: number;
  runCards?: CardDef[];
}

const AmbiguityModal: React.FC<AmbiguityModalProps> = ({ 
  isOpen, 
  type = 'ADD_TO_RUN', 
  onResolve, 
  onCancel, 
  displacedCard,
  headRank,
  tailRank,
  runCards
}) => {
  if (!isOpen) return null;

  const isCreate = type === 'CREATE_RUN';
  const title = isCreate ? "Ambiguous Wild Placement" : "Where should the Wild go?";
  const description = isCreate 
      ? "The Wild Card(s) can be placed at either the start or end of this sequence. Please choose which card they should represent."
      : "You are displacing a Static Wild (2). It can move to either end of the run.";

  const headLabel = headRank ? REVERSE_RANK[headRank] || headRank.toString() : 'Left';
  const tailLabel = tailRank ? REVERSE_RANK[tailRank] || tailRank.toString() : 'Right';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-emerald-950 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 animate-bounce">
                <i className="fa-solid fa-question text-yellow-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">{title}</h3>
            <p className="text-xs text-white/60">
                {description}
            </p>
        </div>

        {runCards && (
            <div className="flex justify-center py-2 overflow-x-auto max-w-full">
                {/* We reverse here because UI expects descending (High to Low) */}
                <Run data={[...runCards].reverse()} />
            </div>
        )}

        {displacedCard && (
            <div className="flex flex-col items-center gap-2">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Displaced Wild:</span>
                <div className="scale-75">
                    <CardBase card={displacedCard} />
                </div>
            </div>
        )}

        <div className="flex gap-3">
          {/* Tail is Higher in descending UI, so it goes on Left */}
          <button 
            onClick={() => onResolve('TAIL')}
            className="flex-1 py-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all group"
          >
             <i className="fa-solid fa-arrow-left text-emerald-400 group-hover:-translate-x-1 transition-transform"></i>
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{tailLabel}</span>
          </button>

          {/* Head is Lower in descending UI, so it goes on Right */}
          <button 
            onClick={() => onResolve('HEAD')}
            className="flex-1 py-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all group"
          >
             <i className="fa-solid fa-arrow-right text-emerald-400 group-hover:translate-x-1 transition-transform"></i>
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{headLabel}</span>
          </button>
        </div>

        <button 
            onClick={onCancel}
            className="text-[9px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest text-center"
        >
            Cancel Action
        </button>

      </div>
    </div>
  );
};

export default AmbiguityModal;