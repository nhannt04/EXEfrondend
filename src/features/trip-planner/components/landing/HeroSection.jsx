import React from 'react';
import { Sparkles } from 'lucide-react';

export default function HeroSection({ language, handleQuickStart }) {
  return (
    <section className="relative w-full overflow-hidden border-b border-dark-border min-h-[480px] sm:min-h-[550px] lg:min-h-[620px] flex items-center pt-12 sm:pt-14 lg:pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.pinimg.com/736x/af/89/d1/af89d1688621a527e576ebad376340fe.jpg"
          alt="Vietnam landscape"
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/55 via-slate-900/35 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[95%] mx-auto px-4 sm:px-8 lg:px-12 w-full">
        <div className="flex flex-col items-start gap-6 text-left animate-fade-in-up max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-heritage-amber/40 text-white border border-heritage-amber/80 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider animate-float shadow-lg shadow-heritage-amber/50 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" />
            {language === 'vi' ? 'Khám phá Việt Nam' : 'Discover Vietnam'}
          </div>

          <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white max-w-2xl">
            {language === 'vi' ? 'Khám phá Việt Nam theo cách Local thực thụ' : 'Discover Vietnam the True Local Way'}
          </h1>

          <p className="text-blue-50 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
            {language === 'vi'
              ? 'Nhập ngân sách, thời gian và gu của bạn. Trí tuệ nhân tạo sẽ lập tức thiết lập lịch trình ăn chơi, ngủ nghỉ tối ưu và tiết kiệm nhất trên khắp Việt Nam.'
              : 'Enter your budget, time and style. Artificial intelligence will instantly create the optimal and most economical eating, entertainment, and rest schedule throughout Vietnam.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
            <button
              onClick={handleQuickStart}
              className="px-6 py-3.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-heritage-amber/40 transition-all duration-300 cursor-pointer border-none hover:scale-105 active:scale-95"
            >
              {language === 'vi' ? 'Bắt đầu ngay' : 'Start Now'}
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight * 0.35, behavior: 'smooth' })}
              className="px-6 py-3.5 bg-white/10 border border-white/30 text-white hover:bg-white/20 font-extrabold text-sm rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-105 active:scale-95"
            >
              {language === 'vi' ? 'Xem điểm đến nổi bật' : 'View Highlighted Destinations'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
