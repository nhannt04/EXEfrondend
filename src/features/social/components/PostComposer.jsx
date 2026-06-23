import React from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';

export default function PostComposer({
  currentUser,
  language,
  t,
  completedItineraries,
  selectedItineraryId,
  setSelectedItineraryId,
  spotsForSelectedItinerary,
  postLinkedSpot,
  setPostLinkedSpot,
  postedSpotIds,
  newPostText,
  setNewPostText,
  selectedImage,
  setSelectedImage,
  imagePreview,
  setImagePreview,
  handleImageChange,
  handleCreatePost,
}) {
  return (
    <form
      onSubmit={handleCreatePost}
      className="bg-gradient-to-tr from-white to-blue-50/40 border border-heritage-gold/20 p-4 sm:p-5 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden shimmer-trigger animate-fade-in-up [animation-delay:100ms]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-amber/5 rounded-full blur-3xl" />

      <div className="flex gap-3 relative z-10">
        <img
          src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
          alt="My Avatar"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-heritage-amber"
        />
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder={t('postPlaceholder')}
          className="flex-grow bg-white/80 border border-gray-200 text-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-heritage-amber resize-none h-20 placeholder-gray-400 shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 border border-gray-150 p-3 rounded-xl relative z-10">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">
            {language === 'vi' ? 'Lịch trình đã hoàn thành' : 'Completed Itinerary'}
          </label>
          <select
            value={selectedItineraryId || ''}
            onChange={(e) => {
              setSelectedItineraryId(e.target.value ? Number(e.target.value) : null);
              setPostLinkedSpot(null);
            }}
            className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
            required
          >
            <option value="">{language === 'vi' ? '-- Chọn lịch trình --' : '-- Select itinerary --'}</option>
            {completedItineraries.map((it) => (
              <option key={it.id} value={it.id}>
                📍 {it.title} ({it.destination})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">
            {language === 'vi' ? 'Chọn Địa điểm đã đi' : 'Select Visited Spot'}
          </label>
          <select
            value={postLinkedSpot || ''}
            onChange={(e) => setPostLinkedSpot(e.target.value ? Number(e.target.value) : null)}
            className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
            disabled={!selectedItineraryId}
            required
          >
            <option value="">{language === 'vi' ? '-- Chọn địa điểm --' : '-- Select spot --'}</option>
            {spotsForSelectedItinerary.map((s) => {
              const isPosted = postedSpotIds.includes(s.id);
              const name = s.name?.[language] || s.nameVi || s.nameEn || s.name;
              return (
                <option key={s.id} value={s.id} disabled={isPosted}>
                  {name} {isPosted ? `(${language === 'vi' ? 'Đã đánh giá' : 'Reviewed'})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {imagePreview && (
        <div className="relative w-32 h-20 border border-gray-150 rounded-xl overflow-hidden shadow-inner group z-10 animate-scale-up">
          <img src={imagePreview} alt={language === 'vi' ? 'Ảnh xem trước bài viết' : 'Post preview'} className="w-full h-full object-cover animate-fade-in" />
          <button
            type="button"
            onClick={() => { setSelectedImage(null); setImagePreview(''); }}
            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-all cursor-pointer border-none flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-gray-100 pt-3 relative z-10">
        <div className="flex gap-2 flex-wrap">
          <label className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer bg-white border-none flex items-center justify-center select-none">
            <ImageIcon className="w-5 h-5 text-ricefield-green" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <button type="button" className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer bg-white border-none">
            <Smile className="w-5 h-5 text-heritage-amber" />
          </button>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none shadow-md shadow-heritage-amber/10 hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
        >
          <Send className="w-3.5 h-3.5" />
          {t('postButton')}
        </button>
      </div>
    </form>
  );
}
