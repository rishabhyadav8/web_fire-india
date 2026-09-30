import React, { useRef, useEffect } from 'react';
import { GameEngine, EngineCallbacks } from '../game/engine/GameEngine';
import { GameSettings } from '../types/game';

interface CanvasViewProps {
  callbacks: EngineCallbacks;
  settings: GameSettings;
  onEngineReady: (engine: GameEngine) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  callbacks,
  settings,
  onEngineReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, callbacks, settings);
    engineRef.current = engine;
    onEngineReady(engine);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update settings in running engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSettings(settings);
    }
  }, [settings]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block touch-none outline-none cursor-crosshair"
    />
  );
};
