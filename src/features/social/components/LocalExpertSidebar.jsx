import React from 'react';
import { MessageSquare, Trophy, UserCheck, Flame, Hash, Award } from 'lucide-react';

export default function LocalExpertSidebar({
  language,
  t,
  experts,
  handleOpenExpertChat,
  getTrendingHashtags,
  activeHashtagFilter,
  setActiveHashtagFilter,
  showQuestSuccess,
  setShowQuestSuccess,
}) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">

      {/* Daily Cultural Quest Card with Shimmer trigger */}
      <div className="bg-gradient-to-tr from-blue-500 to-heritage-amber text-white p-5 rounded-3xl shadow-lg shadow-heritage-amber/10 flex flex-col gap-4 relative overflow-hidden shimmer-trigger animate-fade-in-up [animation-delay:200ms]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

        <div className="flex items-center gap-2 border-b border-white/20 pb-2.5 relative z-10">
          <div className="bg-white/20 p-2 rounded-xl text-white animate-float">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-outfit text-sm font-extrabold text-white tracking-wide uppercase">
            {t('challengeTitle')}
          </h3>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <p className="text-[12px] text-white/95 leading-relaxed font-semibold">
            "{t('challengeQuest')}"
          </p>
          <div className="bg-white/15 border border-white/10 p-3 rounded-2xl mt-1 flex flex-col gap-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-white/80">{language === 'vi' ? 'Phần thưởng' : 'Reward'}:</span>
            <span className="text-[10.5px] font-bold text-blue-100">{t('challengeReward')}</span>
          </div>
        </div>

        <button
          onClick={() => setShowQuestSuccess(true)}
          className="w-full py-2.5 bg-white hover:bg-gray-50 text-heritage-amber font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer border-none relative z-10"
        >
          <Award className="w-4 h-4 animate-bounce" />
          {t('participate')}
        </button>
      </div>

      {/* Featured Local Experts Spotlight */}
      <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger animate-fade-in-up [animation-delay:300ms]">
        <h3 className="font-outfit text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-1.5 relative z-10">
          <UserCheck className="w-4 h-4 text-heritage-amber" />
          {t('localExperts')}
        </h3>

        <div className="flex flex-col gap-4 relative z-10">
          {experts.map((expert, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-heritage-gold/20 hover:-translate-y-0.5 transition-all duration-300">
              <div className="relative">
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                {expert.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-xs font-bold text-gray-800 truncate leading-tight">{expert.name}</h4>
                <span className="text-[10.5px] text-gray-400 block truncate mt-0.5">{expert.role[language]}</span>
              </div>
              <button
                onClick={() => handleOpenExpertChat(expert)}
                className="p-2 bg-white hover:bg-heritage-amber/10 border border-gray-200 hover:border-heritage-amber text-gray-500 hover:text-heritage-amber rounded-lg transition-colors cursor-pointer"
                title={t('askExpert')}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Trending Hashtags */}
      <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger animate-fade-in-up [animation-delay:400ms]">
        <h3 className="font-outfit text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-1.5 relative z-10">
          <Flame className="w-4 h-4 text-blue-500" />
          {t('trendingHashtags')}
        </h3>

        <div className="flex flex-col gap-3 relative z-10">
          {getTrendingHashtags().map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveHashtagFilter(item.tag)}
              className="flex justify-between items-center text-xs group cursor-pointer hover:translate-x-0.5 transition-transform duration-200"
            >
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-400 group-hover:text-heritage-amber transition-colors" />
                <span className="font-bold text-gray-700 group-hover:text-heritage-amber transition-colors">{item.tag}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-semibold">{item.likes ?? 0} likes</span>
                {idx === 0 && (
                  <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1 rounded font-bold uppercase scale-90">Hot</span>
                )}
                {idx > 0 && idx < 3 && (
                  <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1 rounded font-bold uppercase scale-90">Rising</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
