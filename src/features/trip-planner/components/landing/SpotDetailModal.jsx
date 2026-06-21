import React from 'react';

export default function SpotDetailModal({
  selectedSpotDetail,
  language,
  setSelectedSpotDetail,
  setPlannerPrefill,
  setActiveTab,
  renderFormattedDescription,
}) {
  if (!selectedSpotDetail) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up max-h-[90vh]">

        {/* Modal Image Header */}
        <div className="relative h-60 bg-gray-150 flex-shrink-0">
          <img
            src={selectedSpotDetail.image}
            alt={selectedSpotDetail.name[language]}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Close Button */}
          <button
            onClick={() => setSelectedSpotDetail(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full border-none cursor-pointer backdrop-blur-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title & Badges in overlay */}
          <div className="absolute bottom-4 left-6 right-6 text-white flex flex-col gap-1.5">
            <div className="flex gap-2">
              <span className="bg-heritage-amber text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                {selectedSpotDetail.category[language]}
              </span>
              <span className="bg-ricefield-green text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                {selectedSpotDetail.tag}
              </span>
            </div>
            <h3 className="font-outfit text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-sm">
              {selectedSpotDetail.name[language]}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">

          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
              {language === 'vi' ? 'Mô tả chi tiết' : 'Description'}
            </span>
            {selectedSpotDetail.desc[language] ? (
              renderFormattedDescription(selectedSpotDetail.desc[language])
            ) : (
              <p className="text-xs sm:text-sm text-gray-650 leading-relaxed font-medium">
                {language === 'vi' ? 'Không có mô tả chi tiết cho địa điểm này.' : 'No detailed description available.'}
              </p>
            )}
          </div>

          {/* Cost / Price */}
          <div className="flex justify-between items-center bg-gray-50 border border-gray-150 p-4 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase">
                {language === 'vi' ? 'Chi phí ước tính' : 'Estimated Cost'}
              </span>
              <span className="text-sm font-black text-gray-800 mt-0.5">
                {selectedSpotDetail.price[language]}
              </span>
            </div>

            {/* Latitude & Longitude display */}
            {selectedSpotDetail.lat && selectedSpotDetail.lng && (
              <div className="flex flex-col text-right">
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase">GPS</span>
                <span className="text-[10.5px] font-bold text-gray-500 mt-0.5">
                  {selectedSpotDetail.lat.toFixed(4)}, {selectedSpotDetail.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Directions Button using local map */}
            {selectedSpotDetail.lat && selectedSpotDetail.lng && (
              <button
                onClick={() => {
                  setPlannerPrefill({ directionSpot: selectedSpotDetail });
                  setSelectedSpotDetail(null);
                  setActiveTab('planner');
                }}
                className="w-full py-3 bg-gradient-to-tr from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 border-none"
              >
                🗺️ {language === 'vi' ? 'XEM CHỈ ĐƯỜNG' : 'GET DIRECTIONS'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
