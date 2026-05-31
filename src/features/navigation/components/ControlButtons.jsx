import React from 'react';
import { Compass, Plus, Minus, Volume2, VolumeX, Play, Pause, Sun, Moon, Layers } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function ControlButtons({
  setZoom,
  isMuted,
  setIsMuted,
  isDarkMode,
  setIsDarkMode,
  isSimulating,
  setIsSimulating,
  currentSegmentIndex,
  mapMode,
  setMapMode,
  isHeadingUp,
  setIsHeadingUp
}) {
  const { language } = useLanguage();

  let compassRotation = 0;
  if (isHeadingUp) {
    if (currentSegmentIndex === 1) compassRotation = 90;
    if (currentSegmentIndex === 2) compassRotation = 0;
    if (currentSegmentIndex === 3) compassRotation = 90;
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));

  const buttonStyle = isDarkMode
    ? 'w-12 h-12 rounded-2xl shadow-xl bg-slate-900/85 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300'
    : 'w-12 h-12 rounded-2xl shadow-xl bg-white/85 backdrop-blur-xl border border-slate-200/50 text-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300';

  return (
    <div className="absolute right-4 md:right-6 top-1/4 flex flex-col gap-3 z-10 animate-slide-in-right">
      
      {/* 1. Compass (Heading-up toggle) */}
      <button
        onClick={() => setIsHeadingUp(prev => !prev)}
        style={{ transform: `rotate(${compassRotation}deg)` }}
        className={`${buttonStyle} relative group ${isHeadingUp ? 'border-cyan-500/40 text-cyan-400' : ''}`}
        title={isHeadingUp ? (language === 'vi' ? 'Tắt Heading-up view' : 'Disable Heading-up view') : (language === 'vi' ? 'Bật Heading-up view' : 'Enable Heading-up view')}
      >
        <Compass className="w-6 h-6 text-cyan-500 transition-colors group-hover:text-cyan-400" />
        <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* 2. Map Mode Selector (Toggle Google Maps / 3D CarPlay) */}
      <button
        onClick={() => setMapMode(prev => prev === 'google' ? '3d' : 'google')}
        className={`${buttonStyle} ${mapMode === '3d' ? 'border-cyan-500/40 text-cyan-400' : ''}`}
        title={mapMode === 'google' 
          ? (language === 'vi' ? 'Xem Mô phỏng 3D CarPlay' : 'Switch to 3D CarPlay Map') 
          : (language === 'vi' ? 'Xem Google Maps thực tế' : 'Switch to Google Maps')}
      >
        <Layers className="w-5 h-5 animate-pulse" />
      </button>

      <div className={`h-px w-8 mx-auto ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

      {/* 3. Play / Pause Simulation (Chạy Mô Phỏng Lộ Trình) */}
      <button
        onClick={() => setIsSimulating(!isSimulating)}
        className={`${buttonStyle} ${isSimulating ? 'border-emerald-500/40 text-emerald-500' : ''}`}
        title={isSimulating ? (language === 'vi' ? 'Tạm dừng mô phỏng' : 'Pause Simulation') : (language === 'vi' ? 'Bắt đầu mô phỏng' : 'Start Simulation')}
      >
        {isSimulating ? (
          <Pause className="w-5 h-5 fill-emerald-500 text-emerald-500 animate-pulse" />
        ) : (
          <Play className="w-5 h-5 fill-slate-400 text-slate-400" />
        )}
      </button>

      <div className={`h-px w-8 mx-auto ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

      {/* 4. Zoom In (+ / Phóng to) */}
      <button
        onClick={handleZoomIn}
        className={buttonStyle}
        title={language === 'vi' ? 'Phóng to' : 'Zoom In'}
      >
        <Plus className="w-5 h-5 font-bold" />
      </button>

      {/* 5. Zoom Out (- / Thu nhỏ) */}
      <button
        onClick={handleZoomOut}
        className={buttonStyle}
        title={language === 'vi' ? 'Thu nhỏ' : 'Zoom Out'}
      >
        <Minus className="w-5 h-5 font-bold" />
      </button>

      <div className={`h-px w-8 mx-auto ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

      {/* 6. Speaker (Bật/tắt giọng nói dẫn đường) */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={`${buttonStyle} ${isMuted ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : ''}`}
        title={isMuted ? (language === 'vi' ? 'Bật âm thanh' : 'Unmute voice') : (language === 'vi' ? 'Tắt âm thanh' : 'Mute voice')}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 animate-pulse" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* 7. Day/Night Theme Toggler */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={buttonStyle}
        title={isDarkMode ? (language === 'vi' ? 'Chế độ sáng' : 'Day Mode') : (language === 'vi' ? 'Chế độ tối' : 'Night Mode')}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-500" />
        )}
      </button>

    </div>
  );
}
