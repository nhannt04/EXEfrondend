import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import LandingPage from './features/trip-planner/components/LandingPage';
import TripPlannerStudio from './features/trip-planner/components/TripPlannerStudio';
import CommunityFeed from './features/social/components/CommunityFeed';
import AdminDashboard from './features/admin/components/AdminDashboard';
import ChatbotWidget from './features/chatbot/components/ChatbotWidget';
import Footer from './components/layout/Footer';
import AboutUs from './components/AboutUs';
import UserProfile from './components/profile/UserProfile';
import { LanguageProvider } from './context/LanguageContext';
import authService from './services/authService';
import AuthModal from './components/layout/AuthModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [plannerPrefill, setPlannerPrefill] = useState(null);
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

  // Router dispatcher
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <LandingPage 
            setActiveTab={setActiveTab} 
            setPlannerPrefill={setPlannerPrefill} 
          />
        );
      case 'planner':
        return <TripPlannerStudio prefill={plannerPrefill} />;
      case 'social':
        return <CommunityFeed />;
      case 'admin':
        return <AdminDashboard />;
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
