import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { getDistanceKm } from '../../utils/geoUtils';

const NavigationHUD = ({
  isNavigating,
  activeManeuvers,
  activeStepIndex,
  simActiveStreet,
  userLocation,
  turnAlert,
  userSpeed,
  simDuration,
  simDistance,
  handleStopNavigation,
  language,
  t
}) => {
  if (!isNavigating) return null;

  return (
    <>
      {/* Top Green Turn Steps HUD Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-emerald-500/30">
          {/* Dynamic Turn Arrow Icon */}
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
            {(() => {
              const step = activeManeuvers?.[activeStepIndex];
              const modifier = step?.maneuver?.modifier || '';
              // Helper inline render SVG turn arrows
              const mod = modifier ? modifier.toLowerCase() : '';
              if (mod.includes('left')) {
                return (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                );
              }
              if (mod.includes('right')) {
                return (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                  </svg>
                );
              }
              if (mod.includes('uturn')) {
                return (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.2 8H17" />
                  </svg>
                );
              }
              return (
                <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              );
            })()}
          </div>

          {/* Turn Instruction Text & Current Street name */}
          <div className="flex-grow">
            <h4 className="text-xs sm:text-sm font-black tracking-tight leading-tight">
              {(() => {
                const step = activeManeuvers?.[activeStepIndex];
                if (step) {
                  const modifier = step.maneuver?.modifier || '';
                  const name = step.name || (language === 'vi' ? 'đường mới' : 'new street');
                  const dir = language === 'vi'
                    ? (modifier.includes('left') ? 'rẽ trái' : modifier.includes('right') ? 'rẽ phải' : modifier.includes('uturn') ? 'quay đầu' : 'đi thẳng')
                    : (modifier.includes('left') ? 'turn left' : modifier.includes('right') ? 'turn right' : modifier.includes('uturn') ? 'make a U-turn' : 'go straight');
                  return language === 'vi' ? `Chuẩn bị ${dir} vào ${name}` : `Prepare to ${dir} onto ${name}`;
                }
                return language === 'vi' ? 'Đi thẳng theo chỉ dẫn trên bản đồ' : 'Drive straight following map guidelines';
              })()}
            </h4>

            {/* Current Street Tag */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] bg-white/20 text-white font-extrabold uppercase px-1.5 py-0.5 rounded leading-none">Street</span>
              <span className="text-[11px] font-bold text-emerald-100">{simActiveStreet || (language === 'vi' ? 'Đang xác định...' : 'Determining...')}</span>
            </div>
          </div>

          {/* Distance to turn count */}
          <div className="text-right flex-shrink-0 pl-2 border-l border-white/10">
            <span className="text-[9px] text-emerald-200 block font-extrabold uppercase tracking-wider">Trong</span>
            <span className="text-sm font-black font-outfit text-white leading-none">
              {(() => {
                const step = activeManeuvers?.[activeStepIndex];
                if (step && step.location && Array.isArray(step.location) && step.location.length >= 2 && userLocation) {
                  const dist = getDistanceKm(userLocation.lat, userLocation.lng, step.location[1], step.location[0]) * 1000;
                  return dist > 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`;
                }
                return 'GPS';
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Proximity Warning Turn Alert Popups */}
      {turnAlert && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[42] w-[calc(100%-3rem)] max-w-md animate-bounce-slow">
          <div className="bg-amber-500/95 backdrop-blur-md text-white border border-amber-400 px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-amber-500/25">
            <div className="bg-white/25 p-2 rounded-xl text-white animate-pulse">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h5 className="font-outfit text-[10px] font-black uppercase tracking-wider text-amber-100 leading-none">
                {language === 'vi' ? 'CẢNH BÁO RẼ CHUẨN BỊ' : 'MANEUVER ALERT'}
              </h5>
              <p className="text-xs font-extrabold mt-1.5 leading-relaxed">{turnAlert}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Digital Speedometer - Click to recenter map to current location */}
      <div className="absolute left-4 bottom-28 md:bottom-4 z-[40] select-none">
        {/* Speedometer card button */}
        <button
          onClick={() => {
            const centerEvent = new CustomEvent('recenter-map');
            window.dispatchEvent(centerEvent);
          }}
          className="bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex flex-col items-center text-center cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 hover:border-cyan-500/30 text-white"
          title={language === 'vi' ? 'Định vị lại vị trí hiện tại' : 'Recenter Map'}
        >
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
            {language === 'vi' ? 'TỐC ĐỘ' : 'SPEED'}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-black font-outfit text-white tracking-tighter leading-none animate-pulse">{userSpeed}</span>
            <span className="text-[10.5px] font-bold text-slate-400 font-outfit leading-none">km/h</span>
          </div>
        </button>
      </div>

      {/* Bottom Charcoal Navigation Pull-Up HUD Sheet */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-xl animate-slide-in-up">
        <div className="bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-between gap-3 sm:gap-6 shadow-slate-950/60">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className="text-2xl sm:text-3xl font-black font-outfit text-emerald-500 leading-none">{simDuration}</span>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase leading-none">{language === 'vi' ? 'phút' : 'min'}</span>
              </div>
              <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">
                {language === 'vi'
                  ? `Đến: ${(() => {
                    const date = new Date();
                    date.setMinutes(date.getMinutes() + simDuration);
                    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                  })()}`
                  : `Arr: ${(() => {
                    const date = new Date();
                    date.setMinutes(date.getMinutes() + simDuration);
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                  })()}`}
              </span>
            </div>

            <div className="w-[1px] h-8 sm:h-10 bg-slate-800" />

            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-extrabold text-slate-200 font-outfit leading-none">{simDistance} km</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">
                {language === 'vi' ? 'THỐT' : 'STOP'}
              </span>
            </div>
          </div>

          <button
            onClick={handleStopNavigation}
            className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] sm:text-xs tracking-wider rounded-xl sm:rounded-2xl shadow-lg shadow-red-650/20 border-none cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 animate-pulse"
          >
            <X className="w-3.5 h-3.5" />
            {language === 'vi' ? 'THOÁT' : 'STOP'}
          </button>
        </div>
      </div>
    </>
  );
};

export default NavigationHUD;
