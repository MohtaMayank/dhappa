
import React from 'react';
import { CardDef, Suit, WildType } from '../types';
import { SUIT_COLORS, SUIT_SYMBOLS } from '../constants';

interface CardBaseProps {
  card: CardDef;
  isStacked?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
  showRepresented?: boolean;
}

const CardBase: React.FC<CardBaseProps> = ({ 
  card, 
  isStacked, 
  isFirst, 
  isLast, 
  isSelected, 
  className = '', 
  onClick,
  showRepresented = true
}) => {
  const displaySuit = card.represents?.suit || card.suit;
  const displayValue = card.represents?.value || card.value;
  const colorClass = SUIT_COLORS[displaySuit];
  const symbol = SUIT_SYMBOLS[displaySuit];
  
  const isWild = card.isWild;
  const isStatic = card.wildType === WildType.Static;

  const bgClass = isWild 
    ? (isStatic ? 'bg-blue-50 border-blue-400' : 'bg-purple-50 border-purple-400')
    : 'bg-white border-slate-300';

  const selectionClass = isSelected 
    ? 'ring-2 ring-yellow-400 -translate-y-2 z-50 shadow-xl' 
    : 'shadow-md';

  return (
    <div 
      onClick={onClick}
      className={`relative w-11 h-14 sm:w-13 sm:h-18 rounded-md border-[1.5px] ${bgClass} ${selectionClass} ${className} transition-all duration-200 cursor-pointer overflow-hidden flex flex-col`}
    >
      {/* Corner Value/Suit */}
      <div className={`flex flex-col items-start leading-none p-0.5 z-10 ${colorClass}`}>
        <span className="text-[10px] sm:text-xs font-black tracking-tighter uppercase">
          {displayValue === 'Jo' ? 'J' : displayValue}
        </span>
        <span className="text-[8px] sm:text-[10px] -mt-0.5">
          {displayValue === 'Jo' ? '★' : symbol}
        </span>
      </div>

      {/* Center Symbol / Representation */}
      <div className={`flex-1 flex items-center justify-center ${colorClass} transition-opacity`}>
        {isWild ? (
           <div className="flex flex-col items-center">
             <i className={`fa-solid ${isStatic ? 'fa-thumbtack' : 'fa-bolt-lightning'} text-[10px] mb-0.5 opacity-40`}></i>
             <span className="text-[14px] sm:text-lg opacity-80">{symbol}</span>
           </div>
        ) : (
          <span className="text-lg sm:text-xl opacity-20">{symbol}</span>
        )}
      </div>

      {/* Wild indicators */}
      {isWild && (
        <div className={`absolute bottom-0 right-0 left-0 h-1.5 ${isStatic ? 'bg-blue-500' : 'bg-purple-500'} flex items-center justify-center`}>
          <span className="text-[6px] text-white font-black uppercase tracking-tighter">
            {isStatic ? 'STATIC' : 'FLYING'}
          </span>
        </div>
      )}

      {/* Stacked effect: only show corner */}
      {isStacked && !isLast && (
        <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
      )}
    </div>
  );
};

export default CardBase;
