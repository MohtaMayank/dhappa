
import React, { useState } from 'react';
import { CardDef, Run as RunType } from './types';
import { parseRunString } from './constants';
import PlayerBoard from './components/PlayerBoard';
import Run from './components/Run';
import RunInspector from './components/RunInspector';

const App: React.FC = () => {
  const [inspectedCards, setInspectedCards] = useState<CardDef[] | null>(null);

  // Player 1's requested runs
  const [p1Runs] = useState<RunType[]>([
    { id: 'p1-1', name: 'H-Long', cards: parseRunString('AH, KH, W2->QH, WJo->JH, 10H, 9H, W2->8H, 7H') },
    { id: 'p1-2', name: 'S-Seq', cards: parseRunString('6S, W2->5S, 4S, 3S') },
    { id: 'p1-3', name: 'C-Short', cards: parseRunString('8C, W2->7C, 6C') },
    { id: 'p1-4', name: 'D-Natural', cards: parseRunString('JD, 10D, 9D, 8D') },
    { id: 'p1-5', name: 'S-Upper', cards: parseRunString('JS, 10S, 9S, 8S') },
    { id: 'p1-6', name: 'S-Natural', cards: parseRunString('10S, 9S, 8S') },
  ]);

  // Player 2's stress test runs
  const [p2Runs] = useState<RunType[]>([
    // New Diamond stress test (Total 21 cards in one row)
    { id: 'p2-d1', name: 'D-Mega', cards: parseRunString('KD, W2->QD, JD, 10D, WJo->9D, 8D, 7D, W2->6D, 5D, 4D, 3D') },
    { id: 'p2-d2', name: 'D-Med', cards: parseRunString('JD, 10D, W2->9D, 8D') },
    { id: 'p2-d3', name: 'D-Small', cards: parseRunString('5D, W2->4D, 3D') },
    { id: 'p2-d4', name: 'D-Mixed', cards: parseRunString('7D, 6D, W2->5D') },
    
    // Other suits for variety
    { id: 'p2-c1', name: 'C-Natural', cards: parseRunString('9C, 8C, 7C') },
    { id: 'p2-c2', name: 'C-Wild', cards: parseRunString('8C, W2->7C, 6C') },
    { id: 'p2-s1', name: 'S-Seq', cards: parseRunString('6S, W2->5S, 4S, 3S') },
  ]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-emerald-900 shadow-2xl overflow-hidden border-x border-emerald-950 relative">
      {/* Table Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
      
      {/* Lighting Depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>

      <div className="relative flex-1 flex flex-col min-h-0">
        <PlayerBoard 
          playerLabel="Player 1 (Main Hand)" 
          runs={p1Runs} 
          statusColor="bg-emerald-400" 
          onInspectRun={setInspectedCards}
        />
        
        <PlayerBoard 
          playerLabel="Opponent" 
          runs={p2Runs} 
          statusColor="bg-slate-400" 
          onInspectRun={setInspectedCards}
        />

        <div className="p-3 bg-black/40 border-t border-white/10 shrink-0">
           <h3 className="text-[8px] uppercase tracking-widest text-white/40 mb-2">Individual Component Test</h3>
           <Run 
              data="AS, KS, QS, JS, 10S" 
              label="Natural Royal Sequence" 
              onInspect={setInspectedCards}
            />
        </div>
      </div>

      {/* Inspection Overlay */}
      <RunInspector 
        cards={inspectedCards} 
        onClose={() => setInspectedCards(null)} 
      />

      {/* Mobile Home Bar */}
      <div className="h-4 bg-black/60 flex items-center justify-center shrink-0 relative z-10">
        <div className="w-12 h-1 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
