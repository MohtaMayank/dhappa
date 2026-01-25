
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

  const zIndices = useMemo(() => {
    let current = 10;
    return elements.map(el => {
      const z = current;
      current += (el.type === 'dotted' ? 3 : 1);
      return z;
    });
  }, [elements]);

  // Mobile: w-11 (44px). Visible 16px -> overlap -28px
  // sm: w-13 (52px). Visible 18px -> overlap -34px
  const overlapClass = "ml-[-28px] sm:ml-[-34px]";

  return (
    <div className="flex flex-col shrink-0">
      {label && <h4 className="text-[7px] font-bold text-emerald-300/50 uppercase tracking-wider ml-1 mb-0.5">{label}</h4>}
      <div className="flex items-center">
        {elements.map((el, idx) => {
          const isLastElement = idx === elements.length - 1;
          const isFirstInRun = idx === 0;
          const zIndex = zIndices[idx];
          const style = { zIndex };
          const marginClass = idx === 0 ? '' : overlapClass;

          if (el.type === 'dotted') {
            return (
              <React.Fragment key={idx}>
                <div style={style} className={marginClass}>
                  <CardBase card={el.start} isStacked={true} isFirst={isFirstInRun} />
                </div>
                <div 
                  style={{ zIndex: zIndex + 1 }}
                  className={`relative w-11 h-14 sm:w-13 sm:h-18 ${overlapClass}`}
                >
                  <div className="absolute top-[3px] left-[5px] w-full h-full bg-black/20 rounded-md border border-black/40 shadow-sm"></div>
                  <div className="absolute top-[1.5px] left-[2.5px] w-full h-full bg-white/10 rounded-md border border-white/20 shadow-sm"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/95 rounded-md border-[1.5px] border-slate-900 flex items-center justify-center gap-0.5 shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-black/60"></div>
                    <div className="w-1 h-1 rounded-full bg-black/60"></div>
                    <div className="w-1 h-1 rounded-full bg-black/60"></div>
                  </div>
                </div>
                <div style={{ zIndex: zIndex + 2 }} className={overlapClass}>
                  <CardBase card={el.end} isStacked={!isLastElement} isLast={isLastElement} />
                </div>
              </React.Fragment>
            );
          }

          return (
            <div key={idx} style={style} className={marginClass}>
              <CardBase card={el.card} isStacked={!isLastElement} isFirst={isFirstInRun} isLast={isLastElement} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RunDisplay;
