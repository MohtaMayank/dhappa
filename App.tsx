import React, { useEffect, useState } from 'react';
import { useGameStore } from './store';
import PlayerAvatar from './components/PlayerAvatar';
import Hand from './components/Hand';
import TableCenter from './components/TableCenter';
import PlayerBoard from './components/PlayerBoard';
import DiscardNPicker from './components/DiscardNPicker';
import DrawCardOverlay from './components/DrawCardOverlay';
import GameMenu from './components/GameMenu';
import AmbiguityModal from './components/AmbiguityModal';
import RunInspector from './components/RunInspector';
import { validateAddToRun } from './gameLogic';
import { Team, Run, CardDef } from './types';

const App: React.FC = () => {
  const { 
    players, currentPlayerIndex, phase, drawPile, discardPile, 
    initGame, drawFromDeck, selectCard, selectedInHand, discardCard,
    createRun, addToRun, lastDrawnCard, closeDrawOverlay, godMode,
    isConfirmingDraw, setIsConfirmingDraw,
    isSelectingRun, setSelectingRun,
    runCreationAmbiguity, resolveCreateRunAmbiguity, cancelCreateRunAmbiguity
  } = useGameStore();

  const [viewMode, setViewMode] = useState<'hand' | 'team_runs' | 'opponent_runs'>('hand');
  const [isNPickerOpen, setIsNPickerOpen] = useState(false);
  const [inspectedRun, setInspectedRun] = useState<Run | null>(null);
  const [addToRunAmbiguity, setAddToRunAmbiguity] = useState<{ 
    isOpen: boolean; 
    runId: string; 
    displacedCard?: CardDef; 
    headRank?: number; 
    tailRank?: number;
    runCards: CardDef[];
  } | null>(null);

  useEffect(() => {
    initGame(4);
  }, [initGame]);

  if (players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = godMode || currentPlayerIndex === 0;

  const handleRunClick = (run: Run) => {
    // Only allow interaction if we have cards selected
    if (selectedInHand.size === 0) {
      setInspectedRun(run);
      return;
    }

    const cardsToAdd = currentPlayer.hand.filter(c => selectedInHand.has(c.id));
    const validation = validateAddToRun(cardsToAdd, run);

    if (validation.type === 'INVALID') {
        // Just ignore invalid clicks, or maybe show a toast in future
        console.warn('Invalid move:', validation.reason);
        return;
    }

    if (validation.type === 'REPLACE_STATIC' && validation.newPosition === 'AMBIGUOUS') {
        setAddToRunAmbiguity({ 
            isOpen: true, 
            runId: run.id, 
            displacedCard: validation.displacedCard, 
            headRank: validation.headRank, 
            tailRank: validation.tailRank,
            runCards: run.cards
        });
        return;
    }

    if (validation.type === 'EXTEND' && validation.position === 'AMBIGUOUS') {
        setAddToRunAmbiguity({ 
            isOpen: true, 
            runId: run.id, 
            headRank: validation.headRank, 
            tailRank: validation.tailRank,
            runCards: run.cards
        });
        return;
    }

    // Valid and unambiguous
    addToRun(run.id);
    setSelectingRun(false);
  };

  const resolveAddToRunAmbiguity = (direction: 'HEAD' | 'TAIL') => {
      if (!addToRunAmbiguity) return;
      addToRun(addToRunAmbiguity.runId, { replaceDirection: direction });
      setAddToRunAmbiguity(null);
      setSelectingRun(false);
  };

  const getRunValidity = (run: Run): boolean => {
      if (selectedInHand.size === 0) return false;
      const cardsToAdd = currentPlayer.hand.filter(c => selectedInHand.has(c.id));
      return validateAddToRun(cardsToAdd, run).type !== 'INVALID';
  };

  const handleConfirmDraw = () => {
    drawFromDeck();
    setIsConfirmingDraw(false);
  };

  const myTeamPlayers = players.filter(p => p.team === players[0].team);
  const oppTeamPlayers = players.filter(p => p.team !== players[0].team);

  const toggleSelectionMode = () => {
      const newState = !isSelectingRun;
      setSelectingRun(newState);
      if (newState) {
          // Auto-open team view if closed
          if (viewMode === 'hand') setViewMode('team_runs');
      } else {
          // If cancelling, maybe go back to hand?
          // setViewMode('hand'); 
          // Let's stay in view to allow looking around, user can close manually.
      }
  };

  return (
    <div className="flex flex-col h-dvh w-full md:max-w-7xl mx-auto bg-emerald-900 shadow-2xl overflow-hidden border-x border-emerald-950 relative select-none">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
      
      <header className="relative z-30 bg-black/40 backdrop-blur-md px-4 py-2 flex justify-between items-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Dhappa Prototyper</span>
        </div>
        <div className="flex gap-1 text-[8px] font-black text-white/40">
           PHASE: <span className="text-yellow-400">{phase.toUpperCase()}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop: Left Panel (My Team) */}
        <aside className="hidden md:flex flex-col w-[30%] bg-black/10 border-r border-white/5 overflow-y-auto p-4 custom-scrollbar">
            <h2 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-4 sticky top-0 bg-emerald-900/80 backdrop-blur-sm py-2 z-10">
                My Team
            </h2>
            <PlayerBoard 
                players={myTeamPlayers} 
                onRunClick={handleRunClick}
                isSelectingMode={isSelectingRun}
                getRunValidity={getRunValidity}
            />
        </aside>

        {/* Center Game Area */}
        <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-8">
            <TableCenter 
                    drawPileCount={drawPile.length} 
                    discardPile={discardPile} 
                    onDraw={() => setIsConfirmingDraw(true)}
                    onOpenDiscard={() => setIsNPickerOpen(true)}
                    isPlayerTurn={isMyTurn}
                    phase={phase}
            />

            <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <PlayerAvatar player={players[2]} isCurrentTurn={currentPlayerIndex === 2} position="top" />
            </div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 md:top-8 md:left-4 md:translate-y-0">
                <PlayerAvatar player={players[3]} isCurrentTurn={currentPlayerIndex === 3} position="left" />
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 md:top-8 md:right-4 md:translate-y-0">
                <PlayerAvatar player={players[1]} isCurrentTurn={currentPlayerIndex === 1} position="right" />
            </div>
            </div>

            {/* Mobile: Overlay Board */}
            {viewMode !== 'hand' && (
                <div className="md:hidden absolute inset-0 z-40 bg-emerald-950/95 backdrop-blur-md p-4 overflow-y-auto animate-in slide-in-from-bottom duration-300">
                    <header className="flex justify-between items-center mb-4 sticky top-0 bg-emerald-950/80 py-2 z-50">
                        <h2 className="text-xs font-black text-white uppercase tracking-widest">
                            {viewMode === 'team_runs' ? "My Team's Table" : "Opponent's Table"}
                        </h2>
                        <button 
                        onClick={() => { setViewMode('hand'); setSelectingRun(false); }} 
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                        >
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </header>
                    <PlayerBoard 
                        players={viewMode === 'team_runs' ? myTeamPlayers : oppTeamPlayers} 
                        onRunClick={handleRunClick}
                        isSelectingMode={isSelectingRun}
                        getRunValidity={getRunValidity}
                    />
                </div>
            )}
        </main>

        {/* Desktop: Right Panel (Opponents) */}
        <aside className="hidden md:flex flex-col w-[30%] bg-black/10 border-l border-white/5 overflow-y-auto p-4 custom-scrollbar">
            <h2 className="text-xs font-black text-red-300 uppercase tracking-widest mb-4 sticky top-0 bg-emerald-900/80 backdrop-blur-sm py-2 z-10">
                Opponents
            </h2>
            <PlayerBoard 
                players={oppTeamPlayers} 
                onRunClick={handleRunClick}
                isSelectingMode={isSelectingRun}
                getRunValidity={getRunValidity}
            />
        </aside>
      </div>

      <footer className="relative z-30 bg-black/70 border-t border-white/10 backdrop-blur-xl shrink-0">
        <div className="flex flex-col gap-1 p-2">
          <div className="flex gap-2">
              <button 
                  onClick={() => createRun()}
                  disabled={!isMyTurn || phase !== 'play' || selectedInHand.size < 3}
                  className="flex-1 py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex flex-col items-center gap-1 disabled:opacity-20 active:scale-95 transition-all"
              >
                  <i className="fa-solid fa-wand-sparkles text-emerald-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Open Run</span>
              </button>
              
              <button 
                  onClick={toggleSelectionMode}
                  disabled={!isMyTurn || phase !== 'play' || selectedInHand.size === 0}
                  className={`flex-1 py-3 ${isSelectingRun ? 'bg-emerald-500/40 border-emerald-400' : 'bg-emerald-600/20 border-emerald-500/30'} border rounded-xl flex flex-col items-center gap-1 disabled:opacity-20 active:scale-95 transition-all`}
              >
                  <i className="fa-solid fa-layer-group text-emerald-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Add to Run</span>
              </button>

              <button 
                  onClick={() => setViewMode('team_runs')}
                  className={`flex-1 md:hidden py-3 ${viewMode === 'team_runs' && !isSelectingRun ? 'bg-blue-600/40 border-blue-400' : 'bg-blue-600/20 border-blue-500/30'} border rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all`}
              >
                  <i className="fa-solid fa-people-group text-blue-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">My Team</span>
              </button>
              
              <button 
                  onClick={() => setViewMode('opponent_runs')}
                  className={`flex-1 md:hidden py-3 ${viewMode === 'opponent_runs' ? 'bg-red-600/40 border-red-400' : 'bg-red-600/20 border-red-500/30'} border rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all`}
              >
                  <i className="fa-solid fa-shield-halved text-red-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Opponents</span>
              </button>
              
              <button 
                  onClick={() => discardCard(Array.from(selectedInHand)[0])}
                  disabled={!isMyTurn || phase !== 'play' || selectedInHand.size !== 1}
                  className="flex-1 py-3 bg-slate-600/20 border border-slate-500/30 rounded-xl flex flex-col items-center gap-1 disabled:opacity-20 active:scale-95 transition-all"
              >
                  <i className="fa-solid fa-arrow-up-from-bracket text-slate-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Discard</span>
              </button>
          </div>
        </div>

        <Hand 
            cards={currentPlayer.hand} 
            selectedIds={selectedInHand} 
            onToggleCard={selectCard} 
            isDisabled={!isMyTurn}
        />

        <div className="h-6 flex items-center justify-center bg-black/40">
           <p className="text-[8px] font-bold text-yellow-400/60 uppercase tracking-widest">
               {isSelectingRun 
                    ? "Select a valid run to add cards..." 
                    : (isMyTurn ? (phase === 'draw' ? 'Draw a card' : 'Play cards or Discard') : `Waiting for ${players[currentPlayerIndex].name}`)
               }
           </p>
        </div>
      </footer>

      {isNPickerOpen && (
          <DiscardNPicker 
            pile={discardPile} 
            onPick={(n) => { 
                useGameStore.getState().pickFromDiscard(n); 
                setIsNPickerOpen(false); 
                setViewMode('team_runs');
            }} 
            onClose={() => setIsNPickerOpen(false)}
            canPick={isMyTurn && phase === 'draw'}
          />
      )}

      <DrawCardOverlay 
        isOpen={!!lastDrawnCard || isConfirmingDraw} 
        onConfirm={handleConfirmDraw} 
        onCancel={() => setIsConfirmingDraw(false)}
        onFinishReveal={() => {
            closeDrawOverlay();
            setViewMode('team_runs');
        }}
        revealedCard={lastDrawnCard}
      />
      <GameMenu />

      <AmbiguityModal 
        isOpen={!!addToRunAmbiguity?.isOpen} 
        type="ADD_TO_RUN"
        onResolve={resolveAddToRunAmbiguity}
        onCancel={() => setAddToRunAmbiguity(null)}
        displacedCard={addToRunAmbiguity?.displacedCard}
        headRank={addToRunAmbiguity?.headRank}
        tailRank={addToRunAmbiguity?.tailRank}
        runCards={addToRunAmbiguity?.runCards}
      />

      <AmbiguityModal 
        isOpen={!!runCreationAmbiguity?.isOpen} 
        type="CREATE_RUN"
        onResolve={resolveCreateRunAmbiguity}
        onCancel={cancelCreateRunAmbiguity}
        headRank={runCreationAmbiguity?.headRank}
        tailRank={runCreationAmbiguity?.tailRank}
        runCards={runCreationAmbiguity?.cards}
      />

      <RunInspector 
        cards={inspectedRun?.cards || null} 
        onClose={() => setInspectedRun(null)} 
      />
    </div>
  );
};

export default App;