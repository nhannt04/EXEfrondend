import React from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import LeafletMap from '../LeafletMap';

export default function StaysTab({
  language,
  // Data
  stays,
  filteredStays,
  currentStays,
  // Pagination
  currentStayPage,
  setCurrentStayPage,
  totalStayPages,
  indexOfFirstStay,
  indexOfLastStay,
  // Search
  staySearchTerm,
  setStaySearchTerm,
  // Handlers
  handleAddStayClick,
  handleEditStayClick,
  handleDeleteStay,
  // Modal state
  showAddStayModal,
  setShowAddStayModal,
  isStayEditMode,
  // Stay form state
  newStayType,
  setNewStayType,
  newStayName,
  setNewStayName,
  newStayAddress,
  setNewStayAddress,
  newStayLat,
  setNewStayLat,
  newStayLng,
  setNewStayLng,
  newStayCapacity,
  setNewStayCapacity,
  newStayMinPrice,
  setNewStayMinPrice,
  newStayMaxPrice,
  setNewStayMaxPrice,
  newStayNotes,
  setNewStayNotes,
  newStayImageUrl,
  setNewStayImageUrl,
  handleStayFormSubmit,
}) {
  return (
    <>
      {/* TAB: Stays Manager */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-outfit text-lg font-extrabold text-gray-900">
            {language === 'vi' ? 'Quản lý Chỗ ở Hội An' : 'Hoi An Accommodations Directory'}
          </h3>
          <button
            type="button"
            onClick={handleAddStayClick}
            className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
          >
            <Plus className="w-4 h-4" />
            {language === 'vi' ? 'Đăng ký Chỗ ở mới' : 'Register New Accommodation'}
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={staySearchTerm}
              onChange={(e) => { setStaySearchTerm(e.target.value); setCurrentStayPage(1); }}
              placeholder={language === 'vi' ? '🔍 Tìm chỗ ở theo tên, loại...' : '🔍 Search stays by name, type...'}
              className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
            />
          </div>
          <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            {language === 'vi' ? `Tìm thấy: ${filteredStays.length} / ${stays.length} căn` : `Found: ${filteredStays.length} / ${stays.length} stays`}
          </div>
        </div>

        {filteredStays.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <span className="text-3xl block mb-2">🏨</span>
            <p className="text-gray-500 font-bold text-xs">
              {language === 'vi' ? 'Không có chỗ ở nào phù hợp!' : 'No matching stays data available!'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                    <th className="p-4">{language === 'vi' ? 'Tên chỗ ở' : 'Accommodation Name'}</th>
                    <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Type'}</th>
                    <th className="p-4">{language === 'vi' ? 'Sức chứa' : 'Capacity'}</th>
                    <th className="p-4">{language === 'vi' ? 'Giá tham khảo' : 'Price Range'}</th>
                    <th className="p-4">{language === 'vi' ? 'Địa chỉ & Ghi chú' : 'Address & Notes'}</th>
                    <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {currentStays.map((stay) => (
                    <tr key={stay.id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={stay.imageUrl} alt={stay.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                        <span className="font-bold text-gray-900 text-sm">{stay.name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                          stay.type === 'Hotel' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          stay.type === 'Villa' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {stay.type}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 font-semibold">{stay.capacity || '—'}</td>
                      <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                        {stay.minPrice > 0 || stay.maxPrice > 0 ? (
                          `${stay.minPrice.toLocaleString()}đ - ${stay.maxPrice.toLocaleString()}đ`
                        ) : (language === 'vi' ? 'Liên hệ' : 'Contact')}
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs">
                        <div className="truncate font-semibold text-gray-700 mb-0.5" title={stay.address}>{stay.address}</div>
                        <div className="truncate text-[10px] text-gray-400 font-medium" title={stay.notes}>{stay.notes}</div>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditStayClick(stay)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                          title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStay(stay.id)}
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
            {totalStayPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  {language === 'vi'
                    ? `Hiển thị căn ${indexOfFirstStay + 1} - ${Math.min(indexOfLastStay, filteredStays.length)} trong tổng số ${filteredStays.length} căn`
                    : `Showing ${indexOfFirstStay + 1} - ${Math.min(indexOfLastStay, filteredStays.length)} of ${filteredStays.length} stays`}
                </div>
                <div className="flex gap-1.5 items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStayPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentStayPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {language === 'vi' ? 'Trước' : 'Prev'}
                  </button>
                  {Array.from({ length: totalStayPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentStayPage(p)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                        currentStayPage === p
                          ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentStayPage(prev => Math.min(prev + 1, totalStayPages))}
                    disabled={currentStayPage === totalStayPages}
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

      {/* Stays CRUD Modal */}
      {showAddStayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleStayFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddStayModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {isStayEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Chỗ ở' : '📝 Edit Accommodation')
                : (language === 'vi' ? '✨ Đăng ký Chỗ ở mới' : '✨ Register New Accommodation')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Stay Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin Chỗ ở' : 'Accommodation Info'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Phân loại' : 'Type'}
                    </label>
                    <select
                      value={newStayType}
                      onChange={(e) => setNewStayType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                    >
                      <option value="Hotel">Hotel</option>
                      <option value="Villa">Villa</option>
                      <option value="Homestay">Homestay</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên chỗ ở' : 'Accommodation Name'}
                    </label>
                    <input
                      type="text"
                      value={newStayName}
                      onChange={(e) => setNewStayName(e.target.value)}
                      placeholder={language === 'vi' ? 'Little Pie Hội An' : 'Little Pie Hoi An'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Sức chứa' : 'Capacity'}
                    </label>
                    <input
                      type="text"
                      value={newStayCapacity}
                      onChange={(e) => setNewStayCapacity(e.target.value)}
                      placeholder={language === 'vi' ? '2 lớn, 1 trẻ em' : '2 adults, 1 child'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Ghi chú' : 'Notes'}
                    </label>
                    <input
                      type="text"
                      value={newStayNotes}
                      onChange={(e) => setNewStayNotes(e.target.value)}
                      placeholder={language === 'vi' ? 'Đặt sớm giá rẻ hơn...' : 'Book early for better rate...'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Địa chỉ' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={newStayAddress}
                    onChange={(e) => setNewStayAddress(e.target.value)}
                    placeholder={language === 'vi' ? 'Trà Quế, Hội An Tây' : 'Tra Que, Hoi An'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newStayMinPrice}
                      onChange={(e) => setNewStayMinPrice(e.target.value)}
                      placeholder="1400000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá đến (VNĐ)' : 'Price To (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newStayMaxPrice}
                      onChange={(e) => setNewStayMaxPrice(e.target.value)}
                      placeholder="1400000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Stay Image & Location */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Hình ảnh & Định vị địa lý' : 'Image & Geolocation'}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Đường dẫn ảnh trực tiếp (Link ảnh)' : 'Direct Image Link'}
                  </label>
                  <input
                    type="url"
                    value={newStayImageUrl}
                    onChange={(e) => setNewStayImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newStayLat}
                      onChange={(e) => setNewStayLat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newStayLng}
                      onChange={(e) => setNewStayLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newStayLat && newStayLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newStayLat)}
                      lng={Number(newStayLng)}
                      name={newStayName}
                      language={language}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddStayModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isStayEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu chỗ ở' : 'Save Stay')}
              </button>
            </div>

          </form>
        </div>
      )}
    </>
  );
}
