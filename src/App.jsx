import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import LandingPage from './features/trip-planner/components/LandingPage';
import TripPlannerStudio from './features/trip-planner/components/TripPlannerStudio';
import CommunityFeed from './features/social/components/CommunityFeed';
import AdminDashboard from './features/admin/components/AdminDashboard';
import AnalyticsDashboard from './features/admin/components/AnalyticsDashboard';
import ChatbotWidget from './features/chatbot/components/ChatbotWidget';
import Footer from './components/layout/Footer';
import AboutUs from './components/AboutUs';
import UserProfile from './components/profile/UserProfile';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import authService from './services/authService';
import AuthModal from './components/layout/AuthModal';
import axiosClient from "./services/axiosClient";

function AppContent() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [plannerPrefill, setPlannerPrefill] = useState(null);
  const [plannerTab, setPlannerTab] = useState('studio');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Listen for 401 unauthenticated errors caught by axiosClient
    const handleAuthRequired = () => {
      setIsAuthModalOpen(true);
    };

    // Listen for state changes (login, logout, register success)
    const handleAuthStateChanged = () => {
      setCurrentUser(authService.getCurrentUser());
    };

    window.addEventListener('auth-required', handleAuthRequired);
    window.addEventListener('auth-state-changed', handleAuthStateChanged);

    return () => {
      window.removeEventListener('auth-required', handleAuthRequired);
      window.removeEventListener('auth-state-changed', handleAuthStateChanged);
    };
  }, []);

  // Track Page Views
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await axiosClient.post('/analytics/track', {
          eventType: 'PAGE_VIEW',
          targetId: activeTab
        });
      } catch (e) {
        console.error("Failed to track page view", e);
      }
    };
    trackPageView();

    // Google Analytics 4 page view tracking for SPA tabs
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: activeTab.toUpperCase() + ' - Travelist',
        page_location: window.location.origin + '/' + activeTab,
        page_path: '/' + activeTab
      });
    }
  }, [activeTab]);

  // Router dispatcher
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <LandingPage 
            activeTab={activeTab}
            setActiveTab={setActiveTab} 
            setPlannerPrefill={setPlannerPrefill} 
          />
        );
      case 'planner':
        return <TripPlannerStudio prefill={plannerPrefill} initialTab={plannerTab} />;
      case 'social':
        return <CommunityFeed />;
      case 'admin':
        return <AdminDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'about':
        return <AboutUs />;
      case 'profile':
        if (!currentUser) {
          setActiveTab('home');
          setIsAuthModalOpen(true);
          return null;
        }
        return <UserProfile 
          currentUser={currentUser} 
          onUpdateSuccess={() => setCurrentUser(authService.getCurrentUser())} 
        />;
      default:
        return (
          <LandingPage 
            activeTab={activeTab}
            setActiveTab={setActiveTab} 
            setPlannerPrefill={setPlannerPrefill} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-800 flex flex-col font-inter transition-colors duration-300">
      {/* Header Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      {/* Dynamic Content Panel */}
      <main className="flex-grow w-full">
        {renderContent()}
      </main>

      {/* Floating Virtual Assistant Companion */}
      <ChatbotWidget />

      {/* Footer Details */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between shadow-lg pb-safe">
        <button
          onClick={() => {
            setActiveTab('home');
            window.dispatchEvent(new Event('reset-homepage-categories'));
          }}
          className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer ${
            activeTab === 'home' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[9px]">Trang chủ</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer ${
            activeTab === 'about' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[9px]">{language === 'vi' ? 'Giới thiệu' : 'About'}</span>
        </button>

        {/* Center '+' Button */}
        <div className="relative -mt-6">
          <button
            onClick={() => {
              setPlannerTab('studio');
              setPlannerPrefill({ days: 3, budget: 4000000, style: 'Healing' });
              setActiveTab('planner');
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md border-4 border-white cursor-pointer active:scale-95 transition-all ${
              activeTab === 'planner' && plannerTab === 'studio' ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-500/40' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => {
            setPlannerTab('saved');
            setActiveTab('planner');
          }}
          className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer ${
            activeTab === 'planner' && plannerTab === 'saved' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px]">Lịch trình</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer ${
            activeTab === 'social' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[9px]">Cộng đồng</span>
        </button>
      </div>

      {/* Auth modal globally accessible */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          window.dispatchEvent(new Event('auth-state-changed'));
        }}
      />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
