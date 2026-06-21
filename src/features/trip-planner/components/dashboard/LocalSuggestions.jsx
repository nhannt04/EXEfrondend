import React from 'react';
import { Sparkles } from 'lucide-react';

const LocalSuggestions = ({ 
  language, 
  style, 
  allDbSpots, 
  rentalPage, 
  setRentalPage, 
  setSelectedSpot, 
  t 
}) => {
  return (
    <div className="bg-gradient-to-tr from-white to-orange-50/20 border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm animate-fade-in-up">
      <h3 className="font-outfit text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
        <Sparkles className="w-4 h-4 text-heritage-amber animate-spin-slow" />
        {language === 'vi' ? 'Gợi Ý Dịch Vụ Bản Địa' : 'Local Service Suggestions'}
      </h3>
      
      <div className="flex flex-col gap-3">
        {(() => {
          const dbRentals = allDbSpots.filter(s => 
            s.category === 'rental' || 
            (s.tags && s.tags.toLowerCase().includes('rental')) || 
            (s.tags && s.tags.toLowerCase().includes('thuê'))
          );
          
          const pageSize = 3;
          const totalPages = Math.ceil(dbRentals.length / pageSize);
          const activePage = rentalPage > totalPages ? 1 : rentalPage;
          const startIndex = (activePage - 1) * pageSize;
          const paginatedRentals = dbRentals.slice(startIndex, startIndex + pageSize);
          
          if (dbRentals.length > 0) {
            return (
              <>
                {paginatedRentals.map((rental, idx) => (
                  <div key={rental.id || idx} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                    <span className="text-xl">
                      {rental.name?.[language]?.toLowerCase().includes('đạp') || rental.name?.[language]?.toLowerCase().includes('bike') ? '🚲' :
                       rental.name?.[language]?.toLowerCase().includes('máy') || rental.name?.[language]?.toLowerCase().includes('motor') ? '🛵' :
                       rental.name?.[language]?.toLowerCase().includes('áo') || rental.name?.[language]?.toLowerCase().includes('dài') || rental.name?.[language]?.toLowerCase().includes('phục') ? '👘' :
                       rental.name?.[language]?.toLowerCase().includes('ảnh') || rental.name?.[language]?.toLowerCase().includes('camera') ? '📸' : '📦'}
                    </span>
                    <div className="flex flex-col flex-grow">
                      <strong className="text-xs text-gray-800">{rental.name?.[language] || rental.name?.vi}</strong>
                      <span className="text-[10px] text-gray-400">
                        {rental.cost ? `Từ ${rental.cost.toLocaleString('vi-VN')}đ` : 'Giá ưu đãi'} • {rental.reason?.[language] || rental.reason?.vi || (language === 'vi' ? 'Tiệm thuê uy tín gần bạn' : 'Highly-rated shop near you')}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedSpot(rental)}
                      className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer hover:bg-heritage-amber/20 transition-all whitespace-nowrap"
                    >
                      {language === 'vi' ? 'Xem bản đồ' : 'View on map'}
                    </button>
                  </div>
                ))}
                
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 w-full">
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider">
                      {language === 'vi' ? `Trang ${activePage} / ${totalPages}` : `Page ${activePage} of ${totalPages}`}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        disabled={activePage === 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRentalPage(prev => Math.max(1, prev - 1));
                        }}
                        className={`px-2 py-1 rounded text-[9.5px] font-extrabold tracking-wider transition-all border border-none cursor-pointer ${
                          activePage === 1 
                            ? 'bg-gray-100 text-gray-400 opacity-55 cursor-not-allowed' 
                            : 'bg-heritage-amber/10 text-heritage-amber hover:bg-heritage-amber/20 hover:scale-105'
                        }`}
                      >
                        {language === 'vi' ? 'TRƯỚC' : 'PREV'}
                      </button>
                      <button
                        disabled={activePage === totalPages}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRentalPage(prev => Math.min(totalPages, prev + 1));
                        }}
                        className={`px-2 py-1 rounded text-[9.5px] font-extrabold tracking-wider transition-all border border-none cursor-pointer ${
                          activePage === totalPages 
                            ? 'bg-gray-100 text-gray-400 opacity-55 cursor-not-allowed' 
                            : 'bg-heritage-amber/10 text-heritage-amber hover:bg-heritage-amber/20 hover:scale-105'
                        }`}
                      >
                        {language === 'vi' ? 'SAU' : 'NEXT'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          }
          
          // Fallbacks if no rentals loaded from DB
          return style === 'Chill & Thư giãn' ? (
            <>
              <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                <span className="text-xl">🏡</span>
                <div className="flex flex-col flex-grow">
                  <strong className="text-xs text-gray-800">Homestay Làng Rau Trà Quế</strong>
                  <span className="text-[10px] text-gray-400">Từ 350.000đ/đêm • 4.8★</span>
                </div>
                <button className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Đặt phòng</button>
              </div>
              <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                <span className="text-xl">🚲</span>
                <div className="flex flex-col flex-grow">
                  <strong className="text-xs text-gray-800">Cho thuê xe đạp sinh thái</strong>
                  <span className="text-[10px] text-gray-400">Từ 50.000đ/ngày • Thân thiện môi trường</span>
                </div>
                <button className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Thuê ngay</button>
              </div>
            </>
          ) : style === 'Sống ảo' ? (
            <>
              <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                <span className="text-xl">👘</span>
                <div className="flex flex-col flex-grow">
                  <strong className="text-xs text-gray-800">Cho thuê Áo Dài cổ trang Hội An</strong>
                  <span className="text-[10px] text-gray-400">Từ 120.000đ/bộ • Nhiều mẫu cực đẹp</span>
                </div>
                <button className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Thuê ngay</button>
              </div>
              <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                <span className="text-xl">📸</span>
                <div className="flex flex-col flex-grow">
                  <strong className="text-xs text-gray-800">Thuê máy ảnh film & Thợ chụp</strong>
                  <span className="text-[10px] text-gray-400">Từ 400.000đ/buổi • Lưu giữ khoảnh khắc</span>
                </div>
                <button className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Liên hệ</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                <span className="text-xl">🛵</span>
                <div className="flex flex-col flex-grow">
                  <strong className="text-xs text-gray-800">Cho thuê xe máy Hội An Tây</strong>
                  <span className="text-[10px] text-gray-400">Từ 100.000đ/ngày • Giao xe tận nơi</span>
                </div>
                <button className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Thuê ngay</button>
              </div>
              <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                <span className="text-xl">🏺</span>
                <div className="flex flex-col flex-grow">
                  <strong className="text-xs text-gray-800">Vé học làm Gốm Thanh Hà</strong>
                  <span className="text-[10px] text-gray-400">Chỉ 35.000đ/vé • Tự làm sản phẩm</span>
                </div>
                <button className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Mua vé</button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default LocalSuggestions;
