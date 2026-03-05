import React, { useState } from 'react';
import { useGameStore } from '../store';

interface LobbyProps {
  initialRoomId: string;
}

const Lobby: React.FC<LobbyProps> = ({ initialRoomId }) => {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [playerName, setPlayerName] = useState(localStorage.getItem('dhappa_player_name') || '');
  const [passcode, setPasscode] = useState('');
  const initGame = useGameStore(state => state.initGame);

  const validate = () => {
    if (!playerName) {
      alert('Please enter your name');
      return false;
    }
    if (!passcode || passcode.length < 4) {
      alert('Passcode must be at least 4 digits');
      return false;
    }
    return true;
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const cleanRoomId = roomId.trim().toUpperCase();
    if (!cleanRoomId) {
      alert('Please enter a Room ID');
      return;
    }
    const cleanPlayerName = playerName.trim();
    localStorage.setItem('dhappa_player_name', cleanPlayerName);
    initGame(cleanPlayerName, cleanRoomId, passcode.trim());
  };

  const handleCreate = () => {
    if (!validate()) return;
    const newRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const cleanPlayerName = playerName.trim();
    localStorage.setItem('dhappa_player_name', cleanPlayerName);
    initGame(cleanPlayerName, newRoomId, passcode.trim());
  };

  const clearAllData = () => {
    if (confirm('This will clear all saved room tokens and your name. Are you sure?')) {
        // Clear everything starting with dhappa_
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dhappa_')) {
                localStorage.removeItem(key);
            }
        });
        window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Dhappa Baaji</h1>
      
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Rejoin Passcode (4+ digits)</label>
          <input 
            type="password" 
            inputMode="numeric"
            pattern="[0-9]*"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Choose a passcode"
          />
          <p className="text-[10px] text-slate-500 mt-1">Use this to rejoin from other devices.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleCreate}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition"
          >
            Create New Game
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500">OR</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ENTER-ROOM-ID"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition"
            >
              Join Existing Game
            </button>
          </form>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center">
            <button 
                onClick={clearAllData}
                className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
                <i className="fa-solid fa-trash-can"></i>
                Clear Saved Sessions
            </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;