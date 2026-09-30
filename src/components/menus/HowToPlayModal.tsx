import React, { useState } from 'react';
import { X, Monitor, Smartphone, Shield, Zap, Crosshair } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'desktop' | 'mobile' | 'weapons'>('desktop');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-black font-game text-white tracking-wider uppercase">
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <button
            onClick={() => setTab('desktop')}
            className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              tab === 'desktop'
                ? 'bg-sky-500 text-slate-950 font-game shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>DESKTOP</span>
          </button>

          <button
            onClick={() => setTab('mobile')}
            className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              tab === 'mobile'
                ? 'bg-sky-500 text-slate-950 font-game shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>MOBILE</span>
          </button>

          <button
            onClick={() => setTab('weapons')}
            className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              tab === 'weapons'
                ? 'bg-sky-500 text-slate-950 font-game shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>ARSENAL</span>
          </button>
        </div>

        {/* Content based on tab */}
        <div className="flex flex-col gap-4 text-xs text-slate-300 pb-4">
          {tab === 'desktop' && (
            <div className="flex flex-col gap-2.5">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Move Forward / Back / Strafe</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  W A S D
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Sprint (Faster Movement)</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  SHIFT
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Jump Obstacles</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  SPACE
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Aim / Rotate Camera</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  MOUSE (CLICK TO LOCK)
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Shoot Active Weapon</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  LEFT CLICK
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Reload Magazine</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  R
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Loot Weapons & Items</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  E
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Apply Medkit / Heal</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  H
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Switch Weapons (Primary, Secondary, Sidearm)</span>
                <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  1 / 2 / 3
                </span>
              </div>
            </div>
          )}

          {tab === 'mobile' && (
            <div className="flex flex-col gap-3">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5 font-game">
                  <Smartphone className="w-4 h-4" />
                  <span>VIRTUAL JOYSTICK (LEFT SIDE)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Touch and drag anywhere on the bottom-left area of your screen to walk. Push the knob near the outer edge to automatically sprint!
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5 font-game">
                  <Crosshair className="w-4 h-4" />
                  <span>SWIPE AIMING (RIGHT SIDE)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Drag your right thumb on the right half of the screen to smoothly rotate the camera and adjust your crosshair aim.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5 font-game">
                  <Zap className="w-4 h-4" />
                  <span>ACTION BUTTONS</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tap the large orange <strong>FIRE</strong> button to shoot. Use dedicated buttons for <strong>JUMP</strong>, <strong>RELOAD</strong>, <strong>HEAL</strong>, <strong>SWAP</strong>, and <strong>LOOT</strong>.
                </p>
              </div>
            </div>
          )}

          {tab === 'weapons' && (
            <div className="flex flex-col gap-2.5">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-sky-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sky-400 font-game">Pulse Rifle</span>
                  <span className="text-[10px] text-slate-400">Assault Rifle • Heavy Ammo</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Balanced automatic rifle with steady recoil and 30-round mag.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-purple-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-purple-400 font-game">Viper SMG</span>
                  <span className="text-[10px] text-slate-400">Submachine Gun • Light Ammo</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Blistering fire rate and rapid reload. Devastating up close.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-orange-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-orange-400 font-game">Ranger Shotgun</span>
                  <span className="text-[10px] text-slate-400">Scattergun • Shells</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Fires 7 heavy tungsten pellets per blast. High point-blank burst damage.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-yellow-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-yellow-400 font-game">Falcon DMR</span>
                  <span className="text-[10px] text-slate-400">Marksman Rifle • Heavy Ammo</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Semi-automatic sniper rifle with pinpoint accuracy across the map.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-400 font-game">Sidekick Pistol</span>
                  <span className="text-[10px] text-slate-400">Sidearm • Light Ammo</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Always reliable backup weapon with ultra-fast reload speed.
                </p>
              </div>
            </div>
          )}

          {/* Battle Royale rules footer */}
          <div className="bg-sky-950/30 border border-sky-800/40 p-3 rounded-xl flex items-start gap-2 text-[11px] text-slate-300">
            <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sky-300">SURVIVAL RULE:</strong> Watch your minimap for the Safe Zone circle. When the timer hits zero, the electric boundary shrinks. Anyone outside takes continuous lethal damage!
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all mt-auto"
        >
          READY FOR DROP
        </button>
      </div>
    </div>
  );
};
