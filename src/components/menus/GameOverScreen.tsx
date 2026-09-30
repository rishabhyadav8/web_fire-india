import React from 'react';
import { Skull, Clock, Target, RotateCcw, Home } from 'lucide-react';

interface GameOverScreenProps {
  kills: number;
  timeSurvived: number;
  placement: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  kills,
  timeSurvived,
  placement,
  onPlayAgain,
  onMainMenu,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 select-none">
      <div className="max-w-md w-full bg-slate-900/95 border border-red-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 flex flex-col items-center text-center">
        {/* Skull badge */}
        <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-3">
          <Skull className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black font-game text-red-500 tracking-wider mb-1 uppercase">
          ELIMINATED
        </h2>

        <p className="text-xs text-slate-400 mb-6">
          Better luck next drop. Adapt your strategy and fight for #1.
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3 w-full bg-black/40 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">PLACEMENT</span>
            <span className="text-xl sm:text-2xl font-black font-game text-amber-400 mt-1">
              #{placement} <span className="text-xs text-slate-500">/ 15</span>
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Target className="w-3 h-3 text-red-400" />
              <span>KILLS</span>
            </span>
            <span className="text-xl sm:text-2xl font-black font-game text-white mt-1">
              {kills}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>SURVIVED</span>
            </span>
            <span className="text-sm sm:text-base font-black font-game text-slate-200 mt-2">
              {formatTime(timeSurvived)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white active:scale-95 transition-all shadow-lg shadow-red-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
