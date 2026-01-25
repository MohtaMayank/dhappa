
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
  const elements = useMemo(() => {
    const result: any[] = [];
    let i = 0;
    while (i < data.length) {
      let j = i;
      // Find a sequence of continuous natural cards
      while (j < data.length && !data[j].isWild) {
        j++;
      }
      
      const naturalLength = j - i;
      if (naturalLength >= 4) {
        // Compress this sequence
        result.push({ type: 'sequence', start: data[i], end: data[j-1], length: naturalLength });
      } else {
        // Just add cards individually
        for (let k = i; k < j; k++) {
          result.push({ type: 'card', card: data[k] });
        }
      }

      if (j < data.length && data[j].isWild) {
        result.push({ type: 'card', card: data[j] });
        i = j + 1;
      } else {
        i = j;
      }
    }
    return result;
  }, [data]);

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
          const style = { zIndex: idx + 10 };
          const margin = isFirst ? '' : overlapClass;

          if (el.type === 'sequence') {
            return (
              <React.Fragment key={idx}>
                {/* Start of sequence */}
                <div style={style} className={margin}>
                  <CardBase card={el.start} isStacked={true} isFirst={true} variant="compact" />
                </div>
                
                {/* Arrow / Gap indicator (Stack) */}
                <div 
                  style={{ zIndex: idx + 11 }} 
                  className={`relative w-12 h-14 sm:w-14 sm:h-18 md:w-10 md:h-14 ${overlapClass} shrink-0`}
                >
                  {/* Bottom-most layer */}
                  <div className="absolute left-[-3px] top-[3px] w-full h-full bg-white border border-black rounded-md -z-20"></div>
                  {/* Middle layer */}
                  <div className="absolute left-[-1.5px] top-[1.5px] w-full h-full bg-white border border-black rounded-md -z-10"></div>
                  
                  {/* Top layer (Main Face) */}
                  <div className="w-full h-full bg-white rounded-md border-[1.5px] border-black flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 border border-slate-100 rounded-sm"></div>
                    <div className="flex flex-col items-center gap-0.5 z-10">
                       <div className="w-3 h-0.5 bg-slate-300 rounded-full mb-0.5"></div>
                       <span className="text-[11px] font-black text-slate-800 leading-none">{el.length}</span>
                       <span className="text-[6px] font-black text-slate-400 uppercase tracking-tighter">Cards</span>
                    </div>
                  </div>
                </div>

                {/* End of sequence */}
                <div style={{ zIndex: idx + 12 }} className={overlapClass}>
                  <CardBase card={el.end} isStacked={!isLast} isLast={isLast} variant="compact" />
                </div>
              </React.Fragment>
            );
          }

          return (
            <div key={idx} style={style} className={margin}>
              <CardBase 
                card={el.card} 
                isStacked={!isLast} 
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
