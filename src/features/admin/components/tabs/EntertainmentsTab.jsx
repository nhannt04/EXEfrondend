import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import EntertainmentForm from '../../../entertainment/components/EntertainmentForm';

export default function EntertainmentsTab(props) {
  const {
    language, entertainments, filteredEntertainments, currentEntertainments, entertainmentSearchTerm, setEntertainmentSearchTerm, setCurrentEntertainmentPage, totalEntertainmentPages, indexOfFirstEntertainment, indexOfLastEntertainment, currentEntertainmentPage, handleAddEntertainmentClick, handleEditEntertainmentClick, handleDeleteEntertainment, formatTime, showAddEntertainmentModal, setShowAddEntertainmentModal, isEntertainmentEditMode, editingEntertainmentId, newEntertainmentType, newEntertainmentInterests, newEntertainmentName, newEntertainmentAddress, newEntertainmentLat, newEntertainmentLng, newEntertainmentMinPrice, newEntertainmentMaxPrice, newEntertainmentImageUrl, newEntertainmentOpeningTime, newEntertainmentClosingTime, fetchData
  } = props;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-outfit text-lg font-extrabold text-gray-900">
            {language === 'vi' ? 'Quản lý Khu vui chơi Hội An' : 'Hoi An Entertainments Directory'}
          </h3>
          <button
            type="button"
            onClick={handleAddEntertainmentClick}
            className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
          >
            <Plus className="w-4 h-4" />
            {language === 'vi' ? 'Đăng ký Khu vui chơi mới' : 'Register New Entertainment'}
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={entertainmentSearchTerm}
              onChange={(e) => { setEntertainmentSearchTerm(e.target.value); setCurrentEntertainmentPage(1); }}
              placeholder={language === 'vi' ? '🔍 Tìm kiếm khu vui chơi...' : '🔍 Search entertainments...'}
              className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
            />
          </div>
          <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            {language === 'vi' ? `Tìm thấy: ${filteredEntertainments.length} / ${entertainments.length} địa điểm` : `Found: ${filteredEntertainments.length} / ${entertainments.length} spots`}
          </div>
        </div>

        {filteredEntertainments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <span className="text-3xl block mb-2">🎡</span>
            <p className="text-gray-500 font-bold text-xs">
              {language === 'vi' ? 'Không có khu vui chơi nào phù hợp!' : 'No matching entertainment data available!'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                  <th className="p-4">{language === 'vi' ? 'Tên khu vui chơi' : 'Name'}</th>
                  <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Type'}</th>
                  <th className="p-4">{language === 'vi' ? 'Sở thích' : 'Interests'}</th>
                  <th className="p-4">{language === 'vi' ? 'Giờ hoạt động' : 'Hours'}</th>
                  <th className="p-4">{language === 'vi' ? 'Giá vé' : 'Price Range'}</th>
                  <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                  <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                {currentEntertainments.map((ent) => (
                  <tr key={ent.id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={ent.imageUrl} alt={ent.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                      <span className="font-bold text-gray-900 text-sm">{ent.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                        ent.type === 'Biển' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                          ent.type === 'Vui chơi' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            'bg-teal-50 text-teal-600 border-teal-100'
                      }`}>
                        {ent.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(ent.interests || '').split(',').map((interest, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap font-semibold">
                      🕒 {formatTime(ent.openingTime)} - {formatTime(ent.closingTime)}
                    </td>
                    <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                      {ent.minPrice > 0 || ent.maxPrice > 0 ? (
                        `${ent.minPrice.toLocaleString()}đ - ${ent.maxPrice.toLocaleString()}đ`
                      ) : (language === 'vi' ? 'Miễn phí / Liên hệ' : 'Free / Contact')}
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate font-semibold" title={ent.address}>
                      {ent.address}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleEditEntertainmentClick(ent)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                        title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntertainment(ent.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                        title={language === 'vi' ? 'Xoá' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controller */}
            {totalEntertainmentPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  {language === 'vi'
                    ? `Hiển thị địa điểm ${indexOfFirstEntertainment + 1} - ${Math.min(indexOfLastEntertainment, filteredEntertainments.length)} trong tổng số ${filteredEntertainments.length} địa điểm`
                    : `Showing ${indexOfFirstEntertainment + 1} - ${Math.min(indexOfLastEntertainment, filteredEntertainments.length)} of ${filteredEntertainments.length} spots`}
                </div>
                <div className="flex gap-1.5 items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentEntertainmentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentEntertainmentPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {language === 'vi' ? 'Trước' : 'Prev'}
                  </button>
                  {Array.from({ length: totalEntertainmentPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentEntertainmentPage(p)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                        currentEntertainmentPage === p
                          ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentEntertainmentPage(prev => Math.min(prev + 1, totalEntertainmentPages))}
                    disabled={currentEntertainmentPage === totalEntertainmentPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {language === 'vi' ? 'Sau' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddEntertainmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up">
            <button
              type="button"
              onClick={() => setShowAddEntertainmentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-b-gray-100">
              {isEntertainmentEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Khu vui chơi' : '📝 Edit Entertainment Spot')
                : (language === 'vi' ? '✨ Đăng ký Khu vui chơi mới' : '✨ Register New Entertainment Spot')}
            </h3>

            <EntertainmentForm
              initialData={isEntertainmentEditMode ? {
                id: editingEntertainmentId,
                type: newEntertainmentType,
                interests: newEntertainmentInterests,
                name: newEntertainmentName,
                address: newEntertainmentAddress,
                latitude: newEntertainmentLat,
                longitude: newEntertainmentLng,
                minPrice: newEntertainmentMinPrice,
                maxPrice: newEntertainmentMaxPrice,
                imageUrl: newEntertainmentImageUrl,
                openingTime: newEntertainmentOpeningTime,
                closingTime: newEntertainmentClosingTime,
                overnight: false
              } : null}
              onCancel={() => setShowAddEntertainmentModal(false)}
              onSuccess={async () => { setShowAddEntertainmentModal(false); await fetchData(); }}
            />
          </div>
        </div>
      )}
    </>
  );
}
