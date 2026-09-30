import React from 'react';

interface CrosshairProps {
  hitMarker: 'none' | 'hit' | 'kill';
}

export const Crosshair: React.FC<CrosshairProps> = ({ hitMarker }) => {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-20">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Center dot */}
        <div className="w-1.5 h-1.5 bg-white/90 rounded-full shadow-sm shadow-black" />

        {/* 4 Crosshair lines */}
        <div className="absolute top-0 w-0.5 h-3 bg-white/80 rounded-full shadow" />
        <div className="absolute bottom-0 w-0.5 h-3 bg-white/80 rounded-full shadow" />
        <div className="absolute left-0 h-0.5 w-3 bg-white/80 rounded-full shadow" />
        <div className="absolute right-0 h-0.5 w-3 bg-white/80 rounded-full shadow" />

        {/* Hit Marker indicator: normal hit (white X) or kill (red X) */}
        {hitMarker !== 'none' && (
          <div className="absolute inset-0 flex items-center justify-center animate-ping duration-150">
            <svg
              className={`w-8 h-8 ${hitMarker === 'kill' ? 'text-red-500 scale-125' : 'text-white'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="5" x2="10" y2="10" />
              <line x1="19" y1="5" x2="14" y2="10" />
              <line x1="5" y1="19" x2="10" y2="14" />
              <line x1="19" y1="19" x2="14" y2="14" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
