import React from 'react';
import { X, Check, RefreshCw } from 'lucide-react';

/**
 * TripSaveModal
 * Modal dialog that prompts the user to name their itinerary before saving.
 *
 * Props:
 *  showSaveModal     – boolean, controls visibility
 *  setShowSaveModal  – setter to close the modal
 *  tripTitle         – current value of the title input
 *  setTripTitle      – setter for the title input
 *  language          – current UI language ('vi' | 'en')
 *  t                 – translation function (unused currently but kept for parity)
 *  handleSaveItinerary – async callback that performs the save
 *  isSaving          – boolean, true while save request is in-flight
 */
export default function TripSaveModal({
  showSaveModal,
  setShowSaveModal,
  tripTitle,
  setTripTitle,
  language,
  t,
  handleSaveItinerary,
  isSaving,
}) {
  if (!showSaveModal) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 w-full max-w-md rounded-3xl p-6 flex flex-col gap-5 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h4 className="font-outfit text-base font-extrabold text-gray-900 flex items-center gap-2">
            💾 {language === 'vi' ? 'Đặt tên lịch trình' : 'Name Your Itinerary'}
          </h4>
          <button
            onClick={() => setShowSaveModal(false)}
            className="p-1 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {language === 'vi' ? 'Tên chuyến đi của bạn' : 'Your Journey Name'}
          </label>
          <input
            type="text"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            placeholder={language === 'vi' ? 'Ví dụ: Kỷ niệm Hội An 3 Ngày Chữa Lành' : 'e.g. Beautiful Hoi An healing days'}
            className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber font-semibold text-gray-800"
          />
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={() => setShowSaveModal(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-650 font-bold text-xs rounded-xl border-none cursor-pointer transition-colors"
          >
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            onClick={handleSaveItinerary}
            disabled={isSaving}
            className="px-4 py-2 bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {language === 'vi' ? 'Lưu ngay' : 'Save now'}
          </button>
        </div>
      </div>
    </div>
  );
}
