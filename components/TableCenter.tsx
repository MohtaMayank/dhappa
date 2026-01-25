
import React from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface TableCenterProps {
  drawPileCount: number;
  discardPile: CardDef[];
  onDraw: () => void;
  onOpenDiscard: () => void;
  isPlayerTurn: boolean;
  phase: string;
}

const TableCenter: React.FC<TableCenterProps> = ({ 
  drawPileCount, 
  discardPile, 
  onDraw, 
  onOpenDiscard,
  isPlayerTurn,
  phase
}) => {
  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="flex items-center gap-6 sm:gap-12 md:gap-16 relative z-20">
      {/* Draw Pile */}
      <div className="flex flex-col items-center gap-1 group">
        <div 
          onClick={isPlayerTurn && phase === 'draw' ? onDraw : undefined}
          className={`relative w-11 h-14 sm:w-13 sm:h-18 md:w-16 md:h-24 rounded-md border-2 border-emerald-950 bg-emerald-800 shadow-2xl cursor-pointer transition-all active:scale-95 ${isPlayerTurn && phase === 'draw' ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-emerald-900 animate-pulse' : ''}`}
        >
          {/* Deck Back Texture */}
          <div className="absolute inset-1 border border-white/20 rounded-sm bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center">
             <i className="fa-solid fa-dharmachakra text-white/20 text-xl animate-spin-slow"></i>
          </div>
          {/* Stack effect */}
          <div className="absolute top-1 -right-1 w-full h-full bg-emerald-950 rounded-md -z-10 shadow-sm"></div>
        </div>
        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{drawPileCount}</span>
      </div>

      {/* Discard Pile */}
      <div className="flex flex-col items-center gap-1 group">
        <div 
          onClick={onOpenDiscard}
          className={`relative w-11 h-14 sm:w-13 sm:h-18 md:w-16 md:h-24 rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95 ${isPlayerTurn && phase === 'draw' ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-emerald-900' : ''}`}
        >
          {topDiscard ? (
            <CardBase card={topDiscard} isFirst={true} />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-white/10 rounded-md flex items-center justify-center">
              <i className="fa-solid fa-ban text-white/10 text-xs"></i>
            </div>
          )}
          {/* Stack indicators */}
          {discardPile.length > 1 && (
             <div className="absolute -top-1 -left-1 w-full h-full bg-white/10 rounded-md -z-10 border border-white/5"></div>
          )}
        </div>
        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Discard ({discardPile.length})</span>
      </div>
    </div>
  );
};

export default TableCenter;
