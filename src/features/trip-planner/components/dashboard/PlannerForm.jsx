import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

const PlannerForm = ({
  days,
  setDays,
  budget,
  setBudget,
  style,
  setStyle,
  adults,
  setAdults,
  children,
  setChildren,
  interests,
  setInterests,
  handleGenerate,
  loading,
  language,
  t
}) => {
  return (
    <div className="lg:col-span-4 bg-white border border-gray-200 p-6 rounded-2xl flex flex-col gap-5 shadow-sm shimmer-trigger">
      <h3 className="font-outfit text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 relative z-10">
        <Calendar className="w-5 h-5 text-heritage-amber" />
        {t('tripParams')}
      </h3>

      {/* Destination */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('destination')}</label>
        <input
          type="text"
          value={language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam'}
          disabled
          className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold"
        />
      </div>

      {/* Days & Style */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('daysCount')}</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value={1}>{language === 'vi' ? '1 Ngày' : '1 Day'}</option>
            <option value={2}>{language === 'vi' ? '2 Ngày' : '2 Days'}</option>
            <option value={3}>{language === 'vi' ? '3 Ngày' : '3 Days'}</option>
            <option value={4}>{language === 'vi' ? '4 Ngày' : '4 Days'}</option>
            <option value={5}>{language === 'vi' ? '5 Ngày' : '5 Days'}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('travelStyle')}</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value="Chill & Thư giãn">{language === 'vi' ? 'Chill & Thư giãn' : 'Chill & Relax'}</option>
            <option value="Sống ảo">{language === 'vi' ? 'Sống ảo' : 'Instagrammable / Aesthetic'}</option>
            <option value="Trải nghiệm">{language === 'vi' ? 'Trải nghiệm local' : 'Experience'}</option>
          </select>
        </div>
      </div>

      {/* Budget Setting */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex justify-between items-center text-xs">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('budgetLabel')}</label>
          <span className="text-heritage-amber font-extrabold text-sm">{(budget / 1000000).toFixed(1)} {language === 'vi' ? 'triệu VND' : 'M VND'}</span>
        </div>
        <input
          type="range"
          min={1000000}
          max={25000000}
          step={500000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-amber"
        />
      </div>

      {/* Group size */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('adults')}</label>
          <input
            type="number"
            min={1}
            max={10}
            value={adults}
            onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber text-center font-bold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('children')}</label>
          <input
            type="number"
            min={0}
            max={10}
            value={children}
            onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber text-center font-bold"
          />
        </div>
      </div>

      {/* Interests Custom Text Input */}
      <div className="flex flex-col gap-2 relative z-10 border-t border-gray-150 pt-4">
        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('interests')}</label>
        <textarea
          rows={4}
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder={language === 'vi'
            ? 'Hãy viết sở thích cá nhân của bạn (Ví dụ: Muốn ăn cao lầu Bà Bé, uống cà phê sữa đá ven sông, đi dạo ngắm đèn lồng Phố Cổ và ngắm hoàng hôn biển An Bàng...)'
            : 'Write your personalized travel preferences...'}
          className="w-full bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-heritage-amber resize-none font-semibold leading-relaxed hover:border-gray-300 focus:ring-2 focus:ring-heritage-amber/10 transition-all duration-300"
        />
      </div>

      {/* CTA Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mt-4 py-3 bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-heritage-amber/15 cursor-pointer border-none z-10"
      >
        <Sparkles className="w-4 h-4 animate-spin-slow" />
        {loading ? t('generating') : t('generateButton')}
      </button>
    </div>
  );
};

export default PlannerForm;
