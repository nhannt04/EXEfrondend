import React from 'react';

export default function SpotlightMarquee({
  language,
  spots,
  allFeaturedSpots,
  activeFilter,
  setActiveFilter,
  FILTERS,
  setSelectedSpotDetail,
}) {
  return (
    <section className="max-w-[95%] w-full px-4 sm:px-8 py-12 sm:py-16 flex flex-col gap-8">

      {/* Destination Header & Marquee Spot Showcase */}
      <div className="flex flex-col md:flex-row items-stretch gap-6 w-full bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm overflow-hidden scroll-reveal">
        {/* Left 30%: Bạn muốn đi đến đâu header with Filters */}
        <div className="w-full md:w-[30%] flex flex-col justify-center gap-4 pr-0 md:pr-4 md:border-r border-gray-150">
          <div>
            <h3 className="font-outfit text-lg font-black text-gray-900 leading-snug">
              {language === 'vi' ? 'Bạn muốn đi đến đâu?' : 'Where do you want to go?'}
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold leading-normal mt-1">
              {language === 'vi' ? 'Khám phá tất cả ngóc ngách Việt Nam' : 'Explore all corners of Vietnam'}
            </p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all duration-300 cursor-pointer shrink-0 ${
                  activeFilter === f.key
                    ? 'bg-heritage-amber border-heritage-amber text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {language === 'vi' ? f.labelVi : f.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Right 70%: Marquee Scrolling Spots */}
        <div className="w-full md:w-[70%] overflow-x-auto md:overflow-hidden scrollbar-hide relative flex items-center bg-gray-50/50 rounded-2xl py-2 px-1">
          {spots.length > 0 ? (
            <div className="animate-marquee-horizontal flex gap-4 select-none">
              {/* Triple the array elements to ensure seamless loop */}
              {[...spots, ...spots, ...spots, ...spots].map((spot, idx) => (
                <div
                  key={`${spot.id}-${idx}`}
                  onClick={() => setSelectedSpotDetail(spot)}
                  className="flex items-center gap-3 bg-white border border-gray-150 rounded-xl p-2.5 w-[220px] shrink-0 hover:border-heritage-amber/40 hover:shadow-sm cursor-pointer transition-all duration-300"
                >
                  <img
                    src={spot.image}
                    alt={spot.name[language]}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[11.5px] font-black text-gray-800 truncate leading-snug">
                      {spot.name[language]}
                    </h4>
                    <span className="text-[10px] text-heritage-amber uppercase font-extrabold mt-0.5 tracking-wider">
                      {spot.category[language]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center text-xs text-gray-400 py-4">
              {language === 'vi' ? 'Đang tải gợi ý...' : 'Loading recommendations...'}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links Showcase (Matches image style exactly) */}
      <div className="flex flex-wrap items-center justify-around w-full py-8 bg-white gap-6 scroll-reveal">
        {[
          {
            labelVi: 'LỊCH TRÌNH',
            labelEn: 'ITINERARY',
            icon: (
              <svg viewBox="0 0 64 64" fill="none" stroke="#003366" strokeWidth="1.5" className="w-16 h-16 transition-transform duration-300 group-hover:scale-105">
                {/* Megaphone */}
                <path d="M12 28l12-8v16l-12-8z" strokeLinejoin="round" />
                <path d="M6 26h6v4H6z" />
                <path d="M8 30v4" />
                {/* Calendar main */}
                <rect x="26" y="24" width="28" height="28" rx="2" />
                <line x1="26" y1="32" x2="54" y2="32" />
                {/* Calendar hanger rings */}
                <path d="M32 18v6M48 18v6" strokeLinecap="round" />
                {/* Ticket outline */}
                <rect x="36" y="12" width="14" height="8" rx="1" transform="rotate(-15 36 12)" />
                <circle cx="43" cy="15" r="1" />
                {/* Star inside calendar */}
                <path d="M40 40l1.5 3 3.5 0.5-2.5 2.5 0.6 3.5-3.1-1.6-3.1 1.6 0.6-3.5-2.5-2.5 3.5-0.5z" fill="#003366" />
              </svg>
            )
          },
          {
            labelVi: 'DU LỊCH',
            labelEn: 'TRAVEL',
            icon: (
              <svg viewBox="0 0 64 64" fill="none" stroke="#003366" strokeWidth="1.5" className="w-16 h-16 transition-transform duration-300 group-hover:scale-105">
                {/* Guide Hat & Head */}
                <circle cx="32" cy="26" r="8" />
                <path d="M24 25c0-8 16-8 16 0" />
                <path d="M26 17h12l3 4H23l3-4z" fill="#003366" />
                {/* Guide Body */}
                <path d="M18 52c0-10 6-12 14-12s14 2 14 12v2H18v-2z" />
                {/* Lanyard badge */}
                <path d="M30 40v5h4v-5" />
                <rect x="29" y="45" width="6" height="7" rx="1" />
                {/* Flag */}
                <path d="M20 46l-6-24" strokeLinecap="round" strokeWidth="1.8" />
                <path d="M14 22l-8-3 8-3z" fill="#003366" />
              </svg>
            )
          },
          {
            labelVi: 'AI TRỢ LÝ',
            labelEn: 'AI ASSISTANT',
            icon: (
              <svg viewBox="0 0 64 64" fill="none" stroke="#003366" strokeWidth="1.5" className="w-16 h-16 transition-transform duration-300 group-hover:scale-105">
                {/* Globe */}
                <circle cx="26" cy="26" r="15" />
                <path d="M11 26h30M26 11c4 4 4 26 0 30M26 11c-4 4-4 26 0 30" />
                {/* Airplane */}
                <path d="M16 16l4-4 1 1-1.5 1.5 2.5 2.5-1.5 1-2.5-1.5-2 2z" fill="#003366" />
                {/* Ticket badge & Lectern */}
                <rect x="34" y="38" width="14" height="12" rx="1" />
                <path d="M41 34v4" />
                <circle cx="41" cy="32" r="1" fill="#003366" />
              </svg>
            )
          },
          {
            labelVi: 'BẢN ĐỒ',
            labelEn: 'MAP',
            icon: (
              <svg viewBox="0 0 64 64" fill="none" stroke="#003366" strokeWidth="1.5" className="w-16 h-16 transition-transform duration-300 group-hover:scale-105">
                {/* Folded Map */}
                <path d="M14 44l11-5 14 5 11-5V15l-11 5-14-5-11 5v29z" strokeLinejoin="round" />
                <path d="M25 39V15M39 44V20" />
                {/* Pin Flag */}
                <circle cx="43" cy="24" r="2" fill="#003366" />
                <path d="M43 24v-11" strokeLinecap="round" />
                <path d="M43 13l5-3-5-2v5z" fill="#003366" />
              </svg>
            )
          },
          {
            labelVi: 'GIA ĐÌNH',
            labelEn: 'FAMILY',
            icon: (
              <svg viewBox="0 0 64 64" fill="none" stroke="#003366" strokeWidth="1.5" className="w-16 h-16 transition-transform duration-300 group-hover:scale-105">
                {/* Airplane overhead */}
                <path d="M20 18l12-5 1.5 2.5-3.5 2 4.5 4.5-2.5 1.5-4.5-3-4.5 3.5z" fill="#003366" />
                {/* Man (Right) */}
                <circle cx="38" cy="33" r="5" />
                <path d="M32 46c0-4 3-6 7-6s7 2 7 6v4H32v-4z" />
                {/* Woman (Left) */}
                <circle cx="26" cy="37" r="5" />
                <path d="M20 50c0-4 3-6 7-6s7 2 7 6v2H20v-2z" />
              </svg>
            )
          },
        ].map((item, idx) => {
          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-3 group cursor-pointer p-4 min-w-[130px]"
            >
              <div className="flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-outfit text-[11px] font-black tracking-widest text-[#003366] text-center group-hover:text-heritage-amber transition-colors">
                {language === 'vi' ? item.labelVi : item.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
