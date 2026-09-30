import React, { useState, useEffect } from 'react';
import { PlayerStats, LootItem, KillFeedItem } from '../../types/game';
import { GameEngine } from '../../game/engine/GameEngine';
import { Minimap } from './Minimap';
import { Crosshair } from './Crosshair';
import { KillFeed } from './KillFeed';
import { MobileControls } from './MobileControls';
import { Shield, Heart, Skull, Users, Pause, Crosshair as CrosshairIcon, Zap } from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  zoneData: {
    phase: number;
    timer: number;
    isShrinking: boolean;
    isOutside: boolean;
    currentRadius: number;
    targetRadius: number;
    currentX: number;
    currentZ: number;
    targetX: number;
    targetZ: number;
  };
  nearestLoot: LootItem | null;
  hitMarker: 'none' | 'hit' | 'kill';
  killFeedItems: KillFeedItem[];
  playerDamaged: boolean;
  engine: GameEngine | null;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  zoneData,
  nearestLoot,
  hitMarker,
  killFeedItems,
  playerDamaged,
  engine,
  onPause,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const activeSlot =
    stats.activeSlot === 'primary'
      ? stats.primaryWeapon
      : stats.activeSlot === 'secondary'
      ? stats.secondaryWeapon
      : stats.sidearmWeapon;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInteract = () => {
    if (engine) engine.input.triggerMobileInteract();
  };

  const handleSwitchWeapon = () => {
    if (engine) {
      if (stats.activeSlot === 'primary') {
        engine.stats.activeSlot = stats.secondaryWeapon ? 'secondary' : 'sidearm';
      } else if (stats.activeSlot === 'secondary') {
        engine.stats.activeSlot = 'sidearm';
      } else {
        engine.stats.activeSlot = stats.primaryWeapon ? 'primary' : 'sidearm';
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20">
      {/* Damage & Zone Vignettes */}
      {playerDamaged && <div className="fixed inset-0 damage-overlay pointer-events-none z-30" />}
      {zoneData.isOutside && <div className="fixed inset-0 zone-overlay pointer-events-none z-30" />}

      {/* Crosshair */}
      <Crosshair hitMarker={hitMarker} />

      {/* TOP BAR */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-auto">
        {/* Top-Left: Game info & Survivors */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-sky-500/30 shadow-lg">
            <span className="font-game font-extrabold text-sky-400 tracking-wider text-sm">LAST ZONE</span>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.aliveCount} <span className="text-slate-400 text-[10px]">ALIVE</span></span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Skull className="w-3.5 h-3.5 text-red-400" />
              <span>{stats.kills} <span className="text-slate-400 text-[10px]">KILLS</span></span>
            </div>
          </div>

          {/* God mode status badge */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/60 rounded-lg text-amber-300 text-[11px] font-bold tracking-wider shadow-md w-fit font-game animate-pulse">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>ANNIHILATOR MODE: 1-SHOT MASS WIPE OUT ALL • IMMORTAL</span>
            </div>
            {stats.aliveCount > 1 && (
              <div className="text-[10px] text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded w-fit">
                🎯 1 Shot Eliminates All {stats.aliveCount - 1} Remaining Enemies & Claims Victory!
              </div>
            )}
          </div>
        </div>

        {/* Top-Center: Safe Zone Countdown & Alerts */}
        <div className="flex flex-col items-center">
          {zoneData.isOutside ? (
            <div className="bg-sky-600/90 border border-sky-400 text-white font-game px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-200" />
              <span>OUTSIDE SAFE ZONE (IMMUNE - NO DAMAGE)</span>
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-md border border-sky-500/30 px-4 py-1 rounded-full text-xs font-semibold text-sky-200 shadow-md flex items-center gap-2 font-game">
              <div className={`w-2 h-2 rounded-full ${zoneData.isShrinking ? 'bg-orange-400 animate-ping' : 'bg-sky-400'}`} />
              <span>
                {zoneData.isShrinking
                  ? `ZONE SHRINKING: ${formatTimer(zoneData.timer)}`
                  : `ZONE COLLAPSE IN: ${formatTimer(zoneData.timer)}`}
              </span>
              <span className="text-slate-400 text-[10px] uppercase">P{zoneData.phase}</span>
            </div>
          )}
        </div>

        {/* Top-Right: Minimap & Killfeed & Pause */}
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onPause}
              className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:border-sky-400 active:scale-95 transition-all shadow"
            >
              <Pause className="w-4 h-4" />
            </button>
            {engine && (
              <Minimap
                playerX={engine.playerPos.x}
                playerZ={engine.playerPos.z}
                playerYaw={engine.yaw}
                safeZone={zoneData}
                bots={engine.botManager.bots}
              />
            )}
          </div>
          <KillFeed items={killFeedItems} />
        </div>
      </div>

      {/* CENTER INTERACT PROMPT */}
      {nearestLoot && (
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md border border-amber-400/80 px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <span className="px-2 py-0.5 bg-amber-400 text-black font-extrabold text-xs rounded font-game">
            E
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {nearestLoot.type === 'weapon'
              ? `Pick up ${nearestLoot.subType.replace('_', ' ')}`
              : nearestLoot.type === 'ammo'
              ? `Collect ${nearestLoot.subType} ammo (${nearestLoot.count})`
              : `Take ${nearestLoot.subType.replace('_', ' ')}`}
          </span>
        </div>
      )}

      {/* BOTTOM-LEFT: Health & Armor & Quick Heals */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 max-w-xs pointer-events-auto">
        {/* Healing progress banner */}
        {stats.isHealing && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-2 rounded-lg backdrop-blur-md text-xs text-emerald-200">
            <div className="flex justify-between font-bold mb-1">
              <span>{stats.healItemName}</span>
              <span>{Math.floor(stats.healProgress * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-100"
                style={{ width: `${stats.healProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-xl flex flex-col gap-2">
          {/* Armor Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 mb-0.5">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>ARMOR</span>
              </div>
              <span>100% UNBREAKABLE</span>
            </div>
            <div className="w-48 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-200"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 mb-0.5">
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>HEALTH</span>
              </div>
              <span className="text-emerald-300 font-extrabold">
                100 HP (IMMORTAL)
              </span>
            </div>
            <div className="w-48 h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-emerald-500/20">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-200"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Quick Consumable Counts */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-700/40 text-[10px] text-slate-300">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Medkit: {stats.inventory.medkits}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Q-Heal: {stats.inventory.quickHeals}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Armor: {stats.inventory.armorPacks}</span>
            </div>
            <span className="text-[9px] text-slate-400 ml-auto font-mono">[H]</span>
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT: Weapons & Ammo Indicator */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Weapon Slots Selector: 1, 2, 3 */}
        <div className="flex items-center gap-1.5">
          {/* Primary */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-md transition-all ${
              stats.activeSlot === 'primary'
                ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-md scale-105'
                : 'bg-black/50 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-[9px] text-slate-400 font-mono">1 • PRIMARY</div>
            <div>{stats.primaryWeapon ? stats.primaryWeapon.weapon.name : 'EMPTY'}</div>
          </div>

          {/* Secondary */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-md transition-all ${
              stats.activeSlot === 'secondary'
                ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-md scale-105'
                : 'bg-black/50 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-[9px] text-slate-400 font-mono">2 • SECONDARY</div>
            <div>{stats.secondaryWeapon ? stats.secondaryWeapon.weapon.name : 'EMPTY'}</div>
          </div>

          {/* Sidearm */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-md transition-all ${
              stats.activeSlot === 'sidearm'
                ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-md scale-105'
                : 'bg-black/50 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-[9px] text-slate-400 font-mono">3 • SIDEARM</div>
            <div>{stats.sidearmWeapon.weapon.name}</div>
          </div>
        </div>

        {/* Active Weapon Card */}
        {activeSlot && (
          <div className="bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span
                className="font-game font-extrabold text-sm"
                style={{ color: activeSlot.weapon.color }}
              >
                {activeSlot.weapon.name}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {activeSlot.weapon.type} • {activeSlot.weapon.ammoType}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-700" />

            {/* Mag & Reserve */}
            <div className="flex items-baseline gap-1 font-game">
              <span
                className={`text-2xl font-black ${
                  activeSlot.currentMag <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
                }`}
              >
                {activeSlot.currentMag}
              </span>
              <span className="text-slate-500 font-bold text-sm">/</span>
              <span className="text-slate-400 text-xs font-bold">
                {stats.ammo[activeSlot.weapon.ammoType]}
              </span>
            </div>

            {/* Reloading status */}
            {activeSlot.isReloading && (
              <span className="text-[10px] font-bold text-amber-400 animate-pulse uppercase tracking-wider">
                RELOADING...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile Touch Controls Overlay */}
      {isTouchDevice && (
        <MobileControls
          engine={engine}
          hasNearestLoot={!!nearestLoot}
          onInteract={handleInteract}
          onSwitchWeapon={handleSwitchWeapon}
        />
      )}
    </div>
  );
};
