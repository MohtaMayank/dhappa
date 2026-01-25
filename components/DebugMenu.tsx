import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { SCENARIO_KEYS } from '../scenarios';

const DebugMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { loadScenario, godMode, toggleGodMode } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 right-0 z-[120] p-4">
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700 w-64 animate-in slide-in-from-right-10 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Debug Menu
                </h2>
                <button 
                    onClick={() => setIsVisible(false)} 
                    className="text-slate-500 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
                >
                    &times;
                </button>
            </div>
            
            <div className="space-y-6">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${godMode ? 'bg-yellow-500 border-yellow-500' : 'bg-transparent border-slate-500 group-hover:border-slate-400'}`}>
                            {godMode && <i className="fa-solid fa-check text-[10px] text-black"></i>}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={godMode} 
                            onChange={toggleGodMode}
                            className="hidden"
                        />
                        <div>
                            <span className={`block text-xs font-bold uppercase tracking-wide ${godMode ? 'text-yellow-400' : 'text-slate-300'}`}>God Mode</span>
                            <span className="block text-[10px] text-slate-500">Control all players</span>
                        </div>
                    </label>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Load Scenario</p>
                    <div className="grid gap-2">
                        {Object.values(SCENARIO_KEYS).map(key => (
                            <button
                                key={key}
                                onClick={() => {
                                    loadScenario(key);
                                    // setIsVisible(false); // Optional: keep open to switch fast? Better to close for immersion check.
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

            <div className="mt-4 pt-3 border-t border-slate-700/50 text-[10px] text-slate-600 text-center font-mono">
                Press Ctrl+Shift+D to toggle
            </div>
        </div>
    </div>
  );
};

export default DebugMenu;
