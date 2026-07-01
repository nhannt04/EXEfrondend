import React from 'react';
import { Compass, Users, BookOpen, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import anImg from '../assets/An.jpg';
import chauImg from '../assets/châu.jpg';
import hanImg from '../assets/hân.jpg';
import linhImg from '../assets/linh.jpg';
import luongImg from '../assets/lương.jpg';
import nhanImg from '../assets/nhân.jpg';
import aboutUsBg from '../assets/aboutus.jpg';
import lenKeHoachImg from '../assets/lên kế hoạch.png';
import ketNoiImg from '../assets/kết nối.jpg';
import luuGiuImg from '../assets/lưu giữ .png';

export default function AboutUs() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-0 flex flex-col items-center justify-start py-0 px-0 heritage-pattern overflow-x-hidden w-full">
      {/* Main Content Glass Card - Hidden on Mobile */}
      <div
        className="hidden md:flex w-full relative overflow-hidden shimmer-trigger py-20 px-4 sm:px-6 lg:px-8 items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url(${aboutUsBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          aspectRatio: '16/7',
          minHeight: 'auto',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] z-0" />

        {/* Mission Section */}
        <div className="space-y-6 relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center h-full">
          <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center justify-center gap-2 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-bounce-in" />
            {t('aboutMission')}
          </h2>
          <p className="text-4xl sm:text-5xl font-black text-white leading-tight font-outfit drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] max-w-4xl">
            "{t('aboutMissionDesc')}"
          </p>
          
          <div className="w-24 h-1 bg-amber-400/80 my-3 rounded-full drop-shadow" />

          {/* Description Paragraph */}
          <p className="text-lg sm:text-xl text-white/95 leading-relaxed font-bold max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {t('aboutParagraph')}
          </p>
        </div>
      </div>

      {/* Padded Container for subsequent sections */}
      <div className="max-w-[95%] sm:max-w-[90%] w-full px-4 sm:px-8 lg:px-12 py-12 space-y-12 animate-page-enter">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Smart Planning */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col md:flex-row items-center md:items-start gap-5 glow-amber">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-heritage-amber/5 flex-shrink-0 flex items-center justify-center shadow-sm">
              <img src={lenKeHoachImg} alt="Lên kế hoạch" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-center md:text-left space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900 leading-snug">{t('aboutCardTitlePlan')}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-semibold">{t('aboutCardDescPlan')}</p>
            </div>
          </div>

          {/* Card 2: Community Connection */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col md:flex-row items-center md:items-start gap-5 glow-amber">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-blue-50 flex-shrink-0 flex items-center justify-center shadow-sm">
              <img src={ketNoiImg} alt="Kết nối cộng đồng" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-center md:text-left space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900 leading-snug">{t('aboutCardTitleCommunity')}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-semibold">{t('aboutCardDescCommunity')}</p>
            </div>
          </div>

          {/* Card 3: Preserve Memories */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col md:flex-row items-center md:items-start gap-5 glow-amber">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-blue-50 flex-shrink-0 flex items-center justify-center shadow-sm">
              <img src={luuGiuImg} alt="Lưu giữ kỷ niệm" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-center md:text-left space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900 leading-snug">{t('aboutCardTitlePreserve')}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-semibold">{t('aboutCardDescPreserve')}</p>
            </div>
          </div>
        </div>

        {/* Horizontal Divider - Hidden on Mobile */}
        <hr className="hidden md:block border-gray-200/85 my-6" />

        {/* Development Team Section */}
        <div className="space-y-8 w-full">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-outfit uppercase">
              {language === 'vi' ? 'Đội Ngũ Phát Triển' : 'Development Team'}
            </h2>
            <div className="w-12 h-1 bg-heritage-amber mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {[
              {
                name: 'Đặng Đức Lương',
                role: 'Team Leader',
                desc: 'Điều phối dự án, phát triển Trợ lý ảo AI Travelist & đề xuất lộ trình thông minh.',
                avatar: luongImg,
                fbLink: 'https://www.facebook.com/luongdang2201'
              },
              {
                name: 'Phạm Nhật Bảo Hảo Hân',
                role: 'Marketing Team',
                desc: 'Thiết kế giao diện người dùng, thu thập dữ liệu trải nghiệm người dùng & bản đồ GPS.',
                avatar: hanImg,
                fbLink: 'https://www.facebook.com/bao.han.87599'
              },
              {
                name: 'Lữ Lê Thuỳ Linh',
                role: 'Marketing Team',
                desc: 'Định hướng sản phẩm, tối ưu trải nghiệm và thu thập dữ liệu nội dung số.',
                avatar: linhImg,
                fbLink: 'https://www.facebook.com/lule.thuylinh'
              },
              {
                name: 'Dương Thị Ngọc Châu',
                role: 'Marketing Team',
                desc: 'Đảm bảo chất lượng hệ thống, thu thập & biên soạn nội dung di sản.',
                avatar: chauImg,
                fbLink: 'https://www.facebook.com/ngoc.chau.913780'
              },
              {
                name: 'Nguyễn Thành Nhân',
                role: 'IT Team',
                desc: 'Kiến trúc hệ thống, Neon DB, Backend API & Frontend.',
                avatar: nhanImg,
                fbLink: 'https://www.facebook.com/nguyen.thanh.nhan.070704'
              },
              {
                name: 'Nguyễn Văn An',
                role: 'IT Team',
                desc: 'Phát triển API dịch vụ, bảo mật hệ thống & tích hợp dữ liệu.',
                avatar: anImg,
                fbLink: 'https://www.facebook.com/michaelht271'
              }
            ].map((member, i) => (
              <a 
                href={member.fbLink}
                target="_blank"
                rel="noopener noreferrer"
                key={i} 
                className="glass-panel p-4 rounded-xl flex flex-col items-center text-center space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-heritage-amber/10 transition-all duration-300 no-underline cursor-pointer group w-full"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-heritage-amber/30 p-1 group-hover:scale-105 group-hover:border-heritage-amber transition-all duration-300"
                />
                <div>
                  <h4 className="font-outfit font-bold text-gray-900 text-xs md:text-sm lg:text-base leading-tight">{member.name}</h4>
                  <span className="text-[9px] md:text-xs text-blue-600 font-semibold">{member.role}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-semibold group-hover:text-gray-700 transition-colors">
                  {language === 'vi' ? member.desc : member.role}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
