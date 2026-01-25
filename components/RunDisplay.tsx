
import React, { useMemo } from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface RunDisplayProps {
  cards: CardDef[];
  label?: string;
  isFirstInRow?: boolean;
}

const RunDisplay: React.FC<RunDisplayProps> = ({ cards, label, isFirstInRow }) => {
  // Compression logic: Identifies groups of 4+ natural continuous cards
  const elements = useMemo(() => {
    const result: any[] = [];
    let i = 0;
    while (i < cards.length) {
      let j = i;
      while (j < cards.length && !cards[j].isWild) {
        j++;
      }

      const length = j - i;
      if (length >= 4) {
        result.push({ type: 'dotted', start: cards[i], end: cards[j - 1] });
      } else {
        for (let k = i; k < j; k++) {
          result.push({ type: 'card', card: cards[k] });
        }
      }
      
      if (j < cards.length && cards[j].isWild) {
        result.push({ type: 'card', card: cards[j] });
        i = j + 1;
      } else {
        i = j;
      }
    }
    return result;
  }, [cards]);

  // Mobile: w-11 (44px). Visible 16px -> overlap -28px
  // sm: w-13 (52px). Visible 18px -> overlap -34px
  // md (Compact): w-10 (40px). Visible ~18px -> overlap -22px
  const overlapClass = "ml-[-28px] sm:ml-[-34px]";
  const lgOverlapClass = "md:-ml-[22px]";

  const renderElements = (items: any[], isCompressed: boolean) => (
    <div className={`flex items-center ${isCompressed ? 'md:hidden' : 'hidden md:flex'}`}>
        {items.map((el, idx) => {
          const isLastElement = idx === items.length - 1;
          const isFirstInRun = idx === 0;
          const style = { zIndex: idx + 10 };
          // Apply margin to everything except the first item
          const marginClass = idx === 0 ? '' : (isCompressed ? overlapClass : lgOverlapClass);

          if (el.type === 'dotted') {
            return (
              <React.Fragment key={idx}>
                <div style={style} className={marginClass}>
                  <CardBase card={el.start} isStacked={true} isFirst={isFirstInRun} />
                </div>
                {/* Stack indicator */}
                <div 
                  style={{ zIndex: idx + 11 }}
                  className={`relative w-11 h-14 sm:w-13 sm:h-18 md:w-10 md:h-14 ${overlapClass} shrink-0`}
                >
                  {/* Bottom-most layer */}
                  <div className="absolute left-[-3px] top-[3px] w-full h-full bg-white border border-black rounded-md -z-20"></div>
                  {/* Middle layer */}
                  <div className="absolute left-[-1.5px] top-[1.5px] w-full h-full bg-white border border-black rounded-md -z-10"></div>
                  
                  {/* Top layer */}
                  <div className="w-full h-full bg-white rounded-md border-[1.5px] border-black flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                    <div className="flex flex-col items-center gap-0.5 z-10">
                       <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                       <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                       <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    </div>
                  </div>
                </div>
                <div style={{ zIndex: idx + 12 }} className={overlapClass}>
                  <CardBase card={el.end} isStacked={!isLastElement} isLast={isLastElement} />
                </div>
              </React.Fragment>
            );
          }

          return (
            <div key={idx} style={style} className={marginClass}>
              <CardBase 
                card={el.card} 
                isStacked={!isLastElement} 
                isFirst={isFirstInRun} 
                isLast={isLastElement} 
                variant={isCompressed ? 'standard' : 'compact'}
              />
            </div>
          );
        })}
    </div>
  );

  const fullElements = cards.map(c => ({ type: 'card', card: c }));

  return (
    <div className="flex flex-col shrink-0">
      
      {renderElements(elements, true)}
      {renderElements(fullElements, false)}
    </div>
  );
};

export default RunDisplay;
