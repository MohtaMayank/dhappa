
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
  variant?: 'standard' | 'compact';
}

const CardBase: React.FC<CardBaseProps> = ({ 
  card, 
  isStacked, 
  isFirst, 
  isLast, 
  isSelected, 
  className = '', 
  onClick,
  showRepresented = true,
  variant = 'standard'
}) => {
  const displaySuit = card.represents?.suit || card.suit;
  const displayValue = card.represents?.value || card.value;
  const colorClass = SUIT_COLORS[displaySuit];
  const symbol = SUIT_SYMBOLS[displaySuit];
  
  const isWild = card.isWild;
  const isStatic = card.wildType === WildType.Static;

  const bgClass = isWild 
    ? (isStatic ? 'bg-blue-50 border-black/30' : 'bg-purple-50 border-black/30')
    : 'bg-white border-black/30';

  const selectionClass = isSelected 
    ? 'ring-2 ring-yellow-400 shadow-xl' 
    : 'shadow-md';

  // Size classes based on variant
  // Standard: w-11 h-14 (mobile) -> md:w-16 md:h-24 (desktop)
  // Compact: w-11 h-14 (mobile) -> md:w-10 md:h-14 (desktop)
  const sizeClass = variant === 'standard'
    ? 'w-11 h-14 sm:w-13 sm:h-18 md:w-16 md:h-24'
    : 'w-11 h-14 sm:w-13 sm:h-18 md:w-10 md:h-14';

  const cornerTextClass = variant === 'standard'
    ? 'text-[10px] sm:text-xs md:text-sm'
    : 'text-[10px] sm:text-xs md:text-sm';

  const cornerSymbolClass = variant === 'standard'
    ? 'text-[8px] sm:text-[10px] md:text-xs'
    : 'text-[8px] sm:text-[10px] md:text-[10px]';
    
  const centerTextClass = variant === 'standard'
    ? 'text-[14px] sm:text-lg md:text-2xl'
    : 'md:hidden'; // Hide center on compact

  const centerSymbolClass = variant === 'standard'
    ? 'text-lg sm:text-xl md:text-3xl'
    : 'md:hidden'; // Hide center on compact

  const paddingClass = variant === 'compact' ? 'p-0.5 md:p-[1px]' : 'p-0.5';

  return (
    <div 
      onClick={onClick}
      className={`relative ${sizeClass} rounded-md border-[1.5px] ${bgClass} ${selectionClass} ${className} transition-all duration-200 cursor-pointer overflow-hidden flex flex-col`}
    >
      {/* Corner Value/Suit */}
      <div className={`flex flex-col items-start leading-none ${paddingClass} z-10 ${colorClass}`}>
        <span className={`${cornerTextClass} font-black tracking-tighter uppercase`}>
          {displayValue === 'Jo' ? 'J' : displayValue}
        </span>
        <span className={`${cornerSymbolClass} -mt-0.5`}>
          {displayValue === 'Jo' ? '★' : symbol}
        </span>
      </div>

      {/* Center Symbol / Representation */}
      <div className={`flex-1 flex items-center justify-center ${colorClass} transition-opacity`}>
        {isWild ? (
           <div className="flex flex-col items-center">
             <i className={`fa-solid ${isStatic ? 'fa-thumbtack' : 'fa-bolt-lightning'} text-[10px] md:text-sm mb-0.5 opacity-40`}></i>
             <span className={`${centerTextClass} opacity-80`}>{symbol}</span>
           </div>
        ) : (
          <span className={`${centerSymbolClass} opacity-20`}>{symbol}</span>
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

      {/* Representation Badge for Wilds */}
      {isWild && card.represents && showRepresented && (
        <div className={`absolute top-1 right-1 px-1 py-0.5 rounded shadow-sm z-20 flex items-center gap-0.5 border border-black/10 ${isStatic ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'}`}>
          <span className="text-[8px] font-black leading-none uppercase">{card.represents.value}</span>
          <span className="text-[8px] leading-none opacity-60">
            {SUIT_SYMBOLS[card.represents.suit]}
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
