
import React from 'react';
import { CardDef, Suit, WildType } from '../types';
import { SUIT_COLORS, SUIT_SYMBOLS } from '../constants';

interface CardBaseProps {
  card: CardDef;
  isStacked?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
  onClick?: () => void;
}

const CardBase: React.FC<CardBaseProps> = ({ card, isStacked, isFirst, isLast, className = '', onClick }) => {
  const colorClass = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const isStatic = card.wildType === WildType.Static;

  const renderWildTopBadge = () => {
    if (!card.isWild) return null;
    return (
      <div className={`absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full border border-white shadow-sm text-[8px] font-black text-white z-20 ${isStatic ? 'bg-blue-600' : 'bg-purple-600'}`}>
        {isStatic ? '2' : 'J'}
      </div>
    );
  };

  const renderWildBottomLeftBadge = () => {
    if (!card.isWild) return null;
    return (
      <div className={`absolute bottom-0 left-0 w-4 h-3.5 flex items-center justify-center z-30 rounded-tr-sm shadow-sm border-t border-r border-white/20 ${isStatic ? 'bg-blue-700 text-white' : 'bg-purple-700 text-white'}`}>
        <span className="text-[7px] font-black leading-none uppercase">
          {isStatic ? '2' : 'Jo'}
        </span>
      </div>
    );
  };
  
  const borderClass = card.isWild 
    ? (isStatic ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-purple-500 ring-1 ring-purple-500/30')
    : 'border-slate-800';

  const bgClass = card.isWild 
    ? (isStatic ? 'bg-blue-50' : 'bg-purple-50')
    : 'bg-white';

  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col w-11 h-14 sm:w-13 sm:h-18 rounded-md border-[1.5px] ${isStacked ? 'shadow-sm' : 'shadow-lg'} ${borderClass} ${bgClass} ${className} transition-transform active:scale-95 cursor-pointer overflow-hidden`}
    >
      {/* Index Group (Top Left) - Optimized with larger text for high-density runs */}
      <div className={`flex flex-col items-start leading-none mt-0 ml-0.5 self-start z-10 w-4 sm:w-5 ${colorClass}`}>
        <span className="text-[11px] sm:text-sm font-black tracking-tighter uppercase leading-none text-left w-full">
          {card.value}
        </span>
        <span className="text-[9px] sm:text-[11px] mt-[-1px] font-bold text-left w-full pl-[1px]">
          {symbol}
        </span>
      </div>

      {/* Center Large Symbol - Opaque if first or last card */}
      <div className={`flex-1 flex items-center justify-center ${colorClass} ${(isFirst || isLast) ? 'opacity-100' : (isStacked ? 'opacity-5' : 'opacity-20')} text-xl sm:text-2xl transition-opacity duration-300`}>
        {symbol}
      </div>

      {/* Top Right Circle Badge */}
      {renderWildTopBadge()}

      {/* Bottom Left Corner Badge */}
      {renderWildBottomLeftBadge()}

      {/* Subtle indicator in middle for full view */}
      {card.isWild && !isStacked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-40 pointer-events-none">
           <i className={`fa-solid ${isStatic ? 'fa-link' : 'fa-wand-sparkles'} text-[10px] ${isStatic ? 'text-blue-900' : 'text-purple-900'}`}></i>
        </div>
      )}
    </div>
  );
};

export default CardBase;
