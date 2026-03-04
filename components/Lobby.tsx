import React, { useState } from 'react';
import { useGameStore } from '../store';

const Lobby: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState(localStorage.getItem('dhappa_player_name') || '');
  const initGame = useGameStore(state => state.initGame);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !playerName) return;
    localStorage.setItem('dhappa_player_name', playerName);
    initGame(playerName, roomId);
  };

  const handleCreate = () => {
    if (!playerName) return;
    const newRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem('dhappa_player_name', playerName);
    initGame(playerName, newRoomId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Dhappa Baaji</h1>
      
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your name"
          />
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
      </div>
    </div>
  );
};

export default Lobby;