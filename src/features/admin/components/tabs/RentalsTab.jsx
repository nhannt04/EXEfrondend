import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import AddressDropdown from '@/components/AddressDropdown';
import LeafletMap from '../LeafletMap';

export default function RentalsTab(props) {
  const {
    language, rentals, filteredRentals, currentRentals, rentalSearchTerm, setRentalSearchTerm, setCurrentRentalPage, totalRentalPages, indexOfFirstRental, indexOfLastRental, currentRentalPage, handleAddRentalClick, handleEditRentalClick, handleDeleteRental, showAddRentalModal, setShowAddRentalModal, isRentalEditMode, handleRentalFormSubmit, newRentalType, setNewRentalType, newRentalName, setNewRentalName, rentalAddresses, newRentalAddress, setNewRentalAddress, newRentalLat, setNewRentalLat, newRentalLng, setNewRentalLng, newRentalMinPrice, setNewRentalMinPrice, newRentalMaxPrice, setNewRentalMaxPrice, newRentalOpeningTime, setNewRentalOpeningTime, newRentalClosingTime, setNewRentalClosingTime, newRentalImageUrl, setNewRentalImageUrl
  } = props;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-outfit text-lg font-extrabold text-gray-900">
            {language === 'vi' ? 'Quản lý Dịch vụ cho thuê Hội An' : 'Hoi An Rental Services Directory'}
          </h3>
          <button
            type="button"
            onClick={handleAddRentalClick}
            className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
          >
            <Plus className="w-4 h-4" />
            {language === 'vi' ? 'Đăng ký Dịch vụ cho thuê mới' : 'Register New Rental Service'}
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={rentalSearchTerm}
              onChange={(e) => { setRentalSearchTerm(e.target.value); setCurrentRentalPage(1); }}
              placeholder={language === 'vi' ? '🔍 Tìm dịch vụ cho thuê...' : '🔍 Search rentals...'}
              className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
            />
          </div>
          <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            {language === 'vi' ? `Tìm thấy: ${filteredRentals.length} / ${rentals.length} dịch vụ` : `Found: ${filteredRentals.length} / ${rentals.length} rentals`}
          </div>
        </div>

        {filteredRentals.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <span className="text-3xl block mb-2">🛵</span>
            <p className="text-gray-500 font-bold text-xs">
              {language === 'vi' ? 'Không có dịch vụ nào phù hợp!' : 'No matching rentals available!'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                  <th className="p-4">{language === 'vi' ? 'Tên dịch vụ' : 'Name'}</th>
                  <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Type'}</th>
                  <th className="p-4">{language === 'vi' ? 'Giờ mở cửa' : 'Operating Hours'}</th>
                  <th className="p-4">{language === 'vi' ? 'Giá tham khảo' : 'Price Range'}</th>
                  <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                  <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                {currentRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={rental.imageUrl} alt={rental.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                      <span className="font-bold text-gray-900 text-sm">{rental.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                        rental.type === 'Thuê máy ảnh' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          rental.type === 'Thuê đồ' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            rental.type === 'Thuê xe' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-cyan-50 text-cyan-600 border-cyan-100'
                      }`}>
                        {rental.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-semibold">
                      🕒 {rental.openingTime?.substring(0, 5) || '08:00'} - {rental.closingTime?.substring(0, 5) || '21:00'}
                    </td>
                    <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                      {rental.minPrice > 0 || rental.maxPrice > 0 ? (
                        `${rental.minPrice.toLocaleString()}đ - ${rental.maxPrice.toLocaleString()}đ`
                      ) : (language === 'vi' ? 'Liên hệ' : 'Contact')}
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate font-semibold" title={rental.address}>
                      {rental.address}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleEditRentalClick(rental)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                        title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRental(rental.id)}
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
            {totalRentalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  {language === 'vi'
                    ? `Hiển thị dịch vụ ${indexOfFirstRental + 1} - ${Math.min(indexOfLastRental, filteredRentals.length)} trong tổng số ${filteredRentals.length} dịch vụ`
                    : `Showing ${indexOfFirstRental + 1} - ${Math.min(indexOfLastRental, filteredRentals.length)} of ${filteredRentals.length} rentals`}
                </div>
                <div className="flex gap-1.5 items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentRentalPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentRentalPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {language === 'vi' ? 'Trước' : 'Prev'}
                  </button>
                  {Array.from({ length: totalRentalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentRentalPage(p)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                        currentRentalPage === p
                          ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentRentalPage(prev => Math.min(prev + 1, totalRentalPages))}
                    disabled={currentRentalPage === totalRentalPages}
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

      {showAddRentalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleRentalFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddRentalModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-b-gray-100">
              {isRentalEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Dịch vụ cho thuê' : '📝 Edit Rental Service')
                : (language === 'vi' ? '✨ Đăng ký Dịch vụ cho thuê mới' : '✨ Register New Rental Service')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin cơ bản' : 'Basic Info'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Phân loại' : 'Type'}
                    </label>
                    <select
                      value={newRentalType}
                      onChange={(e) => setNewRentalType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                    >
                      <option value="Thuê máy ảnh">{language === 'vi' ? 'Thuê máy ảnh' : 'Camera Rental'}</option>
                      <option value="Thuê đồ">{language === 'vi' ? 'Thuê đồ' : 'Outfit Rental'}</option>
                      <option value="Thuê xe">{language === 'vi' ? 'Thuê xe' : 'Motorbike Rental'}</option>
                      <option value="Photobooth">Photobooth</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên dịch vụ' : 'Service Name'}
                    </label>
                    <input
                      type="text"
                      value={newRentalName}
                      onChange={(e) => setNewRentalName(e.target.value)}
                      placeholder="SIN E-scooter Rental"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <AddressDropdown
                  value={newRentalAddress}
                  onChange={setNewRentalAddress}
                  addresses={rentalAddresses}
                  filterByOperating={false}
                  placeholder={language === 'vi' ? "Chọn hoặc nhập địa chỉ..." : "Select or enter address..."}
                  label={language === 'vi' ? 'Địa chỉ' : 'Address'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ mở cửa' : 'Opening Time'}
                    </label>
                    <input
                      type="time"
                      value={newRentalOpeningTime}
                      onChange={(e) => setNewRentalOpeningTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ đóng cửa' : 'Closing Time'}
                    </label>
                    <input
                      type="time"
                      value={newRentalClosingTime}
                      onChange={(e) => setNewRentalClosingTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newRentalMinPrice}
                      onChange={(e) => setNewRentalMinPrice(e.target.value)}
                      placeholder="150000"
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
                      value={newRentalMaxPrice}
                      onChange={(e) => setNewRentalMaxPrice(e.target.value)}
                      placeholder="150000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Image & Location */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Hình ảnh & Bản đồ định vị' : 'Image & Location'}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Đường dẫn ảnh trực tiếp' : 'Direct Image URL'}
                  </label>
                  <input
                    type="url"
                    value={newRentalImageUrl}
                    onChange={(e) => setNewRentalImageUrl(e.target.value)}
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
                      value={newRentalLat}
                      onChange={(e) => setNewRentalLat(e.target.value)}
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
                      value={newRentalLng}
                      onChange={(e) => setNewRentalLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newRentalLat && newRentalLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newRentalLat)}
                      lng={Number(newRentalLng)}
                      name={newRentalName}
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
                onClick={() => setShowAddRentalModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isRentalEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu dịch vụ' : 'Save Service')}
              </button>
            </div>

          </form>
        </div>
      )}
    </>
  );
}
