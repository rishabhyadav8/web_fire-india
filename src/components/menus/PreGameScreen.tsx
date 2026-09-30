import React, { useState, useEffect } from 'react';
import { AudioManager } from '../../game/audio/AudioManager';
import { Users, MapPin, Radio } from 'lucide-react';

interface PreGameScreenProps {
  onStartMatch: () => void;
}

export const PreGameScreen: React.FC<PreGameScreenProps> = ({ onStartMatch }) => {
  const [countdown, setCountdown] = useState(3);
  const [statusText, setStatusText] = useState('MATCH FOUND');

  useEffect(() => {
    AudioManager.playCountdown(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 2) {
          AudioManager.playCountdown(false);
          setStatusText('DEPLOYING COMBATANTS...');
          return 1;
        }
        if (prev === 1) {
          AudioManager.playCountdown(true);
          setStatusText('DROP IN!');
          clearInterval(interval);
          setTimeout(() => {
            onStartMatch();
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onStartMatch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Radar ping animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-sky-400 flex items-center justify-center animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="w-10 h-10 text-sky-400 animate-pulse" />
          </div>
        </div>

        <div className="text-sky-400 font-game font-bold tracking-widest text-xs uppercase mb-1">
          {statusText}
        </div>

        <div className="text-6xl font-black font-game text-white my-3 tracking-widest drop-shadow-lg">
          {countdown > 0 ? countdown : 'GO!'}
        </div>

        {/* Match info card */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 w-full flex items-center justify-around text-xs mt-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <div className="text-slate-400 text-[10px]">COMBATANTS</div>
              <div className="font-bold text-slate-100 font-game">15 SURVIVORS</div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-slate-400 text-[10px]">ARENA</div>
              <div className="font-bold text-slate-100 font-game">HAZARD ISLAND</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
