import React from 'react';
import { Info, RefreshCw, ChevronLeft, ChevronRight, Sunrise, Compass, Sun, Moon } from 'lucide-react';
import { formatPriceRange } from '../../utils/formatUtils';

const ItineraryTimeline = ({ 
  itinerary, 
  activeDay, 
  language, 
  selectedSpot, 
  setSelectedSpot, 
  showTravelRoute, 
  handleSwapSpot, 
  slotPage, 
  setSlotPage, 
  t 
}) => {
  const activeDayData = itinerary[activeDay - 1];
  if (!activeDayData) return null;

  const displaySlots = activeDayData.slots
    ? activeDayData.slots.filter(s => s.slot !== 'STAY')
    : [
      { slot: 'morning', spot: activeDayData.morning, time: '08:00 - 09:30' },
      { slot: 'afternoon', spot: activeDayData.afternoon, time: '14:30 - 16:00' },
      { slot: 'evening', spot: activeDayData.evening, time: '19:00 - 20:30' }
    ].filter(s => s.spot);

  const getSlotInfo = (slotKey) => {
    const key = slotKey?.toUpperCase() || '';
    if (key.includes('BREAKFAST')) {
      return { label: language === 'vi' ? '🥞 Ăn sáng' : '🥞 Breakfast', icon: Sunrise, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (key.includes('MORNING')) {
      return { label: language === 'vi' ? '☀️ Tham quan Sáng' : '☀️ Morning Sightseeing', icon: Compass, color: 'text-blue-500 bg-blue-50 border-blue-200' };
    }
    if (key.includes('LUNCH')) {
      return { label: language === 'vi' ? '🍲 Ăn trưa' : '🍲 Lunch', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    }
    if (key.includes('AFTERNOON_TEA') || key.includes('CAFE')) {
      return { label: language === 'vi' ? '☕ Ăn chiều & Cà phê' : '☕ Afternoon Tea & Cafe', icon: Compass, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (key.includes('AFTERNOON')) {
      return { label: language === 'vi' ? '🌇 Tham quan Chiều' : '🌇 Afternoon Sightseeing', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    }
    if (key.includes('DINNER')) {
      return { label: language === 'vi' ? '🏮 Ăn tối' : '🏮 Dinner', icon: Moon, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
    if (key.includes('EVENING')) {
      return { label: language === 'vi' ? '🌃 Vui chơi Tối' : '🌃 Evening Experience', icon: Moon, color: 'text-indigo-650 bg-indigo-50 border-indigo-200' };
    }
    return { label: language === 'vi' ? '📌 Trải nghiệm' : '📌 Activity', icon: Compass, color: 'text-gray-500 bg-gray-50 border-gray-200' };
  };

  const itemsPerPage = 3;
  const totalPages = Math.ceil(displaySlots.length / itemsPerPage);
  const safePage = Math.min(slotPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedSlots = displaySlots.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      {paginatedSlots.map((s, idx) => {
        const item = s.spot;
        if (!item) return null;
        const { label, icon: Icon, color } = getSlotInfo(s.slot);
        const isFocus = selectedSpot && selectedSpot.lat === item.lat && selectedSpot.lng === item.lng;
        const delay = `[animation-delay:${200 + idx * 100}ms]`;
        const timeStr = s.time ? s.time : (language === 'vi' ? 'Lịch trình dự kiến' : 'Estimated schedule');

        return (
          <div
            key={`${s.slot}-${idx}`}
            onClick={() => setSelectedSpot(item)}
            className={`relative flex gap-4 bg-white border p-4 rounded-2xl group hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer shimmer-trigger animate-fade-in-up ${delay} ${isFocus
              ? 'border-heritage-amber ring-2 ring-heritage-amber/20 scale-[1.01]'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            {/* Timeline node */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`p-2 rounded-xl border ${color} flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative`}>
                <Icon className="w-4 h-4" />
                {showTravelRoute && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-25">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </div>
              <div className="w-0.5 h-full bg-gray-150 mt-2 group-last:hidden" />
            </div>

            {/* Content */}
            <div className="flex-grow relative z-10">
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-[10px] text-gray-500 font-semibold">{timeStr}</span>
              </div>

              {/* Spot Image */}
              {item.img && (
                <div className="relative mt-2 mb-2 rounded-lg overflow-hidden border border-gray-150">
                  <img
                    src={item.img}
                    alt={item.name?.[language] || 'Spot'}
                    className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {item.images && item.images.length > 0 && (
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-md font-semibold">📸 {item.images.length}</span>
                  )}
                </div>
              )}

              <div className="flex justify-between items-start gap-2">
                <h4 className={`font-outfit text-sm font-bold transition-colors ${isFocus ? 'text-heritage-amber font-extrabold' : 'text-gray-900 group-hover:text-heritage-amber'
                  }`}>
                  {item.name?.[language] || 'Địa điểm tham quan'}
                </h4>
                <span className="text-xs font-extrabold text-heritage-amber flex-shrink-0">
                  {formatPriceRange(item.minCost || 0, item.maxCost || 0, t('free'))}
                </span>
              </div>

              <p className="text-[10.5px] text-gray-500 leading-relaxed mt-1 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-ricefield-green flex-shrink-0 mt-0.5" />
                <span>{item.reason?.[language] || 'Điểm check-in độc đáo thú vị.'}</span>
              </p>

              {/* Interchange actions */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold">{t('quickActions')}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwapSpot(activeDay - 1, s.slot);
                  }}
                  className="text-[10px] hover:text-heritage-amber text-gray-500 flex items-center gap-1 transition-colors cursor-pointer font-bold border-none bg-transparent"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  {t('swapSpot')}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Beautiful & Premium Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 p-3 bg-white border border-gray-150 rounded-2xl shadow-sm animate-fade-in-up">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setSlotPage(p => Math.max(1, p - 1))}
            className={`p-2 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
              safePage === 1
                ? 'bg-transparent text-gray-300 border-gray-100 cursor-not-allowed'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-heritage-amber hover:border-heritage-amber hover:bg-amber-50/20 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const pageNum = pageIdx + 1;
              const isActive = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setSlotPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-heritage-amber text-white border-transparent shadow-md shadow-heritage-amber/15 scale-[1.05]'
                      : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-350 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setSlotPage(p => Math.min(totalPages, p + 1))}
            className={`p-2 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
              safePage === totalPages
                ? 'bg-transparent text-gray-300 border-gray-100 cursor-not-allowed'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-heritage-amber hover:border-heritage-amber hover:bg-amber-50/20 active:scale-95'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

export default ItineraryTimeline;
