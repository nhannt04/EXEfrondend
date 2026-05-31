import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Grid, Globe, Menu, X, LogIn, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import authService from '../../services/authService';

export default function Header({ activeTab, setActiveTab, currentUser, onOpenAuth }) {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Detect scroll to enhance header shadow depth
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await authService.updateAvatar(currentUser.id, file);
      if (response && response.success) {
        alert(language === 'vi' ? "Cập nhật ảnh đại diện thành công!" : "Avatar updated successfully!");
        setDropdownOpen(false);
      } else {
        alert(language === 'vi' ? "Không thể cập nhật ảnh đại diện!" : "Failed to update avatar!");
      }
    } catch (err) {
      console.error(err);
      alert(language === 'vi' ? "Đã xảy ra lỗi khi cập nhật ảnh đại diện!" : "An error occurred while updating avatar!");
    }
  };

  const navItems = [
    { id: 'home', label: t('home'), icon: null },
    { id: 'planner', label: t('aiPlanner'), icon: Sparkles },
    { id: 'social', label: t('community'), icon: Grid },
    ...(currentUser?.role === 'ADMIN' ? [{ id: 'admin', label: language === 'vi' ? 'Quản trị' : 'Admin', icon: ShieldAlert }] : [])
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-dark-border px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 backdrop-blur-md shadow-md shadow-black/5'
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-100/80'
      }`}
      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => setActiveTab('home')}
      >
        <div className="bg-heritage-amber p-2 rounded-xl text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-heritage-amber/30">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <span className="font-outfit text-xl font-bold tracking-tight text-gray-900 group-hover:text-heritage-amber transition-colors duration-300">
            Travel<span className="text-heritage-amber">ist</span>
          </span>
          <span className="block text-[9px] text-gray-400 font-medium tracking-widest uppercase leading-none mt-0.5">
            Your Journey, Your Stories
          </span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/60 backdrop-blur-sm">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative px-5 py-2 rounded-full font-medium text-sm flex items-center gap-1.5 transition-all duration-300 cursor-pointer border-none ${activeTab === id
                ? 'bg-heritage-amber text-white shadow-md shadow-heritage-amber/20 font-semibold scale-[1.02]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/60 bg-transparent'
              }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${activeTab === id ? 'animate-spin-slow' : ''}`} />}
            {label}
            {/* Active dot indicator */}
            {activeTab === id && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80 animate-bounce-in" />
            )}
          </button>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggler */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-heritage-amber hover:bg-heritage-amber/5 hover:text-heritage-amber text-gray-500 text-xs font-bold transition-all duration-300 bg-white cursor-pointer shadow-sm group"
        >
          <Globe className="w-3.5 h-3.5 text-heritage-gold group-hover:rotate-180 transition-transform duration-500" />
          <span>{language === 'vi' ? 'VI' : 'EN'}</span>
        </button>

        {currentUser ? (
          <div className="relative flex items-center gap-3">
            {/* User Info */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900">{currentUser.fullName}</span>
              <span className="text-[10px] text-ricefield-green font-bold">
                {currentUser.role === 'ADMIN' ? (language === 'vi' ? 'Quản trị viên' : 'Administrator') : t('localMember')}
              </span>
            </div>

            {/* Avatar with dropdown trigger */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-heritage-amber via-heritage-gold to-ricefield-green animate-pulse-gold cursor-pointer group"
            >
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-2 border-white group-hover:scale-105 transition-transform duration-300"
              />

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-11 w-48 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 z-50 animate-scale-up"
                >
                  <div className="px-4 py-2 border-b border-gray-100 flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] text-gray-400 truncate">{currentUser.email}</span>
                  </div>
                  {/* Upload Avatar Label Trigger */}
                  <label className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-bold transition-all border-none bg-transparent m-0 select-none">
                    <UserIcon className="w-4 h-4 text-heritage-amber" />
                    <span>{language === 'vi' ? 'Đổi ảnh đại diện' : 'Change Avatar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      authService.logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-none bg-transparent cursor-pointer font-bold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Đăng xuất' : 'Log out'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold transition-all duration-300 shadow-md shadow-heritage-amber/15 cursor-pointer border-none scale-95 hover:scale-100"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Đăng nhập' : 'Log in'}</span>
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-heritage-amber hover:border-heritage-amber transition-all duration-300 bg-white cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-b border-gray-200 shadow-xl animate-fade-in-up p-4 flex flex-col gap-2 z-50">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setMobileOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer border-none text-left ${activeTab === id
                  ? 'bg-heritage-amber/10 text-heritage-amber font-bold border border-heritage-amber/20'
                  : 'text-gray-600 hover:bg-gray-50 bg-transparent'
                }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
