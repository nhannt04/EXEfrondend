import React from 'react';
import { ArrowUp, ArrowUpRight, ArrowUpLeft, Compass } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function InstructionBanner({ 
  currentSegmentIndex, 
  segmentProgress,
  isDarkMode 
}) {
  const { language } = useLanguage();

  let directionIcon = <ArrowUp className="w-8 h-8 text-cyan-400 animate-pulse" />;
  let nextManeuver = '';
  let streetName = '';
  let subText = '';

  if (language === 'vi') {
    switch (currentSegmentIndex) {
      case 0:
        directionIcon = <ArrowUp className="w-8 h-8 text-emerald-400" />;
        streetName = 'Đường Tôn Đức Thắng';
        nextManeuver = 'Đi thẳng 150m nữa';
        subText = 'Chuẩn bị rẽ phải vào Ngô Sĩ Liên';
        break;
      case 1:
        directionIcon = <ArrowUpRight className="w-8 h-8 text-amber-400 rotate-45" />;
        streetName = 'Đường Ngô Sĩ Liên';
        nextManeuver = 'Rẽ phải sau 200m nữa';
        subText = 'Chuẩn bị rẽ trái vào Nguyễn Lương Bằng';
        break;
      case 2:
        directionIcon = <ArrowUpLeft className="w-8 h-8 text-cyan-400 -rotate-45" />;
        streetName = 'Đường Nguyễn Lương Bằng';
        nextManeuver = 'Rẽ trái sau 150m nữa';
        subText = 'Chuẩn bị rẽ phải vào Phạm Như Xương';
        break;
      case 3:
        directionIcon = <ArrowUpRight className="w-8 h-8 text-rose-400 rotate-45 animate-pulse" />;
        streetName = 'Đường Phạm Như Xương';
        nextManeuver = 'Rẽ phải vào Phạm Như Xương';
        subText = 'Sắp đến điểm hẹn của bạn!';
        break;
      default:
        directionIcon = <ArrowUp className="w-8 h-8 text-emerald-400" />;
        streetName = 'Đường Phạm Như Xương';
        nextManeuver = 'Tiếp tục lộ trình';
        subText = 'Dẫn đường tự động';
    }
  } else {
    switch (currentSegmentIndex) {
      case 0:
        directionIcon = <ArrowUp className="w-8 h-8 text-emerald-400" />;
        streetName = 'Ton Duc Thang St';
        nextManeuver = 'Go straight for 150m';
        subText = 'Prepare to turn right onto Ngo Si Lien';
        break;
      case 1:
        directionIcon = <ArrowUpRight className="w-8 h-8 text-amber-400 rotate-45" />;
        streetName = 'Ngo Si Lien St';
        nextManeuver = 'Turn right in 200m';
        subText = 'Prepare to turn left onto Nguyen Luong Bang';
        break;
      case 2:
        directionIcon = <ArrowUpLeft className="w-8 h-8 text-cyan-400 -rotate-45" />;
        streetName = 'Nguyen Luong Bang St';
        nextManeuver = 'Turn left in 150m';
        subText = 'Prepare to turn right onto Pham Nhu Xuong';
        break;
      case 3:
        directionIcon = <ArrowUpRight className="w-8 h-8 text-rose-400 rotate-45 animate-pulse" />;
        streetName = 'Pham Nhu Xuong St';
        nextManeuver = 'Turn right onto Pham Nhu Xuong';
        subText = 'Approaching your destination soon!';
        break;
      default:
        directionIcon = <ArrowUp className="w-8 h-8 text-emerald-400" />;
        streetName = 'Pham Nhu Xuong St';
        nextManeuver = 'Continue on active route';
        subText = 'Smart Navigation';
    }
  }

  // Calculate distance countdown for the current segment
  const distanceLeftForSegment = Math.round(150 * (1 - segmentProgress));

  return (
    <div className="absolute top-5 left-4 right-4 md:left-6 md:right-6 max-w-xl mx-auto z-10 animate-fade-in">
      <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-cyan-500/30">
        <div className="flex items-center gap-4.5">
          {/* Direction Icon Container */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform duration-300">
            {directionIcon}
            <span className="absolute inset-0 rounded-2xl border border-cyan-400/20 animate-pulse-ring opacity-40 pointer-events-none" />
          </div>

          {/* Navigation text details */}
          <div className="flex-grow text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                {distanceLeftForSegment > 0 ? `${distanceLeftForSegment}m` : '0m'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="text-[10px] text-slate-400 font-medium">
                {nextManeuver}
              </span>
            </div>
            
            <h2 className="text-lg md:text-xl font-bold font-outfit tracking-tight text-white mt-0.5 leading-snug">
              {streetName}
            </h2>
            
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              {subText}
            </p>
          </div>

          {/* Mini Compass in corner */}
          <div className="hidden sm:block opacity-35 hover:opacity-85 transition-opacity duration-300">
            <Compass className="w-5 h-5 text-slate-400 animate-spin-slow" />
          </div>
        </div>
      </div>
    </div>
  );
}
