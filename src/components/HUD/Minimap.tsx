import React, { useEffect, useRef } from 'react';
import { MAP_SIZE, MAP_LOCATIONS } from '../../config/constants';
import { BotEntity } from '../../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  safeZone: {
    currentX: number;
    currentZ: number;
    currentRadius: number;
    targetX: number;
    targetZ: number;
    targetRadius: number;
  };
  bots: BotEntity[];
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerYaw,
  safeZone,
  bots,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 150; // pixels

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    const half = size / 2;
    // Map units to canvas pixels scale
    const radarRange = 160; // radius of world visible on minimap
    const scale = half / radarRange;

    // Background circle (Dark tactical radar)
    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, half - 3, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#0b1320';
    ctx.fillRect(0, 0, size, size);

    // Radar grid rings
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(half, half, half * 0.35, 0, Math.PI * 2);
    ctx.arc(half, half, half * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Map Locations labels/dots
    MAP_LOCATIONS.forEach((loc) => {
      const rx = half + (loc.x - playerX) * scale;
      const rz = half + (loc.z - playerZ) * scale;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(rx, rz, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1. Current Safe Zone (Blue circle)
    const zx = half + (safeZone.currentX - playerX) * scale;
    const zz = half + (safeZone.currentZ - playerZ) * scale;
    const zr = safeZone.currentRadius * scale;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(zx, zz, Math.max(1, zr), 0, Math.PI * 2);
    ctx.stroke();

    // 2. Next Target Safe Zone (Dashed white circle)
    const nzx = half + (safeZone.targetX - playerX) * scale;
    const nzz = half + (safeZone.targetZ - playerZ) * scale;
    const nzr = safeZone.targetRadius * scale;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(nzx, nzz, Math.max(1, nzr), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. All Living Bots (Radar markers with edge clamping and pulsing halo)
    bots.forEach((bot) => {
      if (bot.state === 'DEAD') return;
      let bx = half + (bot.x - playerX) * scale;
      let bz = half + (bot.z - playerZ) * scale;

      const dx = bx - half;
      const dz = bz - half;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const maxR = half - 8;
      if (dist > maxR) {
        bx = half + (dx / dist) * maxR;
        bz = half + (dz / dist) * maxR;
      }

      // Enemy dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bx, bz, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Glowing threat halo
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, bz, 6, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Player icon in center (Bright triangle facing yaw)
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(-playerYaw + Math.PI); // rotate with player orientation

    ctx.fillStyle = '#10b981'; // vibrant green player indicator
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();

    // Player sight cone
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 22, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();

    // Radar border & compass ring
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.stroke();

    // North indicator
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', half, 14);
  }, [playerX, playerZ, playerYaw, safeZone, bots]);

  return (
    <div className="relative p-1 bg-black/50 backdrop-blur-md rounded-full border border-sky-500/40 shadow-xl shadow-sky-950/40">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block rounded-full"
      />
    </div>
  );
};
