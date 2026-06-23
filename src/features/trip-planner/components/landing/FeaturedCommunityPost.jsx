import React from 'react';
import { MapPin, ThumbsUp } from 'lucide-react';

export default function FeaturedCommunityPost({
  featuredCommunityPost,
  language,
  setActiveTab,
}) {
  if (!featuredCommunityPost) return null;

  return (
    <>
      {/* Rectangular divider section title for Featured Community Post */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-8 mt-4 scroll-reveal">
        <div className="w-full py-5 px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-6 shadow-sm">
          <div className="h-[1px] bg-gray-300 flex-grow" />
          <span className="font-outfit text-[clamp(0.875rem,3.5vw,1.125rem)] font-black text-gray-800 uppercase tracking-widest text-center px-4">
            {language === 'vi' ? 'Bài viết cộng đồng nổi bật nhất' : 'Most Outstanding Community Post'}
          </span>
          <div className="h-[1px] bg-gray-300 flex-grow" />
        </div>
      </div>

      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-16 flex justify-center animate-fade-in scroll-reveal">
        <div className="w-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
          
          {/* Image (Left side on desktop if exists) */}
          {featuredCommunityPost.imageUrl && (
            <div className="w-full md:w-1/2 h-56 sm:h-64 md:h-72 overflow-hidden rounded-2xl border border-gray-150 bg-gray-50 flex-shrink-0">
              <img
                src={featuredCommunityPost.imageUrl}
                alt="Post Attachment"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          )}

          {/* Content & Info (Right side on desktop) */}
          <div className={`w-full ${featuredCommunityPost.imageUrl ? 'md:w-1/2' : ''} flex flex-col justify-between gap-5`}>
            <div className="flex flex-col gap-4">
              {/* Author info */}
              <div className="flex items-center gap-3">
                <img
                  src={featuredCommunityPost.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-heritage-amber"
                />
                <div className="flex flex-col">
                  <span className="font-outfit text-sm font-black text-gray-900">
                    {featuredCommunityPost.user?.fullName || 'Traveler'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(featuredCommunityPost.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                  </span>
                </div>
                <span className="ml-auto bg-green-50 text-ricefield-green border border-ricefield-green/20 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {featuredCommunityPost.category === 'food'
                    ? (language === 'vi' ? 'Ẩm thực' : 'Food')
                    : featuredCommunityPost.category === 'adventure'
                      ? (language === 'vi' ? 'Trải nghiệm' : 'Adventure')
                      : featuredCommunityPost.category === 'scenic'
                        ? (language === 'vi' ? 'Sống ảo' : 'Scenic')
                        : (language === 'vi' ? 'Thư giãn' : 'Healing')
                  }
                </span>
              </div>

              {/* Content text */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                {language === 'vi' ? featuredCommunityPost.contentVi : featuredCommunityPost.contentEn}
              </p>

              {/* Linked Spot */}
              {featuredCommunityPost.spot && (
                <div className="flex flex-col gap-1 bg-gradient-to-r from-gray-50 to-blue-50/20 border border-gray-150 p-3 rounded-xl text-xs font-bold text-gray-750">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-heritage-amber animate-pulse" />
                    <span className="text-gray-400">{language === 'vi' ? 'Địa điểm' : 'Place'}:</span>
                    <span className="text-heritage-amber font-extrabold">
                      {language === 'vi' ? featuredCommunityPost.spot.nameVi : featuredCommunityPost.spot.nameEn}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 pl-5 font-semibold">
                    📍 {featuredCommunityPost.spot.address || (language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam')}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Display */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold text-gray-500 mt-2">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
                <ThumbsUp className="w-4 h-4 text-green-600 fill-green-600" />
                <span>{language === 'vi' ? 'Yêu thích nhất' : 'Most Popular'} ({featuredCommunityPost.likesCount || 0})</span>
              </div>
              <span className="text-[11px] text-heritage-amber hover:underline cursor-pointer font-bold" onClick={() => setActiveTab('social')}>
                {language === 'vi' ? 'Xem trên cộng đồng →' : 'View on Community →'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
