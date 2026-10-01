import React from 'react';

export const MarrakechArtwork: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Warm atmospheric gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5DDD2]/40 via-[#F7ECE7]/30 to-transparent" />

      {/* Stylized vector illustration of Marrakech sunset skyline: Koutoubia tower, arches, palm trees */}
      <svg
        viewBox="0 0 1200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full object-cover opacity-85"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#FECDD3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="duneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2A585" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C9735A" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="cityGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A85740" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7E221E" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="towerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9E1238" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6C1D2E" stopOpacity="0.55" />
          </linearGradient>

          <linearGradient id="palmsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#882C3D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4A1525" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Soft sun / warm glow behind minaret */}
        <circle cx="820" cy="190" r="140" fill="url(#skyGrad)" />
        <circle cx="820" cy="190" r="85" fill="#FFE4E6" fillOpacity="0.5" />

        {/* Distant Atlas mountains silhouette */}
        <path
          d="M0 340 L180 290 L320 320 L520 270 L720 320 L860 260 L980 300 L1120 280 L1200 310 L1200 500 L0 500 Z"
          fill="#E7BAA6"
          fillOpacity="0.25"
        />

        {/* Intermediate ramparts / Medina walls */}
        <path
          d="M100 370 L140 370 L140 355 L160 355 L160 370 L220 370 L220 350 L240 350 L240 370 L340 370 L340 340 L380 340 L380 370 L480 370 L480 360 L500 360 L500 370 L600 370 L750 370 L750 355 L770 355 L770 370 L1200 370 L1200 500 L0 500 L0 370 Z"
          fill="url(#cityGradFar)"
        />

        {/* Famous Koutoubia Minaret Silhouette (around x=820) */}
        <g transform="translate(760, 60)">
          {/* Main Tower body */}
          <rect x="35" y="100" width="60" height="260" fill="url(#towerGrad)" rx="2" />
          
          {/* Tower decorative carved arches & patterns */}
          <rect x="42" y="125" width="18" height="35" rx="9" fill="#FFF" fillOpacity="0.3" />
          <rect x="68" y="125" width="18" height="35" rx="9" fill="#FFF" fillOpacity="0.3" />
          <rect x="42" y="175" width="44" height="28" rx="4" fill="#FFF" fillOpacity="0.25" />
          <rect x="42" y="215" width="18" height="40" rx="9" fill="#FFF" fillOpacity="0.25" />
          <rect x="68" y="215" width="18" height="40" rx="9" fill="#FFF" fillOpacity="0.25" />

          {/* Tower Crenellations / Balcony */}
          <rect x="30" y="90" width="70" height="12" fill="url(#towerGrad)" rx="2" />
          <rect x="32" y="82" width="10" height="10" fill="url(#towerGrad)" />
          <rect x="46" y="82" width="10" height="10" fill="url(#towerGrad)" />
          <rect x="60" y="82" width="10" height="10" fill="url(#towerGrad)" />
          <rect x="74" y="82" width="10" height="10" fill="url(#towerGrad)" />
          <rect x="88" y="82" width="10" height="10" fill="url(#towerGrad)" />

          {/* Lantern upper turret */}
          <rect x="47" y="45" width="36" height="40" fill="url(#towerGrad)" rx="1" />
          <rect x="54" y="55" width="22" height="20" rx="10" fill="#FFF" fillOpacity="0.3" />

          {/* Jamur - Golden Orbs spire */}
          <line x1="65" y1="45" x2="65" y2="8" stroke="#9E1238" strokeWidth="3" />
          <circle cx="65" cy="36" r="6" fill="#F59E0B" fillOpacity="0.8" />
          <circle cx="65" cy="24" r="4.5" fill="#F59E0B" fillOpacity="0.85" />
          <circle cx="65" cy="14" r="3" fill="#F59E0B" fillOpacity="0.9" />
        </g>

        {/* Moroccan Palm Trees (Left and Right cluster) */}
        {/* Palm tree right foreground */}
        <g transform="translate(940, 160)" fill="url(#palmsGrad)">
          {/* Trunk */}
          <path d="M40 300 Q45 200 35 90 Q37 88 41 90 Q49 200 46 300 Z" fill="#6C1D2E" fillOpacity="0.6" />
          {/* Fronds */}
          <path d="M38 90 Q10 70 -30 95 Q0 60 38 90 Z" />
          <path d="M38 90 Q-10 40 -50 45 Q-10 30 38 90 Z" />
          <path d="M38 90 Q15 20 0 -10 Q25 20 38 90 Z" />
          <path d="M38 90 Q40 -10 65 -30 Q55 20 38 90 Z" />
          <path d="M38 90 Q70 10 110 15 Q75 40 38 90 Z" />
          <path d="M38 90 Q85 50 125 70 Q75 75 38 90 Z" />
          <path d="M38 90 Q65 90 95 125 Q55 105 38 90 Z" />
        </g>

        {/* Second smaller palm tree right */}
        <g transform="translate(1030, 210)" fill="url(#palmsGrad)">
          <path d="M25 250 Q28 170 20 70 Q22 68 25 70 Q31 170 29 250 Z" fill="#6C1D2E" fillOpacity="0.55" />
          <path d="M22 70 Q-10 45 -40 60 Q-10 35 22 70 Z" />
          <path d="M22 70 Q0 20 -25 -5 Q10 15 22 70 Z" />
          <path d="M22 70 Q25 -10 45 -20 Q35 15 22 70 Z" />
          <path d="M22 70 Q55 20 80 40 Q50 45 22 70 Z" />
          <path d="M22 70 Q50 65 70 95 Q40 80 22 70 Z" />
        </g>

        {/* Palm tree far left */}
        <g transform="translate(40, 220)" fill="url(#palmsGrad)">
          <path d="M30 250 Q25 160 35 70 Q37 68 40 70 Q32 160 35 250 Z" fill="#6C1D2E" fillOpacity="0.45" />
          <path d="M36 70 Q10 40 -20 50 Q10 30 36 70 Z" />
          <path d="M36 70 Q30 10 50 -10 Q45 20 36 70 Z" />
          <path d="M36 70 Q60 20 90 35 Q60 50 36 70 Z" />
          <path d="M36 70 Q55 70 75 100 Q45 85 36 70 Z" />
        </g>

        {/* Soft Moroccan arches / gate border effect at the very bottom */}
        <path
          d="M0 460 Q150 440 300 460 Q600 440 900 460 Q1050 445 1200 460 L1200 500 L0 500 Z"
          fill="#F8F9FA"
        />
      </svg>
    </div>
  );
};
