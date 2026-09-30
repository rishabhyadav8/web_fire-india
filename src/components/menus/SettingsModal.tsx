import React from 'react';
import { GameSettings } from '../../types/game';
import { X, Volume2, Monitor, MousePointer } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleChange = (key: keyof GameSettings, value: unknown) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    try {
      localStorage.setItem('last_zone_settings', JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-black font-game text-white tracking-wider uppercase">
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="flex flex-col gap-5 py-5 text-xs text-slate-300">
          {/* Audio section */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              <span>AUDIO</span>
            </span>

            {/* Master Volume */}
            <div>
              <div className="flex justify-between mb-1 text-[11px] font-bold">
                <span>Master Volume</span>
                <span className="font-mono text-sky-300">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between mb-1 text-[11px] font-bold">
                <span>SFX Volume (Gunfire & Combat)</span>
                <span className="font-mono text-sky-300">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Music/Ambience Volume */}
            <div>
              <div className="flex justify-between mb-1 text-[11px] font-bold">
                <span>Ambience & Fanfares</span>
                <span className="font-mono text-sky-300">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Controls section */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MousePointer className="w-4 h-4" />
              <span>AIM CONTROLS</span>
            </span>

            <div>
              <div className="flex justify-between mb-1 text-[11px] font-bold">
                <span>Look / Mouse Sensitivity</span>
                <span className="font-mono text-amber-300">
                  {settings.mouseSensitivity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={(e) => handleChange('mouseSensitivity', parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Graphics Quality */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-4 h-4" />
              <span>GRAPHICS QUALITY</span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleChange('graphicsQuality', q)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs uppercase transition-all ${
                    settings.graphicsQuality === q
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-game'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">
              Low: High FPS for older mobile devices. High: Dynamic shadows and dense cover.
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-game font-bold text-sm tracking-wider uppercase bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
