/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, PlayerStats, LootItem, KillFeedItem, GameSettings } from './types/game';
import { GameEngine } from './game/engine/GameEngine';
import { CanvasView } from './components/CanvasView';
import { GameHUD } from './components/HUD/GameHUD';
import { MainMenu } from './components/menus/MainMenu';
import { PreGameScreen } from './components/menus/PreGameScreen';
import { PauseMenu } from './components/menus/PauseMenu';
import { GameOverScreen } from './components/menus/GameOverScreen';
import { VictoryScreen } from './components/menus/VictoryScreen';
import { SettingsModal } from './components/menus/SettingsModal';
import { HowToPlayModal } from './components/menus/HowToPlayModal';
import { AudioManager } from './game/audio/AudioManager';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.3,
  mouseSensitivity: 1.0,
  graphicsQuality: 'medium',
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('last_zone_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Match stats
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [zoneData, setZoneData] = useState({
    phase: 1,
    timer: 45,
    isShrinking: false,
    isOutside: false,
    currentRadius: 140,
    targetRadius: 100,
    currentX: 0,
    currentZ: 0,
    targetX: 0,
    targetZ: 0,
  });

  const [nearestLoot, setNearestLoot] = useState<LootItem | null>(null);
  const [hitMarker, setHitMarker] = useState<'none' | 'hit' | 'kill'>('none');
  const [playerDamaged, setPlayerDamaged] = useState(false);
  const [killFeedItems, setKillFeedItems] = useState<KillFeedItem[]>([]);
  const [matchResult, setMatchResult] = useState<{
    kills: number;
    timeSurvived: number;
    placement: number;
  }>({ kills: 0, timeSurvived: 0, placement: 15 });

  const engineRef = useRef<GameEngine | null>(null);
  const hitTimeoutRef = useRef<number | null>(null);
  const hurtTimeoutRef = useRef<number | null>(null);

  // Engine callbacks
  const handleStatsUpdate = useCallback((newStats: PlayerStats) => {
    setStats({ ...newStats });
  }, []);

  const handleZoneUpdate = useCallback((data: typeof zoneData) => {
    setZoneData(data);
  }, []);

  const handleNearestLoot = useCallback((item: LootItem | null) => {
    setNearestLoot(item);
  }, []);

  const handleHitMarker = useCallback((isKill: boolean) => {
    if (hitTimeoutRef.current) clearTimeout(hitTimeoutRef.current);
    setHitMarker(isKill ? 'kill' : 'hit');
    hitTimeoutRef.current = window.setTimeout(() => {
      setHitMarker('none');
    }, 140);
  }, []);

  const handlePlayerHurt = useCallback(() => {
    if (hurtTimeoutRef.current) clearTimeout(hurtTimeoutRef.current);
    setPlayerDamaged(true);
    hurtTimeoutRef.current = window.setTimeout(() => {
      setPlayerDamaged(false);
    }, 280);
  }, []);

  const handleKillFeed = useCallback((item: KillFeedItem) => {
    setKillFeedItems((prev) => [...prev.slice(-6), item]);
  }, []);

  const handleGameOver = useCallback((isVictory: boolean, finalStats: { kills: number; timeSurvived: number; placement: number }) => {
    setMatchResult(finalStats);
    setGameState(isVictory ? 'VICTORY' : 'ELIMINATED');
  }, []);

  const handleEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
  }, []);

  // Match flow triggers
  const startMatchFlow = () => {
    AudioManager.init();
    setKillFeedItems([]);
    setGameState('PRE_GAME');
  };

  const handleCountdownFinished = () => {
    if (engineRef.current) {
      engineRef.current.startMatch(settings.graphicsQuality);
      setGameState('PLAYING');
    }
  };

  const handlePause = () => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.togglePause();
      setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    if (engineRef.current && gameState === 'PAUSED') {
      engineRef.current.togglePause();
      setGameState('PLAYING');
    }
  };

  const handleRestart = () => {
    setKillFeedItems([]);
    setGameState('PRE_GAME');
  };

  const handleMainMenu = () => {
    if (engineRef.current) {
      engineRef.current.isRunning = false;
    }
    setGameState('MAIN_MENU');
  };

  // Sync audio volumes on start
  useEffect(() => {
    AudioManager.setVolumes(settings.masterVolume, settings.sfxVolume, settings.musicVolume);
  }, [settings]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#080b11] select-none font-game">
      {/* 3D WebGL Canvas Layer */}
      <CanvasView
        callbacks={{
          onStatsUpdate: handleStatsUpdate,
          onZoneUpdate: handleZoneUpdate,
          onNearestLoot: handleNearestLoot,
          onHitMarker: handleHitMarker,
          onPlayerHurt: handlePlayerHurt,
          onKillFeed: handleKillFeed,
          onGameOver: handleGameOver,
        }}
        settings={settings}
        onEngineReady={handleEngineReady}
      />

      {/* Main Menu */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          onPlay={startMatchFlow}
          onHowToPlay={() => setShowHowToPlay(true)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {/* Pre-Game Deployment Countdown */}
      {gameState === 'PRE_GAME' && (
        <PreGameScreen onStartMatch={handleCountdownFinished} />
      )}

      {/* In-Game HUD (visible while PLAYING or PAUSED) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && stats && (
        <GameHUD
          stats={stats}
          zoneData={zoneData}
          nearestLoot={nearestLoot}
          hitMarker={hitMarker}
          killFeedItems={killFeedItems}
          playerDamaged={playerDamaged}
          engine={engineRef.current}
          onPause={handlePause}
        />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onSettings={() => setShowSettings(true)}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Eliminated Screen */}
      {gameState === 'ELIMINATED' && (
        <GameOverScreen
          kills={matchResult.kills}
          timeSurvived={matchResult.timeSurvived}
          placement={matchResult.placement}
          onPlayAgain={startMatchFlow}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Victory Screen */}
      {gameState === 'VICTORY' && (
        <VictoryScreen
          kills={matchResult.kills}
          timeSurvived={matchResult.timeSurvived}
          onPlayAgain={startMatchFlow}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}
