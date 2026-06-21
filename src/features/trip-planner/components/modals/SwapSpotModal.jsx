import React from 'react';

const SwapSpotModal = ({
  swapDropdown,
  setSwapDropdown,
  executeSwapSpot,
  language
}) => {
  if (!swapDropdown) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999] flex items-center justify-center animate-fade-in" onClick={() => setSwapDropdown(null)}>
      <div 
        className="bg-white/95 border border-gray-200 p-5 rounded-2xl w-[90%] max-w-[380px] shadow-2xl flex flex-col gap-4 animate-scale-up backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">
              {language === 'vi' ? 'Thay thế địa điểm' : 'Swap Location'}
            </span>
            <strong className="text-xs text-gray-800">
              {swapDropdown.currentSpot.name?.[language] || swapDropdown.currentSpot.name?.vi}
            </strong>
          </div>
          <button 
            onClick={() => setSwapDropdown(null)}
            className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm font-extrabold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
          {swapDropdown.candidates.length > 0 ? (
            swapDropdown.candidates.map((candidate, idx) => (
              <div
                key={candidate.id || idx}
                onClick={() => {
                  executeSwapSpot(candidate);
                }}
                className="flex gap-3 items-center bg-white hover:bg-heritage-amber/5 hover:border-heritage-amber/30 p-2.5 rounded-xl border border-gray-150 transition-all cursor-pointer group"
              >
                <img
                  src={candidate.img || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80'}
                  alt="Candidate"
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex flex-col flex-grow min-w-0">
                  <strong className="text-xs text-gray-800 truncate group-hover:text-heritage-amber transition-colors">
                    {candidate.name?.[language] || candidate.name?.vi}
                  </strong>
                  <span className="text-[9px] text-gray-400 truncate">
                    {candidate.cost ? `${candidate.cost.toLocaleString()}đ` : (language === 'vi' ? 'Giá tham khảo' : 'Reference price')} • {candidate.reason?.[language] || candidate.reason?.vi || (language === 'vi' ? 'Điểm thay thế hấp dẫn' : 'Great alternative')}
                  </span>
                </div>
                <span className="text-xs text-heritage-amber opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {language === 'vi' ? 'Chọn' : 'Select'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              {language === 'vi' ? 'Không tìm thấy địa điểm thay thế tương tự.' : 'No similar alternatives found.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapSpotModal;
