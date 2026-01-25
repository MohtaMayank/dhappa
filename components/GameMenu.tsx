import React, { useState } from 'react';
import { useGameStore } from '../store';
import { SCENARIO_KEYS } from '../scenarios';

const GameMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { loadScenario, godMode, toggleGodMode } = useGameStore();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[120] w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all border border-white/10 shadow-lg active:scale-95"
      >
        <i className="fa-solid fa-bars text-sm"></i>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

        <div className="relative bg-slate-900 text-white w-full max-w-xs rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Game Menu
                </h2>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            {/* Menu Options */}
            <div className="p-2 space-y-1 overflow-y-auto">
                <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors group flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <i className="fa-solid fa-plus"></i>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-200 group-hover:text-white">New Game</span>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Start fresh</span>
                    </div>
                </button>

                <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors group flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <i className="fa-solid fa-share-nodes"></i>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-200 group-hover:text-white">Share</span>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Invite friends</span>
                    </div>
                </button>

                {/* Debug Section Toggle */}
                <button 
                    onClick={() => setShowDebug(!showDebug)}
                    className={`w-full text-left p-4 rounded-xl transition-colors group flex items-center justify-between ${showDebug ? 'bg-white/5' : 'hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-bug"></i>
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-200 group-hover:text-white">Debug</span>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Developer tools</span>
                        </div>
                    </div>
                    <i className={`fa-solid fa-chevron-down text-slate-500 transition-transform ${showDebug ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Debug Content */}
                {showDebug && (
                    <div className="mx-2 p-3 bg-black/20 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        
                        {/* God Mode */}
                        <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${godMode ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-600 group-hover:border-slate-500'}`}>
                                {godMode && <i className="fa-solid fa-check text-xs text-black"></i>}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={godMode} 
                                onChange={toggleGodMode}
                                className="hidden"
                            />
                            <div>
                                <span className={`block text-xs font-bold uppercase tracking-wide ${godMode ? 'text-amber-400' : 'text-slate-300'}`}>God Mode</span>
                                <span className="block text-[10px] text-slate-500">Control all players</span>
                            </div>
                        </label>

                        {/* Scenarios */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Load Scenario</p>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.values(SCENARIO_KEYS).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            loadScenario(key);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-all border border-transparent hover:border-white/10 flex items-center justify-between group"
                                    >
                                        <span className="capitalize text-slate-300 group-hover:text-white font-medium">{key}</span>
                                        <i className="fa-solid fa-play text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-slate-950/30 border-t border-slate-800 text-center">
                 <p className="text-[10px] text-slate-600 font-mono">v0.1.0 • Dhappa Prototyper</p>
            </div>
        </div>
    </div>
  );
};

export default GameMenu;
