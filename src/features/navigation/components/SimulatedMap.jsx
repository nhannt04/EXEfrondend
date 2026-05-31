import React, { useMemo, useRef, useState } from 'react';

export default function SimulatedMap({
  zoom,
  isDarkMode,
  vehiclePos,
  currentSegmentIndex,
  mapMode = 'google', // 'google' | '3d' - Default to 'google' as requested!
  isHeadingUp = true
}) {
  const { x, y } = vehiclePos;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0, pointerId: null });

  // Compute map rotation to align the travel direction UP
  let rotation = 0;
  if (isHeadingUp) {
    if (currentSegmentIndex === 0) rotation = 0;
    if (currentSegmentIndex === 1) rotation = -90;
    if (currentSegmentIndex === 2) rotation = 0;
    if (currentSegmentIndex === 3) rotation = -90;
  }

  // Smooth transitioning of the 3D map container
  const mapStyle = {
    transform: `perspective(1000px) rotateX(48deg) rotateZ(${rotation}deg) scale(${zoom})`,
    transformOrigin: `${x}px ${y}px`,
    transition: 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
    width: '100%',
    height: '100%',
    willChange: 'transform'
  };

  const panStyle = useMemo(() => ({
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
    transition: dragRef.current.active ? 'none' : 'transform 180ms ease-out',
    willChange: 'transform'
  }), [pan.x, pan.y]);

  const handlePointerDown = (event) => {
    if (mapMode !== '3d') return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
      pointerId: event.pointerId
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setPan({
      x: dragRef.current.panX + dx,
      y: dragRef.current.panY + dy
    });
  };

  const handlePointerUp = (event) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (dragRef.current.pointerId != null) {
      event.currentTarget.releasePointerCapture?.(dragRef.current.pointerId);
    }
    dragRef.current.pointerId = null;
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
    <div className={`w-full h-full relative overflow-hidden ${bgColor} transition-colors duration-500`}>
      {/* 3D Map Viewport */}
      <div
        style={mapMode === '3d' ? panStyle : undefined}
        className={`relative w-full h-full shadow-inner ${mapMode === '3d' ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div style={mapStyle}>
        <svg
          viewBox="0 0 1400 1400"
          preserveAspectRatio="xMidYMid slice"
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
          <rect width="1400" height="1400" fill="url(#grid)" />

          {/* Sông Cu Đê / River */}
          <path 
            d="M -100,1100 C 200,1050 300,1200 700,1140 C 1000,1090 1150,1240 1500,1180 L 1500,1500 L -100,1500 Z"
            className={`${riverColor} transition-colors duration-500`}
          />
          
          <path 
            d="M -100,320 C 150,290 220,140 520,170 C 760,195 820,90 1500,120 L 1500,-100 L -100,-100 Z"
            className={`${riverColor} transition-colors duration-500`}
          />

          {/* Green Parks */}
          <rect x="150" y="480" width="140" height="90" rx="16" className={`${parkColor} transition-colors duration-500`} />
          <circle cx="900" cy="360" r="100" className={`${parkColor} transition-colors duration-500`} />
          <path d="M 500,760 C 560,700 670,730 730,780 C 790,835 680,940 580,905 C 470,870 420,820 500,760 Z" className={`${parkColor} transition-colors duration-500`} />

          {/* BACKGROUND ROAD NETWORK */}
          <line x1="0" y1="1180" x2="1400" y2="1180" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="0" y1="1180" x2="1400" y2="1180" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          <line x1="-100" y1="650" x2="1400" y2="650" strokeWidth="18" className={`${roadBorderColor} transition-colors duration-500`} />
          <line x1="-100" y1="650" x2="1400" y2="650" strokeWidth="14" className={`${roadBgColor} transition-colors duration-500`} />

          <line x1="360" y1="0" x2="360" y2="1400" strokeWidth="18" className={`${roadBorderColor} transition-colors duration-500`} />
          <line x1="360" y1="0" x2="360" y2="1400" strokeWidth="14" className={`${roadBgColor} transition-colors duration-500`} />

          <line x1="-100" y1="860" x2="1400" y2="860" strokeWidth="16" className={`${roadBorderColor} transition-colors duration-500`} />
          <line x1="-100" y1="860" x2="1400" y2="860" strokeWidth="12" className={`${roadBgColor} transition-colors duration-500`} />

          {/* 3D Isometric Buildings */}
          <g transform="translate(220, 650)" className="opacity-75 transition-opacity hover:opacity-100 duration-300">
            <rect x="0" y="0" width="40" height="50" rx="4" fill={isDarkMode ? '#1e293b' : '#cbd5e1'} />
            <polygon points="0,0 20,-15 40,0" fill={isDarkMode ? '#334155' : '#e2e8f0'} />
            <polygon points="40,0 20,-15 40,-15 40,0" fill={isDarkMode ? '#0f172a' : '#94a3b8'} className="opacity-50" />
          </g>

          <g transform="translate(520, 300)">
            <rect x="0" y="0" width="80" height="60" rx="6" fill={isDarkMode ? '#0f172a' : '#cbd5e1'} stroke={isDarkMode ? '#334155' : '#94a3b8'} strokeWidth="2" />
            <rect x="10" y="10" width="60" height="40" rx="3" fill={isDarkMode ? '#1e293b' : '#f1f5f9'} />
            <text x="40" y="35" fontSize="10" fontWeight="bold" textAnchor="middle" fill={isDarkMode ? '#64748b' : '#475569'}>DUT</text>
          </g>

          {/* MAIN NAVIGATION STREET LAYOUT */}
          {/* Segment 0: Tôn Đức Thắng (120, 780) -> (120, 600) */}
          <line x1="120" y1="820" x2="120" y2="600" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="120" y1="820" x2="120" y2="600" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* Segment 1: Ngô Sĩ Liên (120, 600) -> (360, 600) */}
          <line x1="100" y1="600" x2="380" y2="600" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="100" y1="600" x2="380" y2="600" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* Segment 2: Nguyễn Lương Bằng (360, 600) -> (360, 420) */}
          <line x1="360" y1="620" x2="360" y2="420" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="360" y1="620" x2="360" y2="420" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* Segment 3: Phạm Như Xương (360, 420) -> (620, 420) */}
          <line x1="340" y1="420" x2="650" y2="420" strokeWidth="24" className={`${roadBorderColor} transition-colors duration-500`} strokeLinecap="round" />
          <line x1="340" y1="420" x2="650" y2="420" strokeWidth="20" className={`${roadBgColor} transition-colors duration-500`} strokeLinecap="round" />

          {/* ROUTE GUIDANCE NEON LINE */}
          <path
            d="M 120,820 L 120,600 L 360,600 L 360,420 L 620,420"
            fill="none"
            stroke={isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(34, 197, 94, 0.15)'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 120,820 L 120,600 L 360,600 L 360,420 L 620,420"
            fill="none"
            stroke={isDarkMode ? '#06b6d4' : '#0284c7'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
          
          <path
            d="M 120,820 L 120,600 L 360,600 L 360,420 L 620,420"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lane dividers */}
          <g stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="8 12" fill="none">
            <line x1="120" y1="820" x2="120" y2="600" />
            <line x1="100" y1="600" x2="380" y2="600" />
            <line x1="360" y1="620" x2="360" y2="420" />
            <line x1="340" y1="420" x2="650" y2="420" />
          </g>

          {/* Local Landmarks */}
          <g transform="translate(120, 840)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill={landmarkBgColor} stroke={landmarkStrokeColor} strokeWidth="1.5" />
            <text x="0" y="4" fontSize="8" fontWeight="bold" textAnchor="middle" fill={isDarkMode ? '#f8fafc' : '#1e293b'}>Cầu vượt Ngã 3 Huế</text>
          </g>

          <g transform="translate(130, 540)">
            <rect x="-32" y="-10" width="64" height="20" rx="10" fill={landmarkBgColor} stroke={landmarkStrokeColor} strokeWidth="1.5" />
            <text x="0" y="3" fontSize="8" fontWeight="medium" textAnchor="middle" className={landmarkTextColor}>Chợ Hòa Khánh</text>
          </g>

          <g transform="translate(500, 390)">
            <rect x="-42" y="-12" width="84" height="24" rx="12" fill={landmarkBgColor} stroke={landmarkStrokeColor} strokeWidth="1.5" />
            <text x="0" y="3" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#d97706">ĐH Bách Khoa ĐN</text>
          </g>

          {/* Destination Pin */}
          <g transform="translate(620, 420)">
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
            if (isHeadingUp) {
              if (currentSegmentIndex === 1) vehicleAngle = 0;
              if (currentSegmentIndex === 2) vehicleAngle = -90;
              if (currentSegmentIndex === 3) vehicleAngle = 0;
            }

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
    </div>
  );
}
