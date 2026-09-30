import React from 'react';
import { Trophy, Clock, Target, RotateCcw, Home, Sparkles } from 'lucide-react';

interface VictoryScreenProps {
  kills: number;
  timeSurvived: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  kills,
  timeSurvived,
  onPlayAgain,
  onMainMenu,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none">
      <div className="max-w-md w-full bg-gradient-to-b from-slate-900 to-[#0c1220] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 flex flex-col items-center text-center">
        {/* Golden Trophy badge */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-bounce">
            <Trophy className="w-10 h-10 text-slate-950" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-1 font-game">
          CHAMPION
        </div>

        <h2 className="text-4xl sm:text-5xl font-black font-game text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-wider mb-1 uppercase">
          VICTORY!
        </h2>

        <p className="text-xs text-slate-300 mb-6 font-medium">
          You conquered the Last Zone and became the ultimate survivor.
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3 w-full bg-black/50 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300 uppercase font-bold">RANK</span>
            <span className="text-2xl font-black font-game text-amber-400 mt-1">
              #1 <span className="text-xs text-slate-400">WIN</span>
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Target className="w-3 h-3 text-red-400" />
              <span>KILLS</span>
            </span>
            <span className="text-2xl font-black font-game text-white mt-1">
              {kills}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>TIME</span>
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
            className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl font-game font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 active:scale-95 transition-all shadow-xl shadow-amber-500/30 border border-yellow-200"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>CLAIM GLORY / PLAY AGAIN</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
