import React from 'react';
import { Calendar, X } from 'lucide-react';

const SavedItineraryList = ({
  currentUser,
  savedItineraries,
  savedFilter,
  setSavedFilter,
  handleLoadSaved,
  handleDeleteSaved,
  setActivePlannerTab,
  language,
  t
}) => {
  return (
    <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
      <h3 className="font-outfit text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
        🎒 {language === 'vi' ? 'Lịch trình bạn đã lưu' : 'Your Saved Itineraries'}
      </h3>

      {!currentUser && (
        <div className="text-center py-10 flex flex-col items-center gap-3">
          <span className="text-4xl">🔑</span>
          <p className="text-sm font-semibold text-gray-500">
            {language === 'vi' ? 'Vui lòng đăng nhập để xem lịch trình đã lưu của bạn!' : 'Please login to view your saved itineraries!'}
          </p>
        </div>
      )}

      {currentUser && savedItineraries.length === 0 && (
        <div className="text-center py-12 flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
          <Calendar className="w-8 h-8 text-gray-300 animate-float" />
          <div>
            <p className="text-sm font-bold text-gray-800">
              {language === 'vi' ? 'Chưa có lịch trình nào được lưu!' : 'No itineraries saved yet!'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'vi' ? 'Hãy dùng tính năng Sinh Lịch Trình AI và bấm Lưu để lưu giữ kỷ niệm.' : 'Generate a trip with AI and save it to cloud.'}
            </p>
          </div>
          <button
            onClick={() => setActivePlannerTab('studio')}
            className="mt-2 px-4 py-2 bg-heritage-amber text-white rounded-xl text-xs font-bold border-none hover:bg-heritage-gold cursor-pointer transition-colors"
          >
            {language === 'vi' ? 'Trải nghiệm sinh ngay' : 'Try AI Planner'}
          </button>
        </div>
      )}

      {currentUser && savedItineraries.length > 0 && (
        <div className="flex bg-gray-50 border border-gray-250/50 p-1 rounded-xl w-fit self-start gap-1 select-none mb-2">
          {[
            { filter: 'ALL', label: language === 'vi' ? 'Tất cả' : 'All' },
            { filter: 'NOT_STARTED', label: language === 'vi' ? 'Chưa bắt đầu' : 'Not Started' },
            { filter: 'IN_PROGRESS', label: language === 'vi' ? 'Đang thực hiện' : 'In Progress' },
            { filter: 'COMPLETED', label: language === 'vi' ? 'Đã hoàn thành' : 'Completed' }
          ].map((btn) => (
            <button
              key={btn.filter}
              onClick={() => setSavedFilter(btn.filter)}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all border-none cursor-pointer ${
                savedFilter === btn.filter
                  ? 'bg-white text-heritage-amber shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {currentUser && savedItineraries.length > 0 && (
        (() => {
          const filtered = savedItineraries.filter(saved =>
            savedFilter === 'ALL' || (saved.status || 'NOT_STARTED') === savedFilter
          );

          if (filtered.length === 0) {
            return (
              <div className="text-center py-12 flex flex-col items-center gap-3 border-2 border-dashed border-gray-205 rounded-2xl w-full">
                <Calendar className="w-8 h-8 text-gray-300 animate-float" />
                <p className="text-xs font-bold text-gray-550 leading-relaxed">
                  {language === 'vi' ? 'Không tìm thấy lịch trình nào ở trạng thái này!' : 'No itineraries found in this status!'}
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {filtered.map((saved) => (
                <div
                  key={saved.id}
                  onClick={() => handleLoadSaved(saved)}
                  className="group border border-gray-200 hover:border-heritage-amber hover:shadow-md bg-white p-5 rounded-2xl flex flex-col gap-4 transition-all duration-300 cursor-pointer relative animate-scale-up"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-outfit font-extrabold text-base text-gray-900 group-hover:text-heritage-gold transition-colors">
                          {saved.title}
                        </h4>
                        {(() => {
                          const status = saved.status || 'NOT_STARTED';
                          if (status === 'COMPLETED') {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wide leading-none whitespace-nowrap">
                                {language === 'vi' ? 'Hoàn thành' : 'Completed'}
                              </span>
                            );
                          }
                          if (status === 'IN_PROGRESS') {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 animate-pulse uppercase tracking-wide leading-none whitespace-nowrap">
                                {language === 'vi' ? 'Đang thực hiện' : 'In Progress'}
                              </span>
                            );
                          }
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-50 text-gray-500 border border-gray-200 uppercase tracking-wide leading-none whitespace-nowrap">
                              {language === 'vi' ? 'Chưa bắt đầu' : 'Not Started'}
                            </span>
                          );
                        })()}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">
                        📅 {language === 'vi' ? 'Ngày lưu:' : 'Saved at:'} {new Date(saved.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSaved(saved.id, e)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                      title={language === 'vi' ? 'Xóa lịch trình' : 'Delete Itinerary'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{language === 'vi' ? 'Số ngày' : 'Days'}</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-0.5">{saved.totalDays} {language === 'vi' ? 'Ngày' : 'Days'}</span>
                    </div>
                    <div className="flex flex-col border-x border-gray-200">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{language === 'vi' ? 'Phong cách' : 'Style'}</span>
                      <span className="text-xs font-extrabold text-heritage-amber mt-0.5">{saved.travelStyle}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{language === 'vi' ? 'Chi phí' : 'Budget'}</span>
                      <span className="text-xs font-extrabold text-ricefield-green mt-0.5">{(saved.totalBudget / 1000000).toFixed(1)}M đ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end text-[10px] font-bold text-heritage-amber uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    <span>{language === 'vi' ? 'Mở lịch trình này' : 'Open this itinerary'}</span>
                    <span>➔</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
};

export default SavedItineraryList;
