import React from 'react';
import { LogOut, Timer, Milestone, Clock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function InfoBottomBar({ 
  progress, 
  onExit, 
  isDarkMode 
}) {
  const { language } = useLanguage();

  const currentMinutes = Math.max(0, Math.round(19 * (1 - progress)));
  const currentDistance = Math.max(0, (14 * (1 - progress)).toFixed(1));

  const getArrivalTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + currentMinutes);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const glassStyle = isDarkMode
    ? 'bg-slate-900/85 backdrop-blur-xl border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
    : 'bg-white/85 backdrop-blur-xl border border-slate-200/50 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)]';

  return (
    <div className="absolute bottom-5 left-4 right-4 md:left-6 md:right-6 max-w-2xl mx-auto z-10 animate-fade-in-up">
      <div className={`rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4.5 ${glassStyle} transition-colors duration-500`}>
        
        {/* Left Side: Stats */}
        <div className="flex items-center justify-around sm:justify-start gap-5 w-full sm:w-auto">
          {/* Time Remaining */}
          <div className="text-left flex items-start gap-2.5">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-500 mt-0.5">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className={`block text-2xl font-black font-outfit tracking-tight leading-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {currentMinutes} {language === 'vi' ? 'phút' : 'mins'}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'vi' ? 'Thời gian di chuyển' : 'Travel Time'}
              </span>
            </div>
          </div>

          <div className={`h-8 w-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Distance Remaining */}
          <div className="text-left flex items-start gap-2.5">
            <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 text-cyan-500 mt-0.5">
              <Milestone className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-black font-outfit tracking-tight leading-none">
                {currentDistance} km
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'vi' ? 'Khoảng cách' : 'Distance'}
              </span>
            </div>
          </div>

          <div className="hidden xs:block h-8 w-px lg:block bg-slate-200 dark:bg-white/10" />

          {/* ETA */}
          <div className="hidden xs:flex text-left items-start gap-2.5">
            <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 text-purple-500 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-black font-outfit tracking-tight leading-none stat-number">
                {getArrivalTime()}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'vi' ? 'Đến nơi lúc' : 'Arrival Time'}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Divider: Progress */}
        <div className="flex-grow w-full sm:max-w-[120px] lg:max-w-[160px] flex flex-col gap-1 sm:px-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>START</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden relative ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div 
              style={{ width: `${progress * 100}%` }}
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,180,212,0.5)]"
            />
          </div>
        </div>

        {/* Right Side: Exit Button */}
        <button
          onClick={onExit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-sm rounded-2xl cursor-pointer border-none shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.5)] transition-all duration-300 transform active:scale-95 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{language === 'vi' ? 'Thoát' : 'Exit'}</span>
        </button>

      </div>
    </div>
  );
}
