import React from 'react';
import { Compass, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-white border-t border-dark-border mt-16 px-8 py-12 text-gray-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-heritage-amber p-1.5 rounded-lg text-white">
              <Compass className="w-5 h-5" />
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
        <div>
          <h4 className="font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            {t('footerColHeader1')}
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink1')}</a></li>
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink2')}</a></li>
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink3')}</a></li>
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink4')}</a></li>
          </ul>
        </div>

        {/* AI Features */}
        <div>
          <h4 className="font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            {t('footerColHeader2')}
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink5')}</a></li>
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink6')}</a></li>
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink7')}</a></li>
            <li><a href="#" className="hover:text-heritage-amber transition-colors">{t('footerLink8')}</a></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            {t('footerColHeader3')}
          </h4>
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

      <div className="max-w-7xl mx-auto border-t border-dark-border mt-10 pt-6 text-center text-xs text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>{t('footerCopyright')}</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-heritage-amber transition-colors hover:underline">Điều khoản</a>
          <a href="#" className="hover:text-heritage-amber transition-colors hover:underline">Bảo mật</a>
        </div>
      </div>
    </footer>
  );
}
