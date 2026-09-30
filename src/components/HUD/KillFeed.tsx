import React from 'react';
import { KillFeedItem } from '../../types/game';

interface KillFeedProps {
  items: KillFeedItem[];
}

export const KillFeed: React.FC<KillFeedProps> = ({ items }) => {
  return (
    <div className="flex flex-col gap-1.5 items-end pointer-events-none max-w-xs">
      {items.slice(-4).map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
            item.isPlayerKill
              ? 'bg-amber-500/25 border border-amber-400/60 text-amber-200'
              : item.isPlayerVictim
              ? 'bg-red-500/30 border border-red-500/70 text-red-200'
              : 'bg-black/60 border border-slate-700/50 text-slate-300'
          }`}
        >
          <span className={item.isPlayerKill ? 'text-amber-400 font-bold' : 'text-slate-100'}>
            {item.killer}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 px-1 bg-white/10 rounded">
            {item.weapon}
          </span>
          <span className={item.isPlayerVictim ? 'text-red-400 font-bold' : 'text-slate-300'}>
            {item.victim}
          </span>
        </div>
      ))}
    </div>
  );
};
