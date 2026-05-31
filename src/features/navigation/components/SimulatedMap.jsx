import React from 'react';

export default function SimulatedMap({
  progress,
  zoom,
  isDarkMode,
  vehiclePos,
  currentSegmentIndex,
  mapMode = 'google' // 'google' | '3d' - Default to 'google' as requested!
}) {
  const { x, y } = vehiclePos;

  // Compute map rotation to align the travel direction UP
  let rotation = 0;
  if (currentSegmentIndex === 1) rotation = -90;
  if (currentSegmentIndex === 2) rotation = 0;
  if (currentSegmentIndex === 3) rotation = -90;

  // Smooth transitioning of the 3D map container
  const mapStyle = {
    transform: `perspective(1000px) rotateX(48deg) rotateZ(${rotation}deg) scale(${zoom})`,
    transformOrigin: `${x}px ${y}px`,
    transition: 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
    width: '1000px',
    height: '1000px',
  };

  // Theme-based colors
  const bgColor = isDarkMode ? 'bg-slate-950' : 'bg-[#eef2f5]';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  const parkColor = isDarkMode ? 'fill-emerald-950/40' : 'fill-emerald-100/70';
  const riverColor = isDarkMode ? 'fill-blue-950/40' : 'fill-sky-100';
  const roadBgColor = isDarkMode ? 'stroke-slate-800' : 'stroke-white';
  const roadBorderColor = isDarkMode ? 'stroke-slate-900' : 'stroke-slate-200';
  const landmarkTextColor = isDarkMode ? 'fill-slate-400' : 'fill-slate-500';
  const landmarkBgColor = isDarkMode ? 'fill-slate-900/90' : 'fill-white/90';
  const landmarkStrokeColor = isDarkMode ? 'stroke-slate-700' : 'stroke-slate-200';

  // 1. Render Google Maps Embed Mode
  if (mapMode === 'google') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-slate-900 transition-colors duration-500">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d3833.840742137688!2d108.147814!3d16.073797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x314218d68d40e109%3A0x7d013f9fcfcf8bdc!2zQ-G6p3Ugdsaw4bujdCBOZ8OjIEJhIEh14bq_!3m2!1d16.0682!2d108.1578!4m5!1s0x314218d8a0c20a45%3A0xc3beee68c5bdfbb9!2zUGjhuqFtIE5oxrAgWMawxqFuZywgTGnDqm4gQ2hp4buDdQwgxJDDoCBO4bq5bmc!5m2!1svi!2svn"
          width="100%"
          height="100%"
          style={{ 
            border: 0, 
            filter: isDarkMode ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(100%)' : 'none',
            pointerEvents: 'auto'
          }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full absolute inset-0"
        />
        {/* Subtle dark gradient overlay to blend map edges with glassmorphism controls */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-transparent to-slate-950/30 pointer-events-none" />
      </div>
    );
  }

  // 2. Render CarPlay 3D Perspective Vector Map Mode
  return (
    <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${bgColor} transition-colors duration-500`}>
      {/* 3D Map Viewport */}
      <div 
        style={mapStyle}
        className="relative shadow-inner"
      >
        <svg 
          viewBox="0 0 1000 1000" 
          className="w-full h-full select-none"
        >
          {/* Grid Background Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="none" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridColor} strokeWidth="1" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="vehicle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Pattern */}
          <rect width="1000" height="1000" fill="url(#grid)" />

          {/* Sông Cu Đê / River */}
          <path 
            d="M -50,800 C 200,750 300,900 600,850 C 800,810 900,950 1050,900 L 1050,1050 L -50,1050 Z" 
            className={`${riverColor} transition-colors duration-500`} 
          />
          
          <path 
            d="M -50,200 C 150,180 200,80 450,100 C 650,120 700,50 1050,80 L 1050,-50 L -50,-50 Z" 
            className={`${riverColor} transition-colors duration-500`} 
          />

          {/* Green Parks */}
          <rect x="150" y="400" width="120" height="80" rx="16" className={`${parkColor} transition-colors duration-500`} />
          <circle cx="750" cy="300" r="90" className={`${parkColor} transition-colors duration-500`} />
          <path d="M 400,600 C 450,550 550,580 600,620 C 650,660 550,750 480,720 C 410,690 350,650 400,600 Z" className={`${parkColor} transition-colors duration-500`} />

          {/* BACKGROUND ROAD NETWORK */}
          <line x1="0" y1="950" x2="1000" y2="950" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="0" y1="950" x2="1000" y2="950" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          <line x1="-50" y1="500" x2="1000" y2="500" strokeWidth="18" className={`${roadBorderColor} transition-colors duration-500`} />
          <line x1="-50" y1="500" x2="1000" y2="500" strokeWidth="14" className={`${roadBgColor} transition-colors duration-500`} />
          
          <line x1="300" y1="0" x2="300" y2="1000" strokeWidth="18" className={`${roadBorderColor} transition-colors duration-500`} />
          <line x1="300" y1="0" x2="300" y2="1000" strokeWidth="14" className={`${roadBgColor} transition-colors duration-500`} />

          <line x1="-50" y1="700" x2="1000" y2="700" strokeWidth="16" className={`${roadBorderColor} transition-colors duration-500`} />
          <line x1="-50" y1="700" x2="1000" y2="700" strokeWidth="12" className={`${roadBgColor} transition-colors duration-500`} />

          {/* 3D Isometric Buildings */}
          <g transform="translate(180, 520)" className="opacity-75 transition-opacity hover:opacity-100 duration-300">
            <rect x="0" y="0" width="40" height="50" rx="4" fill={isDarkMode ? '#1e293b' : '#cbd5e1'} />
            <polygon points="0,0 20,-15 40,0" fill={isDarkMode ? '#334155' : '#e2e8f0'} />
            <polygon points="40,0 20,-15 40,-15 40,0" fill={isDarkMode ? '#0f172a' : '#94a3b8'} className="opacity-50" />
          </g>

          <g transform="translate(380, 240)">
            <rect x="0" y="0" width="80" height="60" rx="6" fill={isDarkMode ? '#0f172a' : '#cbd5e1'} stroke={isDarkMode ? '#334155' : '#94a3b8'} strokeWidth="2" />
            <rect x="10" y="10" width="60" height="40" rx="3" fill={isDarkMode ? '#1e293b' : '#f1f5f9'} />
            <text x="40" y="35" fontSize="10" fontWeight="bold" textAnchor="middle" fill={isDarkMode ? '#64748b' : '#475569'}>DUT</text>
          </g>

          {/* MAIN NAVIGATION STREET LAYOUT */}
          {/* Segment 0: Tôn Đức Thắng (100, 500) -> (100, 350) */}
          <line x1="100" y1="550" x2="100" y2="350" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="100" y1="550" x2="100" y2="350" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* Segment 1: Ngô Sĩ Liên (100, 350) -> (300, 350) */}
          <line x1="90" y1="350" x2="310" y2="350" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="90" y1="350" x2="310" y2="350" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* Segment 2: Nguyễn Lương Bằng (300, 350) -> (300, 200) */}
          <line x1="300" y1="360" x2="300" y2="190" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="300" y1="360" x2="300" y2="190" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* Segment 3: Phạm Như Xương (300, 200) -> (550, 200) */}
          <line x1="290" y1="200" x2="550" y2="200" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="290" y1="200" x2="550" y2="200" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* ROUTE GUIDANCE NEON LINE */}
          <path
            d="M 100,500 L 100,350 L 300,350 L 300,200 L 500,200"
            fill="none"
            stroke={isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(34, 197, 94, 0.15)'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 100,500 L 100,350 L 300,350 L 300,200 L 500,200"
            fill="none"
            stroke={isDarkMode ? '#06b6d4' : '#0284c7'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
          
          <path
            d="M 100,500 L 100,350 L 300,350 L 300,200 L 500,200"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lane dividers */}
          <g stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="8 12" fill="none">
            <line x1="100" y1="550" x2="100" y2="350" />
            <line x1="90" y1="350" x2="310" y2="350" />
            <line x1="300" y1="360" x2="300" y2="190" />
            <line x1="290" y1="200" x2="550" y2="200" />
          </g>

          {/* Local Landmarks */}
          <g transform="translate(100, 560)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill={landmarkBgColor} stroke={landmarkStrokeColor} strokeWidth="1.5" />
            <text x="0" y="4" fontSize="8" fontWeight="bold" textAnchor="middle" fill={isDarkMode ? '#f8fafc' : '#1e293b'}>Cầu vượt Ngã 3 Huế</text>
          </g>

          <g transform="translate(90, 290)">
            <rect x="-32" y="-10" width="64" height="20" rx="10" fill={landmarkBgColor} stroke={landmarkStrokeColor} strokeWidth="1.5" />
            <text x="0" y="3" fontSize="8" fontWeight="medium" textAnchor="middle" className={landmarkTextColor}>Chợ Hòa Khánh</text>
          </g>

          <g transform="translate(420, 310)">
            <rect x="-42" y="-12" width="84" height="24" rx="12" fill={landmarkBgColor} stroke={landmarkStrokeColor} strokeWidth="1.5" />
            <text x="0" y="3" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#d97706">ĐH Bách Khoa ĐN</text>
          </g>

          {/* Destination Pin */}
          <g transform="translate(500, 200)">
            <circle cx="0" cy="0" r="22" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: 'center', animationDuration: '2s' }} />
            <circle cx="0" cy="0" r="12" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-pulse" style={{ transformOrigin: 'center' }} />
            <path 
              d="M 0,0 C -8,-8 -12,-16 -12,-24 C -12,-32 -6,-38 0,-38 C 6,-38 12,-32 12,-24 C 12,-16 8,-8 0,0 Z" 
              fill="url(#pinGrad)" 
              filter="url(#glow)"
              className="drop-shadow-lg"
            />
            <circle cx="0" cy="-24" r="4" fill="white" />
            
            <g transform="translate(0, -50)">
              <rect x="-40" y="-10" width="80" height="20" rx="6" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
              <text x="0" y="3" fontSize="8" fontWeight="bold" textAnchor="middle" fill="white">Phạm Như Xương</text>
            </g>
          </g>

          <defs>
            <radialGradient id="pinGrad" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="80%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
            <radialGradient id="vehicleGrad" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="85%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
          </defs>

          {/* VEHICLE CHEVRON CURSOR */}
          {(() => {
            let vehicleAngle = -90;
            if (currentSegmentIndex === 1) vehicleAngle = 0;
            if (currentSegmentIndex === 2) vehicleAngle = -90;
            if (currentSegmentIndex === 3) vehicleAngle = 0;

            return (
              <g 
                transform={`translate(${x}, ${y}) rotate(${vehicleAngle})`}
                className="transition-all duration-300"
              >
                <circle cx="0" cy="0" r="18" fill="rgba(14, 165, 233, 0.15)" className="animate-pulse" style={{ transformOrigin: 'center' }} />
                <circle cx="0" cy="0" r="10" fill="none" stroke="white" strokeWidth="2.5" filter="url(#vehicle-glow)" />
                <path 
                  d="M 12,0 L -8,9 L -3,0 L -8,-9 Z" 
                  fill="url(#vehicleGrad)" 
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="drop-shadow-md"
                />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
