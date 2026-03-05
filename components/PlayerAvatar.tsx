
import React from 'react';
import { Player, Team } from '../shared/types';

interface PlayerAvatarProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'bottom' | 'top' | 'left' | 'right' | 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isCurrentTurn, position }) => {
  const teamColor = player.team === Team.A ? 'border-blue-500' : 'border-red-500';
  const teamBg = player.team === Team.A ? 'bg-blue-600' : 'bg-red-600';
  const hasName = player.name && player.name.trim() !== '';

  return (
    <div className={`flex flex-col items-center gap-1 scale-90 sm:scale-100 transition-transform duration-500 ${isCurrentTurn ? 'scale-110 z-20' : 'opacity-80'}`}>
      <div className={`relative w-12 h-12 rounded-full border-2 ${teamColor} bg-slate-800 flex items-center justify-center shadow-xl transition-all duration-300 ${isCurrentTurn ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-emerald-900 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : ''}`}>
        <span className="text-white font-black text-sm">
            {hasName ? player.name[0].toUpperCase() : <i className="fa-solid fa-user text-slate-500 text-xs"></i>}
        </span>
        
        {/* Turn Badge */}
        {isCurrentTurn && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-bounce whitespace-nowrap border border-black/20">
                ACTIVE
            </div>
        )}

        {/* Team Indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${teamBg} border border-white flex items-center justify-center`}>
          <span className="text-[7px] text-white font-bold">{player.team === Team.A ? 'A' : 'B'}</span>
        </div>

        {/* Status Badges */}
        {player.hasOpened && (
            <div className="absolute -bottom-1 -left-1 bg-emerald-500 text-white text-[6px] px-1 rounded-full border border-white font-black uppercase">Opened</div>
        )}
      </div>
      <div className={`bg-black/60 px-2 py-0.5 rounded-full border transition-colors ${isCurrentTurn ? 'border-yellow-400/50 bg-yellow-400/10' : 'border-white/10'} backdrop-blur-sm`}>
        <span className={`text-[8px] font-bold uppercase truncate max-w-[80px] block ${isCurrentTurn ? 'text-yellow-400' : (hasName ? 'text-white/80' : 'text-white/30 italic')}`}>
            {hasName ? player.name : 'Waiting...'}
        </span>
      </div>
    </div>
  );
};

export default PlayerAvatar;
