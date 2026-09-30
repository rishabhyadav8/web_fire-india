import React from 'react';
import { Play, HelpCircle, Settings, ShieldAlert, Award, Crosshair } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onHowToPlay,
  onSettings,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#080d1a] via-[#091122] to-[#04060a] p-4 select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(14,165,233,0.15),transparent_70%)] pointer-events-none" />

      {/* Decorative Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-xl w-full flex flex-col items-center text-center">
        {/* Game Title Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm font-game">
          <Crosshair className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>3D BROWSER BATTLE ROYALE</span>
        </div>

        {/* Main Logo */}
        <h1 className="text-5xl sm:text-7xl font-black font-game tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-sky-400 drop-shadow-2xl mb-2">
          LAST ZONE
        </h1>

        <p className="text-slate-400 text-sm sm:text-base font-medium max-w-md mb-8">
          Survive. Adapt. Be the last. Drop into the island, scavenge high-tier fictional weapons, outsmart 14 survivors, and escape the shrinking ring.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onPlay}
            className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-game font-extrabold text-base tracking-wider uppercase bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-sky-500/25 border border-sky-200/50"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
            <span>PLAY MATCH</span>
          </button>

          <button
            onClick={onHowToPlay}
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:border-sky-400 hover:text-white active:scale-95 transition-all backdrop-blur-md shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>HOW TO PLAY</span>
          </button>

          <button
            onClick={onSettings}
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:border-sky-400 hover:text-white active:scale-95 transition-all backdrop-blur-md shadow-md"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>SETTINGS</span>
          </button>
        </div>

        {/* Tactical Features Badges */}
        <div className="grid grid-cols-3 gap-3 w-full mt-10 text-left">
          <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-sky-400 font-bold text-xs flex items-center gap-1 font-game">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>THE ZONE</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              4 shrinking phases. Stay inside or take lethal radiation ticks.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-amber-400 font-bold text-xs flex items-center gap-1 font-game">
              <Crosshair className="w-3.5 h-3.5" />
              <span>ARSENAL</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Pulse Rifle, Viper SMG, Ranger Shotgun, Falcon DMR & Sidekick.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1 font-game">
              <Award className="w-3.5 h-3.5" />
              <span>CROSS-PLAY</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Full desktop keyboard/mouse + fluid dual mobile touch controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
