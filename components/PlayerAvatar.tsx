
import React from 'react';
import { Player, Team } from '../types';

interface PlayerAvatarProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'bottom' | 'top' | 'left' | 'right' | 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isCurrentTurn, position }) => {
  const teamColor = player.team === Team.A ? 'border-blue-500' : 'border-red-500';
  const teamBg = player.team === Team.A ? 'bg-blue-600' : 'bg-red-600';

  return (
    <div className={`flex flex-col items-center gap-1 scale-90 sm:scale-100`}>
      <div className={`relative w-12 h-12 rounded-full border-2 ${teamColor} bg-slate-800 flex items-center justify-center shadow-xl transition-all duration-300 ${isCurrentTurn ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-emerald-900 scale-110' : ''}`}>
        <span className="text-white font-black text-sm">{player.name[0]}</span>
        
        {/* Team Indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${teamBg} border border-white flex items-center justify-center`}>
          <span className="text-[7px] text-white font-bold">{player.team === Team.A ? 'A' : 'B'}</span>
        </div>

        {/* Status Badges */}
        {player.hasOpened && (
            <div className="absolute -bottom-1 -left-1 bg-emerald-500 text-white text-[6px] px-1 rounded-full border border-white font-black uppercase">Opened</div>
        )}
      </div>
      <div className="bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
        <span className="text-[8px] font-bold text-white/80 uppercase truncate max-w-[60px] block">{player.name}</span>
      </div>
    </div>
  );
};

export default PlayerAvatar;
