import React, { useRef, useState, useEffect } from 'react';
import { GameEngine } from '../../game/engine/GameEngine';
import { Crosshair, RotateCcw, ArrowUp, Plus, RefreshCw, Hand } from 'lucide-react';

interface MobileControlsProps {
  engine: GameEngine | null;
  hasNearestLoot: boolean;
  onInteract: () => void;
  onSwitchWeapon: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  engine,
  hasNearestLoot,
  onInteract,
  onSwitchWeapon,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [joystickActive, setJoystickActive] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Left joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setJoystickActive(true);
    setJoystickPos({ x: 0, y: 0 });
    if (engine) engine.input.joystickActive = true;
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    const maxRadius = 45;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setJoystickPos({ x: knobX, y: knobY });

    if (engine) {
      engine.input.joystickVector = {
        x: knobX / maxRadius,
        y: knobY / maxRadius,
      };
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    if (engine) {
      engine.input.joystickActive = false;
      engine.input.joystickVector = { x: 0, y: 0 };
    }
  };

  // Right look surface touch handlers
  const handleLookTouchStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        if (engine) {
          engine.input.addTouchLook(dx, dy);
        }
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  return (
    <>
      {/* Portrait warning banner */}
      {isPortrait && (
        <div className="fixed top-2 left-4 right-4 z-50 p-2 bg-amber-500/90 text-black text-center text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 animate-bounce">
          <RotateCcw className="w-4 h-4" />
          <span>Rotate device to landscape mode for the best battle royale experience</span>
        </div>
      )}

      {/* Right-half look swipe area */}
      <div
        className="fixed top-20 right-0 bottom-0 w-1/2 z-10 touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      />

      {/* Left-side Virtual Joystick */}
      <div className="fixed bottom-6 left-6 z-20 select-none touch-none">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className="relative w-28 h-28 rounded-full bg-slate-900/50 backdrop-blur-md border-2 border-sky-400/40 flex items-center justify-center shadow-lg"
        >
          {/* Inner ring */}
          <div className="w-14 h-14 rounded-full border border-sky-300/20" />
          {/* Draggable Knob */}
          <div
            ref={joystickKnobRef}
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
            className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 shadow-md border border-white/40 flex items-center justify-center pointer-events-none transition-transform duration-75"
          >
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
        </div>
      </div>

      {/* Right-side Action Buttons */}
      <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-3 select-none pointer-events-auto">
        {/* Secondary Row: Switch weapon, Heal, Interact */}
        <div className="flex items-center gap-2">
          {hasNearestLoot && (
            <button
              onClick={onInteract}
              className="w-13 h-13 rounded-full bg-amber-500/80 border border-amber-300 text-black font-bold flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg animate-pulse"
            >
              <Hand className="w-5 h-5" />
              <span className="text-[9px]">LOOT</span>
            </button>
          )}

          <button
            onClick={() => engine?.input.triggerMobileHeal()}
            className="w-12 h-12 rounded-full bg-emerald-600/80 border border-emerald-400/50 text-white flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <Plus className="w-5 h-5 text-emerald-200" />
            <span className="text-[9px] font-bold">HEAL</span>
          </button>

          <button
            onClick={onSwitchWeapon}
            className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-600 text-white flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <RefreshCw className="w-5 h-5 text-sky-400" />
            <span className="text-[9px] font-bold">SWAP</span>
          </button>
        </div>

        {/* Primary Row: Jump, Reload, Big FIRE button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => engine?.input.triggerMobileJump()}
            className="w-13 h-13 rounded-full bg-slate-800/80 border border-slate-600 text-white flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <ArrowUp className="w-6 h-6 text-sky-300" />
            <span className="text-[9px] font-bold">JUMP</span>
          </button>

          <button
            onClick={() => engine?.input.triggerMobileReload()}
            className="w-13 h-13 rounded-full bg-slate-800/80 border border-slate-600 text-white flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] font-bold">RELOAD</span>
          </button>

          {/* Large FIRE button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine?.input.triggerMobileShoot(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              engine?.input.triggerMobileShoot(false);
            }}
            onMouseDown={() => engine?.input.triggerMobileShoot(true)}
            onMouseUp={() => engine?.input.triggerMobileShoot(false)}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 border-2 border-yellow-300 text-white flex flex-col items-center justify-center active:scale-95 shadow-xl shadow-red-950/60 animate-pulse"
          >
            <Crosshair className="w-8 h-8 text-white drop-shadow" />
            <span className="text-[10px] font-black tracking-wider text-yellow-100">WIPE ALL</span>
          </button>
        </div>
      </div>
    </>
  );
};
