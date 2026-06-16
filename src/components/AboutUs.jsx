import React from 'react';
import { Compass, Users, BookOpen, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import anImg from '../assets/An.jpg';
import chauImg from '../assets/châu.jpg';
import hanImg from '../assets/hân.jpg';
import linhImg from '../assets/linh.jpg';
import luongImg from '../assets/lương.jpg';
import nhanImg from '../assets/nhân.jpg';

export default function AboutUs() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 heritage-pattern">
      <div className="max-w-full w-full px-4 md:px-8 lg:px-16 space-y-10 animate-page-enter">

        {/* Title and Hero Badge */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-heritage-amber/10 border border-heritage-amber/20 text-heritage-amber text-xs font-semibold uppercase tracking-wider animate-pulse-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Travelist Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 font-outfit">
            {t('aboutTitle')}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-heritage-amber to-heritage-gold mx-auto rounded-full mt-4" />
        </div>

        {/* Main Content Glass Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl space-y-8 shadow-xl relative overflow-hidden shimmer-trigger">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-amber/5 rounded-full blur-3xl -mr-16 -mt-16" />

          {/* Mission Section */}
          <div className="space-y-3 relative z-10">
            <h2 className="text-lg font-bold text-heritage-amber flex items-center gap-2 uppercase tracking-wide">
              <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-bounce-in" />
              {t('aboutMission')}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight font-outfit">
              "{t('aboutMissionDesc')}"
            </p>
          </div>

          <hr className="border-gray-150/80" />

          {/* Description Paragraph */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal relative z-10">
            {t('aboutParagraph')}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Smart Planning */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-start space-y-4 glow-amber">
            <div className="p-3 bg-heritage-amber/10 rounded-xl text-heritage-amber">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('aboutCardTitlePlan')}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{t('aboutCardDescPlan')}</p>
          </div>

          {/* Card 2: Community Connection */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-start space-y-4 glow-amber">
            <div className="p-3 bg-blue-50 rounded-xl text-heritage-gold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('aboutCardTitleCommunity')}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{t('aboutCardDescCommunity')}</p>
          </div>

          {/* Card 3: Preserve Memories */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col items-start space-y-4 glow-amber">
            <div className="p-3 bg-blue-50 rounded-xl text-ricefield-light">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('aboutCardTitlePreserve')}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{t('aboutCardDescPreserve')}</p>
          </div>
        </div>

        {/* Horizontal Divider */}
        <hr className="border-gray-200/85 my-12" />

        {/* Development Team Section */}
        <div className="space-y-8 animate-page-enter [animation-delay:300ms]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-outfit">
              {language === 'vi' ? 'Đội Ngũ Phát Triển' : 'Development Team'}
            </h2>
            <div className="w-12 h-1 bg-heritage-amber mx-auto rounded-full mt-2" />
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              {language === 'vi'
                ? 'Những thành viên tâm huyết kiến tạo nên nền tảng số hóa di sản và du lịch thông minh.'
                : 'The passionate members building the smart heritage and digital tourism platform.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[

              {
                name: 'Đặng Đức Lương',
                role: 'Team Leader',
                desc: 'Điều phối dự án, phát triển Trợ lý ảo AI Travelist & đề xuất lộ trình thông minh.',
                avatar: luongImg
              },
              {
                name: 'Phạm Nhật Bảo Hân',
                role: 'Marketing Team',
                desc: 'Thiết kế giao diện người dùng, thu thập dữ liệu trải nghiệm người dùng & bản đồ GPS.',
                avatar: hanImg
              },
              {
                name: 'Lữ Lê Thuỳ Linh',
                role: 'Marketing Team',
                desc: 'Định hướng sản phẩm, tối ưu trải nghiệm và thu thập dữ liệu nội dung số.',
                avatar: linhImg
              },
              {
                name: 'Dương Thị Ngọc Châu',
                role: 'Marketing Team',
                desc: 'Đảm bảo chất lượng hệ thống, thu thập & biên soạn nội dung di sản.',
                avatar: chauImg
              },
              {
                name: 'Nguyễn Thành Nhân',
                role: 'IT Team',
                desc: 'Kiến trúc hệ thống, Neon DB, Backend API & Frontend.',
                avatar: nhanImg
              },
              {
                name: 'Nguyễn Văn An',
                role: 'IT Team',
                desc: 'Phát triển API dịch vụ, bảo mật hệ thống & tích hợp dữ liệu.',
                avatar: anImg
              }

            ].map((member, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all duration-300">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-heritage-amber/30 p-1"
                />
                <div>
                  <h4 className="font-outfit font-bold text-gray-900">{member.name}</h4>
                  <span className="text-xs text-heritage-amber font-semibold">{member.role}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {language === 'vi' ? member.desc : member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
