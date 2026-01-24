
import React from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface HandProps {
  cards: CardDef[];
  selectedIds: Set<string>;
  onToggleCard: (id: string) => void;
  isDisabled?: boolean;
}

const Hand: React.FC<HandProps> = ({ cards, selectedIds, onToggleCard, isDisabled }) => {
  return (
    <div className="w-full overflow-x-auto overflow-y-visible py-4 px-8 scrollbar-hide">
      <div className="flex items-end justify-start min-w-max h-24 sm:h-28 px-4">
        {cards.map((card, idx) => {
          const isSelected = selectedIds.has(card.id);
          return (
            <div 
              key={card.id} 
              className={`transition-transform duration-200 hover:-translate-y-2 ${isSelected ? '-translate-y-4' : ''}`}
              style={{ 
                zIndex: idx + 10,
                marginLeft: idx === 0 ? '0' : '-24px'
              }}
            >
              <CardBase 
                card={card} 
                isSelected={isSelected}
                onClick={() => !isDisabled && onToggleCard(card.id)}
                isFirst={true}
                className={isDisabled ? 'grayscale opacity-50' : ''}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hand;
