import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="max-w-sm w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black font-game text-white tracking-wider mb-1 uppercase">
          MATCH PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">Battle paused. AI and zone are frozen.</p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-sky-500 hover:bg-sky-400 text-slate-950 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME MATCH</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART MATCH</span>
          </button>

          <button
            onClick={onSettings}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-red-950/40 border border-red-900/60 hover:border-red-700 text-red-300 active:scale-95 transition-all mt-2"
          >
            <Home className="w-4 h-4 text-red-400" />
            <span>EXIT TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
