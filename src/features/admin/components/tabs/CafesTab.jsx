import React from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import LeafletMap from '../LeafletMap';
import AddressDropdown from '../../../../components/AddressDropdown';

export default function CafesTab({
  language,
  // Data
  cafes,
  filteredCafes,
  currentCafes,
  cafeAddresses,
  // Pagination
  currentCafePage,
  setCurrentCafePage,
  totalCafePages,
  indexOfFirstCafe,
  indexOfLastCafe,
  // Search
  cafeSearchTerm,
  setCafeSearchTerm,
  // Handlers
  handleAddCafeClick,
  handleEditCafeClick,
  handleDeleteCafe,
  // Modal state
  showAddCafeModal,
  setShowAddCafeModal,
  isCafeEditMode,
  // Cafe form state
  newCafeName,
  setNewCafeName,
  newCafeStyle,
  setNewCafeStyle,
  newCafeAddress,
  setNewCafeAddress,
  newCafeLat,
  setNewCafeLat,
  newCafeLng,
  setNewCafeLng,
  newCafeMinPrice,
  setNewCafeMinPrice,
  newCafeMaxPrice,
  setNewCafeMaxPrice,
  newCafeOpeningTime,
  setNewCafeOpeningTime,
  newCafeClosingTime,
  setNewCafeClosingTime,
  newCafeImageUrl,
  setNewCafeImageUrl,
  handleCafeFormSubmit,
}) {
  return (
    <>
      {/* TAB: Cafes Manager */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-outfit text-lg font-extrabold text-gray-900">
            {language === 'vi' ? 'Quản lý Cà phê Hội An' : 'Hoi An Cafes Directory'}
          </h3>
          <button
            type="button"
            onClick={handleAddCafeClick}
            className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
          >
            <Plus className="w-4 h-4" />
            {language === 'vi' ? 'Đăng ký Quán mới' : 'Register New Cafe'}
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={cafeSearchTerm}
              onChange={(e) => { setCafeSearchTerm(e.target.value); setCurrentCafePage(1); }}
              placeholder={language === 'vi' ? '🔍 Tìm quán cà phê, phong cách...' : '🔍 Search cafe by name, style...'}
              className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
            />
          </div>
          <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            {language === 'vi' ? `Tìm thấy: ${filteredCafes.length} / ${cafes.length} quán` : `Found: ${filteredCafes.length} / ${cafes.length} cafes`}
          </div>
        </div>

        {filteredCafes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <span className="text-3xl block mb-2">☕</span>
            <p className="text-gray-500 font-bold text-xs">
              {language === 'vi' ? 'Không có quán cà phê nào phù hợp!' : 'No matching cafe data available!'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                    <th className="p-4">{language === 'vi' ? 'Tên quán' : 'Cafe Name'}</th>
                    <th className="p-4">{language === 'vi' ? 'Phong cách' : 'Style'}</th>
                    <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                    <th className="p-4">{language === 'vi' ? 'Khoảng giá' : 'Price Range'}</th>
                    <th className="p-4">{language === 'vi' ? 'Giờ hoạt động' : 'Hours'}</th>
                    <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {currentCafes.map((cafe) => (
                    <tr key={cafe.id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={cafe.imageUrl} alt={cafe.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <span className="font-bold text-gray-900 text-sm">{cafe.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-amber-50 text-heritage-amber rounded-lg font-bold text-[10px] border border-amber-100">
                          {cafe.style || '—'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 truncate max-w-xs" title={cafe.address}>{cafe.address}</td>
                      <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                        {cafe.minPrice > 0 || cafe.maxPrice > 0 ? (
                          `${cafe.minPrice.toLocaleString()}đ - ${cafe.maxPrice.toLocaleString()}đ`
                        ) : (language === 'vi' ? 'Liên hệ' : 'Contact')}
                      </td>
                      <td className="p-4 text-gray-400 whitespace-nowrap">
                        🕒 {cafe.openingTime?.substring(0, 5) || '07:00'} - {cafe.closingTime?.substring(0, 5) || '22:00'}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditCafeClick(cafe)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                          title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCafe(cafe.id)}
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
            {totalCafePages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  {language === 'vi'
                    ? `Hiển thị quán ${indexOfFirstCafe + 1} - ${Math.min(indexOfLastCafe, filteredCafes.length)} trong tổng số ${filteredCafes.length} quán`
                    : `Showing ${indexOfFirstCafe + 1} - ${Math.min(indexOfLastCafe, filteredCafes.length)} of ${filteredCafes.length} cafes`}
                </div>
                <div className="flex gap-1.5 items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentCafePage(prev => Math.max(prev - 1, 1))}
                    disabled={currentCafePage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {language === 'vi' ? 'Trước' : 'Prev'}
                  </button>
                  {Array.from({ length: totalCafePages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentCafePage(p)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                        currentCafePage === p
                          ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentCafePage(prev => Math.min(prev + 1, totalCafePages))}
                    disabled={currentCafePage === totalCafePages}
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

      {/* Cafes CRUD Modal */}
      {showAddCafeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleCafeFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddCafeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {isCafeEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa quán Cà phê' : '📝 Edit Specialty Cafe')
                : (language === 'vi' ? '✨ Đăng ký quán Cà phê mới' : '✨ Register New Specialty Cafe')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Cafe Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin Quán' : 'Cafe Information'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên quán' : 'Cafe Name'}
                    </label>
                    <input
                      type="text"
                      value={newCafeName}
                      onChange={(e) => setNewCafeName(e.target.value)}
                      placeholder={language === 'vi' ? 'FeFe Coffee' : 'FeFe Coffee'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Phong cách' : 'Style'}
                    </label>
                    <input
                      type="text"
                      value={newCafeStyle}
                      onChange={(e) => setNewCafeStyle(e.target.value)}
                      placeholder={language === 'vi' ? 'Chill & Thư giãn' : 'Chill & Relax'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                <AddressDropdown
                  value={newCafeAddress}
                  onChange={setNewCafeAddress}
                  addresses={cafeAddresses}
                  filterByOperating={false}
                  placeholder={language === 'vi' ? 'Chọn hoặc nhập địa chỉ...' : 'Select or enter address...'}
                  label={language === 'vi' ? 'Địa chỉ' : 'Address'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newCafeMinPrice}
                      onChange={(e) => setNewCafeMinPrice(e.target.value)}
                      placeholder="45000"
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
                      value={newCafeMaxPrice}
                      onChange={(e) => setNewCafeMaxPrice(e.target.value)}
                      placeholder="45000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ mở cửa' : 'Opening Time'}
                    </label>
                    <input
                      type="time"
                      value={newCafeOpeningTime}
                      onChange={(e) => setNewCafeOpeningTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ đóng cửa' : 'Closing Time'}
                    </label>
                    <input
                      type="time"
                      value={newCafeClosingTime}
                      onChange={(e) => setNewCafeClosingTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Cafe Image & Location */}
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
                    value={newCafeImageUrl}
                    onChange={(e) => setNewCafeImageUrl(e.target.value)}
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
                      value={newCafeLat}
                      onChange={(e) => setNewCafeLat(e.target.value)}
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
                      value={newCafeLng}
                      onChange={(e) => setNewCafeLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newCafeLat && newCafeLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newCafeLat)}
                      lng={Number(newCafeLng)}
                      name={newCafeName}
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
                onClick={() => setShowAddCafeModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isCafeEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu quán cà phê' : 'Save Cafe')}
              </button>
            </div>

          </form>
        </div>
      )}
    </>
  );
}
