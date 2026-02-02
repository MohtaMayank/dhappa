
import React, { useMemo } from 'react';
import { CardDef } from '../types';
import CardBase from './CardBase';

interface RunProps {
  data: CardDef[];
  label?: string;
  className?: string;
  onInspect?: (cards: CardDef[]) => void;
  onClick?: () => void;
}

const Run: React.FC<RunProps> = ({ data, label, className = '', onInspect, onClick }) => {
  // We want to display runs in Descending order (High to Low, e.g. K, Q, J)
  // The store maintains Ascending order (J, Q, K).
  // So we reverse the data for display purposes.
  const displayData = useMemo(() => [...data].reverse(), [data]);

  const elements = useMemo(() => {
    const result: any[] = [];
    const n = displayData.length;
    if (n === 0) return [];

    let i = 0;
    while (i < n) {
      // 1. Check if current index is an Anchor
      const isStart = i === 0;
      const isEnd = i === n - 1;
      const isWild = displayData[i].isWild;
      const isAnchor = isStart || isEnd || isWild;

      if (isAnchor) {
        result.push({ type: 'card', card: displayData[i], originalIndex: i });
        i++;
        continue;
      }

      // 2. Not an Anchor. This is part of a gap.
      // Find the next Anchor index.
      let nextAnchorIdx = -1;
      for (let j = i; j < n; j++) {
        if (j === n - 1 || displayData[j].isWild) {
          nextAnchorIdx = j;
          break;
        }
      }

      // If for some reason we didn't find one (shouldn't happen since last card is anchor), default to end
      if (nextAnchorIdx === -1) nextAnchorIdx = n - 1; // Should technically be n if we consider "end of array" as bound? 
      // No, "Last Card" (n-1) is an anchor. So we will always find j = n-1.

      const gapLength = nextAnchorIdx - i;

      if (gapLength >= 2) {
        // Collapse
        result.push({ 
          type: 'sequence', 
          start: displayData[i], 
          end: displayData[nextAnchorIdx - 1], 
          length: gapLength 
        });
        i = nextAnchorIdx; // Skip to the anchor
      } else {
        // Gap of 1. Just render the card.
        result.push({ type: 'card', card: displayData[i], originalIndex: i });
        i++;
      }
    }
    return result;
  }, [displayData]);

  const zIndices = useMemo(() => {
    let current = 10;
    return elements.map(el => {
      const z = current;
      current += (el.type === 'sequence' ? 3 : 1);
      return z;
    });
  }, [elements]);

  // Negative margin for stacking
  const overlapClass = "ml-[-28px] sm:ml-[-34px] md:-ml-[22px]";

  return (
    <div 
      className={`flex flex-col shrink-0 cursor-pointer group select-none transition-transform active:scale-[0.98] ${className}`}
      onClick={onClick}
    >
      
      <div className="flex items-center relative py-1 h-16 sm:h-20">
        {elements.map((el, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === elements.length - 1;
          const zIndex = zIndices[idx];
          const style = { zIndex };
          const margin = isFirst ? '' : overlapClass;

          if (el.type === 'sequence') {
            return (
              <React.Fragment key={`seq-${idx}`}>
                 {/* Stack Visualization */}
                 <div 
                  style={style} 
                  className={`relative w-12 h-14 sm:w-14 sm:h-18 md:w-10 md:h-14 ${margin} shrink-0`}
                >
                  {/* Bottom layers for depth */}
                  <div className="absolute left-[-3px] top-[3px] w-full h-full bg-white border border-black/30 rounded-md -z-20"></div>
                  <div className="absolute left-[-1.5px] top-[1.5px] w-full h-full bg-white border border-black/30 rounded-md -z-10"></div>
                  
                  {/* Main Stack Face */}
                  <div className="w-full h-full bg-slate-50 rounded-md border-[1.5px] border-black/30 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 border border-slate-200 rounded-sm"></div>
                    <div className="flex flex-col items-center gap-0.5 z-10">
                       <i className="fa-solid fa-layer-group text-slate-300 text-[10px] mb-0.5"></i>
                       <span className="text-[12px] font-black text-slate-700 leading-none">{el.length}</span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          }

          return (
            <div key={`card-${idx}`} style={style} className={margin}>
              <CardBase 
                card={el.card} 
                isStacked={false} // Disable washed out overlay for anchors in this refined UI
                isFirst={isFirst} 
                isLast={isLast} 
                variant="compact"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Run;
