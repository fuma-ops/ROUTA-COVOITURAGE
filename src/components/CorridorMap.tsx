import React, { useState } from 'react';
import { CorridorStop } from '../types';
import { MapPin, Navigation, Clock, Info } from 'lucide-react';

interface CorridorMapProps {
  corridor: CorridorStop[];
  originName: string;
  destinationName: string;
  durationMin?: number;
  distanceKm?: number;
  className?: string;
  onSelectStop?: (stop: CorridorStop) => void;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({
  corridor,
  originName,
  destinationName,
  durationMin = 35,
  distanceKm = 15,
  className = '',
  onSelectStop,
}) => {
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  // Approximate coordinate layout inside SVG viewBox: 760 x 280
  const points = [
    { x: 90, y: 110, id: 'c1', label: 'Targa', sub: 'Départ 08:00', type: 'origin' },
    { x: 280, y: 140, id: 'c2', label: 'Guéliz', sub: 'Arrêt 08:15', type: 'stop' },
    { x: 440, y: 200, id: 'c3', label: 'Hivernage', sub: 'Arrêt 08:25', type: 'stop' },
    { x: 670, y: 110, id: 'c4', label: 'Médina', sub: 'Arrivée 08:35', type: 'destination' },
  ];

  return (
    <div className={`relative bg-[#F4F4EE] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs ${className}`}>
      {/* Top Map meta bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
        <Navigation className="w-3.5 h-3.5 text-[#9E113E]" />
        <span>Corridor recommandé</span>
        <span className="text-slate-300">·</span>
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{durationMin} min</span>
        <span className="text-slate-300">·</span>
        <span>{distanceKm} km</span>
      </div>

      {/* SVG Canvas depicting Moroccan urban streets and the exact route corridor */}
      <svg
        viewBox="0 0 760 280"
        className="w-full h-56 md:h-64 object-cover select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle grid pattern resembling city blocks */}
          <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E6E7DC" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Base terrain */}
        <rect width="760" height="280" fill="#F4F4EE" />
        <rect width="760" height="280" fill="url(#streetGrid)" />

        {/* Urban zones / Gardens (Menara / Agdal hints in soft sage green) */}
        <rect x="360" y="210" width="120" height="50" rx="8" fill="#E2EAD8" />
        <rect x="580" y="40" width="130" height="90" rx="10" fill="#E9DFD4" />
        
        {/* City Streets network */}
        <path d="M 0 160 Q 200 170 380 120 T 760 160" fill="none" stroke="#FFFFFF" strokeWidth="9" />
        <path d="M 0 160 Q 200 170 380 120 T 760 160" fill="none" stroke="#E1E2D6" strokeWidth="7" />
        
        <path d="M 220 0 L 320 280" fill="none" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M 220 0 L 320 280" fill="none" stroke="#E1E2D6" strokeWidth="6" />

        <path d="M 490 0 L 450 280" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M 490 0 L 450 280" fill="none" stroke="#E1E2D6" strokeWidth="5" />

        {/* Avenue Mohammed VI curved boulevard */}
        <path d="M 120 280 C 260 180, 500 240, 620 0" fill="none" stroke="#FFFFFF" strokeWidth="9" />
        <path d="M 120 280 C 260 180, 500 240, 620 0" fill="none" stroke="#E1E2D6" strokeWidth="7" />

        {/* Typographic Moroccan landmark labels */}
        <text x="590" y="245" fill="#B0B5A7" fontSize="18" fontWeight="800" letterSpacing="4">
          MARRAKECH
        </text>
        <text x="245" y="160" fill="#78806F" fontSize="10" fontWeight="600" fontStyle="italic">
          Guéliz
        </text>
        <text x="460" y="228" fill="#78806F" fontSize="10" fontWeight="600" fontStyle="italic">
          Hivernage
        </text>
        <text x="635" y="75" fill="#78806F" fontSize="10" fontWeight="600" fontStyle="italic">
          Médina Ancienne
        </text>

        {/* Active Route Highway Stroke (Crimson brand color) */}
        {/* Glow / casing */}
        <path
          d="M 90 110 C 180 120, 230 140, 280 140 C 340 140, 390 195, 440 200 C 510 210, 590 130, 670 110"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 90 110 C 180 120, 230 140, 280 140 C 340 140, 390 195, 440 200 C 510 210, 590 130, 670 110"
          fill="none"
          stroke="#9E113E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="8 0"
        />

        {/* Corridor Waypoint Nodes */}
        {points.map((pt, idx) => {
          const isOrigin = pt.type === 'origin';
          const isDest = pt.type === 'destination';
          const isActive = activeStopId === pt.id;

          return (
            <g
              key={pt.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => {
                setActiveStopId(pt.id);
                if (corridor[idx] && onSelectStop) onSelectStop(corridor[idx]);
              }}
            >
              {/* Outer pulsing ping for origin */}
              {isOrigin && (
                <circle cx={pt.x} cy={pt.y} r="14" fill="#10B981" fillOpacity="0.2" className="animate-pulse" />
              )}
              {isDest && (
                <circle cx={pt.x} cy={pt.y} r="14" fill="#9E113E" fillOpacity="0.2" className="animate-pulse" />
              )}

              {/* Pin Base Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isOrigin || isDest ? "8" : "6"}
                fill={isOrigin ? "#10B981" : isDest ? "#9E113E" : "#9E113E"}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />

              {/* Inner white dot */}
              <circle cx={pt.x} cy={pt.y} r="2.5" fill="#FFFFFF" />

              {/* Text Label Pill */}
              <g transform={`translate(${pt.x - 35}, ${isOrigin || isDest ? pt.y - 32 : pt.y + 12})`}>
                <rect
                  width="70"
                  height="20"
                  rx="10"
                  fill="#FFFFFF"
                  stroke={isOrigin ? "#10B981" : isDest ? "#9E113E" : "#CBD5E1"}
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.08))"
                />
                <text
                  x="35"
                  y="14"
                  textAnchor="middle"
                  fill="#1E293B"
                  fontSize="10"
                  fontWeight="700"
                >
                  {pt.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Bottom corridor notice */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Prise en charge naturelle sans détour pour le conducteur</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5" />
          <span>Points d'arrêt confirmés par chat</span>
        </div>
      </div>
    </div>
  );
};
