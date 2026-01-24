
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
  const overlapClass = "ml-[-28px] sm:ml-[-34px]";

  return (
    <div 
      className={`flex flex-col shrink-0 cursor-pointer group select-none transition-transform active:scale-[0.98] ${className}`}
      onClick={onClick}
    >
      {label && <h4 className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 mb-1">{label}</h4>}
      
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
                  <CardBase card={el.start} isStacked={true} isFirst={true} />
                </div>
                
                {/* Arrow / Gap indicator */}
                <div 
                  style={{ zIndex: idx + 11 }} 
                  className={`relative w-12 h-14 sm:w-14 sm:h-18 ${overlapClass} bg-emerald-800/40 rounded-md border border-white/5 flex flex-col items-center justify-center gap-1 shadow-inner`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                  </div>
                  <i className="fa-solid fa-arrow-right-long text-[8px] text-white/20"></i>
                  <span className="text-[8px] font-black text-white/20">{el.length}</span>
                </div>

                {/* End of sequence */}
                <div style={{ zIndex: idx + 12 }} className={overlapClass}>
                  <CardBase card={el.end} isStacked={!isLast} isLast={isLast} />
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Run;
