import React, { useState } from 'react';
import { Compass, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import logoImg from '../../assets/logo.jpg';

export default function Footer() {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="w-full bg-white border-t border-dark-border mt-16 px-8 py-12 text-gray-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
        {/* Brand section */}
        <div className="flex flex-col gap-4 mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200/80 shadow-md">
              <img src={logoImg} alt="Travelist Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-gray-900">
              Travel<span className="text-heritage-amber">ist</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            {t('footerBrandDesc')}
          </p>
        </div>

        {/* Categories */}
        <div className="border-b border-gray-100 pb-3 md:pb-0 md:border-none">
          <button 
            onClick={() => toggleSection('discover')}
            className="w-full flex justify-between items-center font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider md:cursor-auto cursor-pointer bg-transparent border-none p-0 group"
          >
            <span className="md:group-hover:text-gray-900 group-hover:text-heritage-amber transition-colors">{t('footerColHeader1')}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 md:hidden ${openSection === 'discover' ? 'rotate-180 text-heritage-amber' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out md:max-h-[500px] md:opacity-100 md:mt-4 ${openSection === 'discover' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink1')}</a></li>
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink2')}</a></li>
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink3')}</a></li>
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink4')}</a></li>
            </ul>
          </div>
        </div>

        {/* AI Features */}
        <div className="border-b border-gray-100 pb-3 md:pb-0 md:border-none">
          <button 
            onClick={() => toggleSection('tech')}
            className="w-full flex justify-between items-center font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider md:cursor-auto cursor-pointer bg-transparent border-none p-0 group"
          >
            <span className="md:group-hover:text-gray-900 group-hover:text-heritage-amber transition-colors">{t('footerColHeader2')}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 md:hidden ${openSection === 'tech' ? 'rotate-180 text-heritage-amber' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out md:max-h-[500px] md:opacity-100 md:mt-4 ${openSection === 'tech' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink5')}</a></li>
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink6')}</a></li>
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink7')}</a></li>
              <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink8')}</a></li>
            </ul>
          </div>
        </div>

        {/* Contact info */}
        <div className="border-b border-gray-100 pb-3 md:pb-0 md:border-none">
          <button 
            onClick={() => toggleSection('contact')}
            className="w-full flex justify-between items-center font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider md:cursor-auto cursor-pointer bg-transparent border-none p-0 group"
          >
            <span className="md:group-hover:text-gray-900 group-hover:text-heritage-amber transition-colors">{t('footerColHeader3')}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 md:hidden ${openSection === 'contact' ? 'rotate-180 text-heritage-amber' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out md:max-h-[500px] md:opacity-100 md:mt-4 ${openSection === 'contact' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-heritage-amber flex-shrink-0" />
                <span>Phố cổ Hội An, Quảng Nam, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-heritage-amber flex-shrink-0" />
                <span>+84 (0) 905 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-heritage-amber flex-shrink-0" />
                <span>contact@travelist-hoian.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-dark-border mt-8 pt-6 text-center text-xs text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>{t('footerCopyright')}</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-heritage-amber transition-colors hover:underline">Điều khoản</a>
          <a href="#" className="hover:text-heritage-amber transition-colors hover:underline">Bảo mật</a>
        </div>
      </div>
    </footer>
  );
}
