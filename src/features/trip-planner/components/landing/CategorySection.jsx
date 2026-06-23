import React from 'react';
import cafeVideo from '@/assets/cafe.mp4';
import homestayVideo from '@/assets/vuichoi.mp4';
import foodVideo from '@/assets/monan.mp4';
import stayVideo from '@/assets/homestay.mp4';

export default function CategorySection({
  language,
  categorySpots,
  CATEGORY_LABELS,
  setShowAllCategory,
  setSavedScrollY,
  setSelectedSpotDetail,
  setActiveFilter,
  setActiveTab,
  setPlannerPrefill,
}) {
  return (
    <section className="max-w-[95%] w-full px-4 sm:px-8 pb-12 flex flex-col gap-10">
      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
        if (!categorySpots[cat] || categorySpots[cat].length === 0) return null;

        if (cat === 'cafe') {
          return (
            <React.Fragment key={cat}>
              {/* Rectangular divider section title */}
              <div className="w-full mt-12 mb-4 scroll-reveal">
                <div className="w-full py-5 px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-6 shadow-sm">
                  <div className="h-[1px] bg-gray-300 flex-grow" />
                  <span className="font-outfit text-[clamp(0.875rem,3.5vw,1.125rem)] font-black text-gray-800 uppercase tracking-widest text-center px-4">
                    {language === 'vi' ? 'Cafe và Ẩm thực' : 'Cafe & Local Food'}
                  </span>
                  <div className="h-[1px] bg-gray-300 flex-grow" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
                {/* Left 30%: Video background header */}
                <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                  {/* Looping video background */}
                  <video
                    src={cafeVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                  {/* Content over video */}
                  <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                        Cafe
                      </h3>
                      <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                        {language === 'vi'
                          ? 'Những quán cà phê mang không gian mộc mạc, tinh tế và đầy chất thơ của phố cổ Hội An.'
                          : 'Poetic, rustic cafes reflecting the tranquil charm of Hoi An.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSavedScrollY(window.scrollY);
                        setShowAllCategory('cafe');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                    </button>
                  </div>
                </div>

                {/* Right 70%: Marquee displaying detailed cards */}
                <div className="w-full md:w-[70%] overflow-x-auto md:overflow-hidden scrollbar-hide relative flex items-center bg-gray-50/60 rounded-2xl py-5 px-2">
                  <div
                    className="animate-marquee-horizontal flex gap-4 select-none"
                    style={{ animationDuration: `${Math.max(40, categorySpots[cat].length * 13.3)}s` }}
                  >
                    {/* Triple the list to ensure seamless looping */}
                    {[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]].map((spot, idx) => (
                      <div
                        key={`${spot.id}-${idx}`}
                        className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden w-[85vw] sm:w-[340px] shrink-0 hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}
                      >
                        <div
                          className="h-56 w-full overflow-hidden relative cursor-pointer"
                          onClick={() => setSelectedSpotDetail(spot)}
                        >
                          <img
                            src={spot.image}
                            alt={spot.name[language]}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-heritage-amber text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            {spot.tag}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-grow gap-3">
                          <div
                            className="cursor-pointer"
                            onClick={() => setSelectedSpotDetail(spot)}
                          >
                            <h4 className="text-lg font-black text-gray-900 line-clamp-1 leading-snug">
                              {spot.name[language]}
                            </h4>
                            <div className="text-[13px] sm:text-sm text-gray-700 flex flex-col gap-1.5 mt-2 leading-relaxed font-bold">
                              {spot.desc[language]
                                ? spot.desc[language]
                                  .split(/[.\n;]+/)
                                  .map(s => s.trim())
                                  .filter(s => s.length > 0)
                                  .slice(0, 3)
                                  .map((sentence, sIdx) => (
                                    <div key={sIdx} className="flex items-start gap-1.5">
                                      <span className="text-heritage-amber text-sm select-none mt-0.5">•</span>
                                      <span className="line-clamp-2 leading-snug">{sentence}</span>
                                    </div>
                                  ))
                                : null}
                            </div>
                          </div>
                          {/* Price — prominent, amber */}
                          <div className="flex justify-between items-center border-t border-amber-100 pt-3 mt-1 bg-amber-50/60 -mx-5 px-5 pb-3">
                            <span className="text-[11px] text-amber-600 font-black uppercase tracking-wider">{language === 'vi' ? 'Giá' : 'Price'}</span>
                            <span className="text-heritage-amber text-base font-black">{spot.price[language]}</span>
                          </div>
                          {/* View detail button */}
                          <button
                            onClick={() => setSelectedSpotDetail(spot)}
                            className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border-none py-3 -mx-5 -mb-5 mt-2"
                            style={{ borderRadius: '0 0 1rem 1rem' }}
                          >
                            {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        }

        if (cat === 'entertainment') {
          return (
            <React.Fragment key={cat}>
              {/* Rectangular divider section title */}
              <div className="w-full mt-12 mb-4 scroll-reveal">
                <div className="w-full py-5 px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-6 shadow-sm">
                  <div className="h-[1px] bg-gray-300 flex-grow" />
                  <span className="font-outfit text-[clamp(0.875rem,3.5vw,1.125rem)] font-black text-gray-800 uppercase tracking-widest text-center px-4">
                    {language === 'vi' ? 'Vui chơi và Nghỉ dưỡng' : 'Entertainment & Stay'}
                  </span>
                  <div className="h-[1px] bg-gray-300 flex-grow" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
                {/* Left 30%: Video background header */}
                <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                  <video
                    src={homestayVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                  <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                        {language === 'vi' ? 'Vui chơi' : 'Entertainment'}
                      </h3>
                      <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                        {language === 'vi'
                          ? 'Những khu vui chơi, giải trí đặc sắc mang đậm văn hóa và sức sống của Hội An.'
                          : 'Vibrant entertainment venues and activities rooted in Hoi An culture.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSavedScrollY(window.scrollY);
                        setShowAllCategory('entertainment');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                    </button>
                  </div>
                </div>

                {/* Right 70%: Scrollable spot cards */}
                <div className="w-full md:w-[70%] overflow-x-auto md:overflow-hidden scrollbar-hide relative flex items-center bg-gray-50/60 rounded-2xl py-5 px-2">
                  <div
                    className="animate-marquee-horizontal flex gap-4 select-none"
                    style={{ animationDuration: `${Math.max(40, categorySpots[cat].length * 13.3)}s` }}
                  >
                    {[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]].map((spot, idx) => (
                      <div
                        key={`${spot.id}-${idx}`}
                        className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden w-[85vw] sm:w-[340px] shrink-0 hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}
                      >
                        <div
                          className="h-56 w-full overflow-hidden relative cursor-pointer"
                          onClick={() => setSelectedSpotDetail(spot)}
                        >
                          <img
                            src={spot.image}
                            alt={spot.name[language]}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-heritage-amber text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            {spot.tag}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-grow gap-3">
                          <div className="cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}>
                            <h4 className="text-lg font-black text-gray-900 line-clamp-1 leading-snug">
                              {spot.name[language]}
                            </h4>
                            <div className="text-[13px] sm:text-sm text-gray-700 flex flex-col gap-1.5 mt-2 leading-relaxed font-bold">
                              {spot.desc[language]
                                ? spot.desc[language]
                                  .split(/[.\n;]+/)
                                  .map(s => s.trim())
                                  .filter(s => s.length > 0)
                                  .slice(0, 3)
                                  .map((sentence, sIdx) => (
                                    <div key={sIdx} className="flex items-start gap-1.5">
                                      <span className="text-heritage-amber text-sm select-none mt-0.5">•</span>
                                      <span className="line-clamp-2 leading-snug">{sentence}</span>
                                    </div>
                                  ))
                                : null}
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t border-amber-100 pt-3 bg-amber-50/60 -mx-5 px-5 pb-3">
                            <span className="text-[11px] text-amber-600 font-black uppercase tracking-wider">{language === 'vi' ? 'Giá' : 'Price'}</span>
                            <span className="text-heritage-amber text-base font-black">{spot.price[language]}</span>
                          </div>
                          <button
                            onClick={() => setSelectedSpotDetail(spot)}
                            className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border-none py-3 -mx-5 -mb-5 mt-2"
                            style={{ borderRadius: '0 0 1rem 1rem' }}
                          >
                            {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        }

        if (cat === 'food') {
          return (
            <div key={cat} className="flex flex-col md:flex-row-reverse items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
              {/* Left 30%: Video background */}
              <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                <video
                  src={foodVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                      {language === 'vi' ? 'Ẩm thực' : 'Local Food'}
                    </h3>
                    <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                      {language === 'vi'
                        ? 'Những món ăn đặc sản mang đậm hương vị địa phương, tinh tú của ẩm thực Hội An và xứ Quảng.'
                        : 'Authentic local dishes capturing the rich culinary soul of Hoi An and Quang Nam.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSavedScrollY(window.scrollY);
                      setShowAllCategory('food');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                  </button>
                </div>
              </div>

              {/* Right 70%: Marquee */}
              <div className="w-full md:w-[70%] overflow-x-auto md:overflow-hidden scrollbar-hide relative flex items-center bg-gray-50/60 rounded-2xl py-5 px-2">
                <div
                  className="animate-marquee-horizontal flex gap-4 select-none"
                  style={{ animationDuration: `${Math.max(40, categorySpots[cat].length * 13.3)}s` }}
                >
                  {[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]].map((spot, idx) => (
                    <div
                      key={`${spot.id}-${idx}`}
                      className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden w-[85vw] sm:w-[340px] shrink-0 hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}
                    >
                      <div
                        className="h-56 w-full overflow-hidden relative cursor-pointer"
                        onClick={() => setSelectedSpotDetail(spot)}
                      >
                        <img
                          src={spot.image}
                          alt={spot.name[language]}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-heritage-amber text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {spot.tag}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-grow gap-3">
                        <div className="cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}>
                          <h4 className="text-lg font-black text-gray-900 line-clamp-1 leading-snug">
                            {spot.name[language]}
                          </h4>
                          <div className="text-[13px] sm:text-sm text-gray-700 flex flex-col gap-1.5 mt-2 leading-relaxed font-bold">
                            {spot.desc[language]
                              ? spot.desc[language]
                                .split(/[.\n;]+/)
                                .map(s => s.trim())
                                .filter(s => s.length > 0)
                                .slice(0, 3)
                                .map((sentence, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5">
                                    <span className="text-heritage-amber text-sm select-none mt-0.5">•</span>
                                    <span className="line-clamp-2 leading-snug">{sentence}</span>
                                  </div>
                                ))
                              : null}
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-amber-100 pt-3 bg-amber-50/60 -mx-5 px-5 pb-3">
                          <span className="text-[11px] text-amber-600 font-black uppercase tracking-wider">{language === 'vi' ? 'Giá' : 'Price'}</span>
                          <span className="text-heritage-amber text-base font-black">{spot.price[language]}</span>
                        </div>
                        <button
                          onClick={() => setSelectedSpotDetail(spot)}
                          className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border-none py-3 -mx-5 -mb-5 mt-2"
                          style={{ borderRadius: '0 0 1rem 1rem' }}
                        >
                          {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        if (cat === 'stay') {
          return (
            <div key={cat} className="flex flex-col md:flex-row items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
              {/* Left 30%: Video background */}
              <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                <video
                  src={stayVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                      {language === 'vi' ? 'Nghỉ dưỡng' : 'Stay & Healing'}
                    </h3>
                    <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                      {language === 'vi'
                        ? 'Những nơi lưu trú mang lại cảm giác bình yên, gần gũi thiên nhiên giữa lòng Hội An cổ kính.'
                        : 'Peaceful accommodations nestled in the heart of ancient Hoi An, close to nature.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSavedScrollY(window.scrollY);
                      setShowAllCategory('stay');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                  </button>
                </div>
              </div>

              {/* Right 70%: Marquee */}
              <div className="w-full md:w-[70%] overflow-x-auto md:overflow-hidden scrollbar-hide relative flex items-center bg-gray-50/60 rounded-2xl py-5 px-2">
                <div
                  className="animate-marquee-horizontal flex gap-4 select-none"
                  style={{ animationDuration: `${Math.max(40, categorySpots[cat].length * 13.3)}s` }}
                >
                  {[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]].map((spot, idx) => (
                    <div
                      key={`${spot.id}-${idx}`}
                      className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden w-[85vw] sm:w-[340px] shrink-0 hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}
                    >
                      <div
                        className="h-56 w-full overflow-hidden relative cursor-pointer"
                        onClick={() => setSelectedSpotDetail(spot)}
                      >
                        <img
                          src={spot.image}
                          alt={spot.name[language]}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-heritage-amber text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {spot.tag}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-grow gap-3">
                        <div className="cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}>
                          <h4 className="text-lg font-black text-gray-900 line-clamp-1 leading-snug">
                            {spot.name[language]}
                          </h4>
                          <div className="text-[13px] sm:text-sm text-gray-700 flex flex-col gap-1.5 mt-2 leading-relaxed font-bold">
                            {spot.desc[language]
                              ? spot.desc[language]
                                .split(/[.\n;]+/)
                                .map(s => s.trim())
                                .filter(s => s.length > 0)
                                .slice(0, 3)
                                .map((sentence, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5">
                                    <span className="text-heritage-amber text-sm select-none mt-0.5">•</span>
                                    <span className="line-clamp-2 leading-snug">{sentence}</span>
                                  </div>
                                ))
                              : null}
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-amber-100 pt-3 bg-amber-50/60 -mx-5 px-5 pb-3">
                          <span className="text-[11px] text-amber-600 font-black uppercase tracking-wider">{language === 'vi' ? 'Giá' : 'Price'}</span>
                          <span className="text-heritage-amber text-base font-black">{spot.price[language]}</span>
                        </div>
                        <button
                          onClick={() => setSelectedSpotDetail(spot)}
                          className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border-none py-3 -mx-5 -mb-5 mt-2"
                          style={{ borderRadius: '0 0 1rem 1rem' }}
                        >
                          {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Default: sightseeing (small card grid)
        return (
          <div key={cat} className="flex flex-col gap-4 scroll-reveal">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-xl font-extrabold text-gray-900">{language === 'vi' ? label.vi : label.en}</h3>
              <button
                onClick={() => { setActiveFilter(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-[11px] text-heritage-amber font-extrabold hover:underline cursor-pointer"
              >{language === 'vi' ? 'Xem thêm →' : 'See more →'}</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {categorySpots[cat].map(spot => (
                <div key={spot.id} className="flex-shrink-0 w-52 sm:w-56 bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer snap-start"
                  onClick={() => setSelectedSpotDetail(spot)}
                >
                  <div className="h-32 overflow-hidden bg-gray-100">
                    <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <p className="text-xs font-extrabold text-gray-900 line-clamp-1 group-hover:text-heritage-amber transition-colors">{spot.name[language]}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{spot.price[language]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
