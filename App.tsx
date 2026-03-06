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
import { validateAddToRun, isValidNPick } from './shared/gameLogic';
import { Team, Run, CardDef } from './shared/types';

import Lobby from './components/Lobby';

const App: React.FC = () => {
  const { 
    players, currentPlayerIndex, phase, drawPile, discardPile, 
    initGame, drawFromDeck, pickFromDiscard, selectCardInHand, selectedInHand, discardCard,
    startRunCreation, addToRun, lastDrawnCard, closeDrawOverlay, godMode,
    isConfirmingDraw, confirmDraw,
    isSelectingRun, setSelectingRun,
    isMergingRuns, mergeAnchorId,
    addToRunAmbiguity, resolveAddToRunAmbiguity, cancelAddToRunAmbiguity,
    runCreationAmbiguity, resolveCreateRunAmbiguity, cancelRunCreation,
    cancelDraw, mustPlayCard, winner
  } = useGameStore();

  const [viewMode, setViewMode] = useState<'hand' | 'team_runs' | 'opponent_runs'>('hand');
  const [isNPickerOpen, setIsNPickerOpen] = useState(false);
  const [inspectedRun, setInspectedRun] = useState<Run | null>(null);

  // URL Routing and Auto-rejoin
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const roomId = pathParts[1] === 'room' ? pathParts[2] : null;
    
    if (roomId) {
      (window as any).ROOM_ID = roomId;
      const token = localStorage.getItem(`dhappa_auth_${roomId}`);
      const savedName = localStorage.getItem('dhappa_player_name') || '';
      
      if (token && players.length === 0) {
        console.log('Auto-rejoining room:', roomId);
        initGame(savedName, roomId, '', token);
      }
    }
  }, [players.length, initGame]);

  if (players.length === 0) {
    const pathParts = window.location.pathname.split('/');
    const roomId = pathParts[1] === 'room' ? pathParts[2] : null;
    return <Lobby initialRoomId={roomId || ''} />;
  }

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = godMode || currentPlayerIndex === 0;

  const getMustPlayCardName = () => {
      if (!mustPlayCard || typeof currentPlayer.hand === 'number') return '';
      const card = currentPlayer.hand.find(c => c.id === mustPlayCard);
      if (!card) return 'Selected Card';
      return `${card.value}${card.suit[0]}`; 
  };

  const handleRunClick = (run: Run) => {
    if (selectedInHand.length === 0) {
      setInspectedRun(run);
      return;
    }
    addToRun(run.id);
  };

  const handleConfirmDraw = () => {
    confirmDraw();
  };

  const myTeamPlayers = players.filter(p => p.team === players[0].team);
  const oppTeamPlayers = players.filter(p => p.team !== players[0].team);

  const toggleSelectionMode = () => {
    if (isSelectingRun) {
      setSelectingRun(false);
      return;
    }

    // Validation: Check if selected cards can be added to ANY run of the same team
    const cardsToAdd = currentPlayer.hand.filter(c => selectedInHand.includes(c.id));
    const teamPlayers = players.filter(p => p.team === currentPlayer.team);
    const canAddToAny = teamPlayers.some(p => 
      p.runs.some(run => validateAddToRun(cardsToAdd, run).type !== 'INVALID')
    );

    if (!canAddToAny) {
      alert("No valid runs to add these cards to!");
      return;
    }

    setSelectingRun(true);
    if (viewMode === 'hand') setViewMode('team_runs');
  };

  return (
    <div className="flex flex-col h-dvh w-full md:max-w-7xl mx-auto bg-emerald-900 shadow-2xl overflow-hidden border-x border-emerald-950 relative select-none">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
      
      <header className="relative z-30 bg-black/40 backdrop-blur-md px-4 py-2 flex justify-between items-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden pl-8 md:pl-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></div>
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest shrink-0">Dhappa</span>
          <div className="ml-2 flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] font-mono text-blue-400 shrink-0">ROOM: {(window as any).ROOM_ID}</span>
            <button 
                onClick={() => {
                    const url = `${window.location.origin}/room/${(window as any).ROOM_ID}`;
                    navigator.clipboard.writeText(url);
                    alert('Share link copied to clipboard!');
                }}
                className="text-[10px] text-white/40 hover:text-white/80 transition-colors shrink-0"
                title="Copy Share Link"
            >
                <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>
        <div className="flex gap-2 text-[10px] font-black text-white/40 shrink-0">
           PHASE: <span className="text-yellow-400 uppercase">{phase}</span>
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
                currentPlayerIndex={currentPlayerIndex}
                onRunClick={handleRunClick}
                isSelectingMode={isSelectingRun}
                getRunValidity={(run) => {
                  const cardsToAdd = currentPlayer.hand.filter(c => selectedInHand.includes(c.id));
                  return validateAddToRun(cardsToAdd, run).type !== 'INVALID';
                }}
            />
        </aside>

        {/* Center Game Area */}
        <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-8">
            <TableCenter 
                    drawPileCount={typeof drawPile === 'number' ? drawPile : drawPile.length} 
                    discardPile={discardPile} 
                    onDraw={drawFromDeck}
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
                        onClick={() => { setViewMode('hand'); }} 
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                        >
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </header>
                    <PlayerBoard 
                        players={viewMode === 'team_runs' ? myTeamPlayers : oppTeamPlayers} 
                        onRunClick={handleRunClick}
                        isSelectingMode={isSelectingRun}
                        getRunValidity={(run) => {
                            if (viewMode !== 'team_runs') return false;
                            const cardsToAdd = currentPlayer.hand.filter(c => selectedInHand.includes(c.id));
                            return validateAddToRun(cardsToAdd, run).type !== 'INVALID';
                        }}
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
                getRunValidity={() => false}
            />
        </aside>
      </div>

      <footer className="relative z-30 bg-black/70 border-t border-white/10 backdrop-blur-xl shrink-0">
        <div className="flex flex-col gap-1 p-2">
          <div className="flex gap-2">
              <button 
                  onClick={startRunCreation}
                  data-testid="open-run-btn"
                  disabled={!isMyTurn || phase !== 'play' || selectedInHand.length < 3}
                  className="flex-1 py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex flex-col items-center gap-1 disabled:opacity-20 active:scale-95 transition-all"
              >
                  <i className="fa-solid fa-wand-sparkles text-emerald-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Open Run</span>
              </button>
              
              <button 
                  onClick={toggleSelectionMode}
                  data-testid="add-to-run-btn"
                  disabled={!isMyTurn || phase !== 'play' || selectedInHand.length === 0 || !currentPlayer.hasOpened}
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
                  onClick={() => discardCard(selectedInHand[0])}
                  data-testid="discard-btn"
                  disabled={!isMyTurn || phase !== 'play' || selectedInHand.length !== 1 || !!mustPlayCard}
                  className="flex-1 py-3 bg-slate-600/20 border border-slate-500/30 rounded-xl flex flex-col items-center gap-1 disabled:opacity-20 active:scale-95 transition-all"
              >
                  <i className="fa-solid fa-arrow-up-from-bracket text-slate-400 text-sm"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Discard</span>
              </button>
          </div>
        </div>

        <div data-testid="player-hand">
            <Hand 
                cards={typeof players[0].hand === 'number' ? [] : players[0].hand} 
                selectedIds={selectedInHand} 
                onToggleCard={selectCardInHand} 
                isDisabled={!isMyTurn}
            />
        </div>

        <div className="h-10 flex items-center justify-center bg-black/60 border-t border-white/5">
           <p className="text-[10px] sm:text-xs font-black text-yellow-400 uppercase tracking-[0.15em] text-center px-4 leading-relaxed">
               {isMergingRuns
                    ? (mergeAnchorId ? "Select second run to merge..." : "Select first run to merge...")
                    : (isSelectingRun 
                        ? "Select a valid run (yours or teammate's) to add cards..." 
                        : (mustPlayCard 
                            ? `Add ${getMustPlayCardName()} to a new or existing run`
                            : (isMyTurn ? (phase === 'draw' ? 'Draw a card' : 'Play cards or Discard') : `Waiting for ${players[currentPlayerIndex].name}`)
                          )
                      )
               }
           </p>
        </div>
      </footer>

      {isNPickerOpen && (
          <DiscardNPicker 
            pile={discardPile} 
            onPick={(n) => { 
                pickFromDiscard(n);
                setIsNPickerOpen(false); 
                setViewMode('team_runs');
            }} 
            onClose={() => setIsNPickerOpen(false)}
            canPick={isMyTurn && phase === 'draw'}
            isValidPick={(n) => {
                const isFirstTurn = discardPile.length === 1 && players.every(p => p.runs.length === 0);
                return isValidNPick(n, discardPile, players, currentPlayerIndex, isFirstTurn);
            }}
          />
      )}

      <DrawCardOverlay 
        isOpen={!!lastDrawnCard || isConfirmingDraw} 
        onConfirm={handleConfirmDraw} 
        onCancel={cancelDraw} 
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
        onCancel={cancelAddToRunAmbiguity}
        headRank={addToRunAmbiguity?.headRank}
        tailRank={addToRunAmbiguity?.tailRank}
        runCards={addToRunAmbiguity?.cards}
      />

      <AmbiguityModal 
        isOpen={!!runCreationAmbiguity?.isOpen} 
        type="CREATE_RUN"
        onResolve={resolveCreateRunAmbiguity}
        onCancel={cancelRunCreation}
        headRank={runCreationAmbiguity?.headRank}
        tailRank={runCreationAmbiguity?.tailRank}
        runCards={runCreationAmbiguity?.cards}
      />

      <RunInspector 
        cards={inspectedRun?.cards || null} 
        onClose={() => setInspectedRun(null)} 
      />

      {winner && (
        <div data-testid="winner-overlay" className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-8 animate-in fade-in duration-500">
          <div className="w-24 h-24 mb-6 relative">
            <i className={`fa-solid fa-trophy text-6xl ${winner === Team.A ? 'text-blue-400' : 'text-red-400'} animate-bounce`}></i>
            <div className="absolute -inset-4 bg-white/10 rounded-full animate-ping -z-10"></div>
          </div>
          <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 ${winner === Team.A ? 'text-blue-400' : 'text-red-400'}`}>
            {winner === Team.A ? 'Team A Wins!' : 'Team B Wins!'}
          </h2>
          <p className="text-white/60 font-black uppercase tracking-widest text-sm mb-12">Total Domination</p>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-110 active:scale-95 transition-all shadow-2xl"
          >
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
};

export default App;