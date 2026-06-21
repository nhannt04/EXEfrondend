import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

/**
 * TripInputPanel
 * Left-column input form rendered inside the "studio" tab of TripPlannerStudio.
 *
 * Props:
 *  language        – current UI language ('vi' | 'en')
 *  t               – translation function
 *  days            – number of days (1–5)
 *  setDays         – setter
 *  budget          – budget in VND
 *  setBudget       – setter
 *  style           – travel style string
 *  setStyle        – setter
 *  adults          – adult count
 *  setAdults       – setter
 *  children        – children count
 *  setChildren     – setter
 *  interests       – interests textarea string
 *  setInterests    – setter
 *  loading         – boolean – whether generation is in progress
 *  handleGenerate  – callback to trigger itinerary generation
 */
export default function TripInputPanel({
  language,
  t,
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
  loading,
  handleGenerate,
}) {
  return (
    <div className="lg:col-span-4 bg-gradient-to-tr from-white to-amber-50/10 border border-heritage-gold/20 p-6 sm:p-7 rounded-3xl flex flex-col gap-6 shadow-xl relative overflow-hidden shimmer-trigger">
      {/* Absolute decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-amber/5 rounded-full blur-3xl pointer-events-none" />

      <h3 className="font-outfit text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 relative z-10">
        <Calendar className="w-5 h-5 text-heritage-amber" />
        {t('tripParams')}
      </h3>

      {/* Destination */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('destination')}</label>
        <input
          type="text"
          value={language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam'}
          disabled
          className="bg-gray-50/80 border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl text-sm font-bold shadow-inner"
        />
      </div>

      {/* Days & Style */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('daysCount')}</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
          >
            <option value={1}>{language === 'vi' ? '1 Ngày' : '1 Day'}</option>
            <option value={2}>{language === 'vi' ? '2 Ngày' : '2 Days'}</option>
            <option value={3}>{language === 'vi' ? '3 Ngày' : '3 Days'}</option>
            <option value={4}>{language === 'vi' ? '4 Ngày' : '4 Days'}</option>
            <option value={5}>{language === 'vi' ? '5 Ngày' : '5 Days'}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('travelStyle')}</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
          >
            <option value="Chill & Thư giãn">{language === 'vi' ? 'Chill & Thư giãn' : 'Chill & Relax'}</option>
            <option value="Sống ảo">{language === 'vi' ? 'Sống ảo' : 'Instagrammable / Aesthetic'}</option>
            <option value="Trải nghiệm">{language === 'vi' ? 'Trải nghiệm local' : 'Experience'}</option>
          </select>
        </div>
      </div>

      {/* Budget Setting */}
      <div className="flex flex-col gap-2.5 relative z-10">
        <div className="flex justify-between items-center text-xs">
          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('budgetLabel')}</label>
          <span className="text-heritage-amber font-black text-sm">{(budget / 1000000).toFixed(1)} {language === 'vi' ? 'triệu VND' : 'M VND'}</span>
        </div>
        <input
          type="range"
          min={1000000}
          max={25000000}
          step={500000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-amber"
        />
      </div>

      {/* Group size */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('adults')}</label>
          <input
            type="number"
            min={1}
            max={10}
            value={adults}
            onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 text-center font-black shadow-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('children')}</label>
          <input
            type="number"
            min={0}
            max={10}
            value={children}
            onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 text-center font-black shadow-sm"
          />
        </div>
      </div>

      {/* Interests Custom Text Input */}
      <div className="flex flex-col gap-2 relative z-10 border-t border-gray-150 pt-5">
        <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('interests')}</label>
        <textarea
          rows={4}
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder={language === 'vi'
            ? 'Hãy viết sở thích cá nhân của bạn (Ví dụ: Muốn ăn cao lầu Bà Bé, uống cà phê sữa đá ven sông, đi dạo ngắm đèn lồng Phố Cổ và ngắm hoàng hôn biển An Bàng...)'
            : 'Write your personalized travel preferences...'}
          className="w-full bg-white border border-gray-200 text-gray-850 px-4 py-3.5 rounded-2xl text-xs focus:outline-none focus:border-heritage-amber resize-none font-bold leading-relaxed hover:border-gray-300 focus:ring-4 focus:ring-heritage-amber/10 transition-all duration-300 shadow-sm"
        />
      </div>

      {/* CTA Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mt-2 py-4 bg-gradient-to-tr from-heritage-amber to-heritage-gold hover:from-heritage-gold hover:to-heritage-amber disabled:bg-gray-300 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-heritage-amber/25 hover:shadow-heritage-amber/35 cursor-pointer border-none z-10 uppercase"
      >
        <Sparkles className="w-4 h-4 animate-spin-slow" />
        {loading ? t('generating') : t('generateButton')}
      </button>
    </div>
  );
}
