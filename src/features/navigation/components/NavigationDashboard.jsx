import React, { useState, useEffect } from 'react';
import SimulatedMap from './SimulatedMap';
import InstructionBanner from './InstructionBanner';
import InfoBottomBar from './InfoBottomBar';
import ControlButtons from './ControlButtons';
import { useLanguage } from '../../../context/LanguageContext';
import { Navigation, RotateCcw, Home, Smile } from 'lucide-react';

export default function NavigationDashboard({ setActiveTab }) {
  const { language } = useLanguage();

  // State Management
  const [progress, setProgress] = useState(0); // overall travel progress (0.0 to 1.0)
  const [zoom, setZoom] = useState(1.2);
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode by default for premium CarPlay feel
  const [isSimulating, setIsSimulating] = useState(true); // Automatically runs simulation
  const [isArrived, setIsArrived] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mapMode, setMapMode] = useState('google'); // 'google' | '3d' - Default to Google Maps!
  const [isHeadingUp, setIsHeadingUp] = useState(true);

  const speed = 0.0016; // Simulated driving speed

  // Trigger auto-dismiss for the initial welcome toast
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Real-time tick effect for driving simulation
  useEffect(() => {
    let intervalId;
    if (isSimulating && !isArrived) {
      intervalId = setInterval(() => {
        setProgress(prev => {
          const next = prev + speed;
          if (next >= 1) {
            setIsSimulating(false);
            setIsArrived(true);
            return 1;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isSimulating, isArrived]);

  // Coordinate math based on total path length of 700
  const getVehiclePosition = (prog) => {
    const totalDistance = 700;
    const currentDist = prog * totalDistance;

    if (currentDist <= 150) {
      const segProg = currentDist / 150;
      return {
        x: 100,
        y: 500 - segProg * 150,
        segmentIndex: 0,
        segmentProgress: segProg
      };
    } else if (currentDist <= 350) {
      const d = currentDist - 150;
      const segProg = d / 200;
      return {
        x: 100 + segProg * 200,
        y: 350,
        segmentIndex: 1,
        segmentProgress: segProg
      };
    } else if (currentDist <= 500) {
      const d = currentDist - 350;
      const segProg = d / 150;
      return {
        x: 300,
        y: 350 - segProg * 150,
        segmentIndex: 2,
        segmentProgress: segProg
      };
    } else {
      const d = currentDist - 500;
      const segProg = Math.min(1, d / 200);
      return {
        x: 300 + segProg * 200,
        y: 200,
        segmentIndex: 3,
        segmentProgress: segProg
      };
    }
  };

  const vehiclePos = getVehiclePosition(progress);

  const handleExit = () => {
    setActiveTab('planner'); // Go back to the planner studio
  };

  const handleRestart = () => {
    setProgress(0);
    setIsArrived(false);
    setIsSimulating(true);
    setShowWelcome(true);
  };

  return (
    <div className="relative w-full h-[calc(100vh-70px)] min-h-[500px] overflow-hidden flex flex-col font-inter">
      
      {/* 1. Fullscreen Map Background (Google Maps or CarPlay 3D Perspective Vector) */}
      <SimulatedMap
        progress={progress}
        zoom={zoom}
        isDarkMode={isDarkMode}
        vehiclePos={vehiclePos}
        currentSegmentIndex={vehiclePos.segmentIndex}
        mapMode={mapMode}
        isHeadingUp={isHeadingUp}
      />

      {/* 2. Top Instruction Banner (Floating Dark Glassmorphism) */}
      <InstructionBanner
        currentSegmentIndex={vehiclePos.segmentIndex}
        segmentProgress={vehiclePos.segmentProgress}
        isDarkMode={isDarkMode}
      />

      {/* 3. Right Control Panel Group */}
      <ControlButtons
        zoom={zoom}
        setZoom={setZoom}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        currentSegmentIndex={vehiclePos.segmentIndex}
        mapMode={mapMode}
        setMapMode={setMapMode}
        isHeadingUp={isHeadingUp}
        setIsHeadingUp={setIsHeadingUp}
      />

      {/* 4. Bottom Journey Details Banner (Glassmorphism white/dark, red exit button) */}
      <InfoBottomBar
        progress={progress}
        onExit={handleExit}
        isDarkMode={isDarkMode}
      />

      {/* Welcome Floating Notification Toast */}
      {showWelcome && (
        <div className="absolute top-28 left-4 md:left-6 z-10 max-w-sm animate-slide-in-right">
          <div className="bg-emerald-500/90 dark:bg-emerald-950/90 backdrop-blur-xl border border-emerald-400/20 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-white">
              <Navigation className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold font-outfit">
                {language === 'vi' ? 'Đã Vào Chế Độ GG Map!' : 'Google Maps Mode Active'}
              </h4>
              <p className="text-[11px] text-white/80 font-medium mt-0.5 leading-relaxed">
                {language === 'vi' 
                  ? 'Bản đồ thực tế đang được hiển thị. Bấm nút biểu tượng "Lớp bản đồ" bên phải để chuyển sang mô phỏng 3D CarPlay.'
                  : 'Displaying live Google Map route. Tap the Layers button on the right to toggle CarPlay 3D mode.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Destination Reached Celebratory Modal */}
      {isArrived && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 text-center animate-scale-up">
            
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
              <Smile className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black font-outfit text-slate-900 dark:text-white mt-5">
              {language === 'vi' ? 'Đã Đến Điểm Hẹn!' : 'Destination Reached!'}
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
              {language === 'vi' 
                ? 'Bạn đã hoàn thành chặng đường 14 km và tới đích an toàn tại đường Phạm Như Xương, Liên Chiểu, Đà Nẵng.' 
                : 'You have completed the 14 km journey and arrived safely at Pham Nhu Xuong St, Da Nang.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-extrabold text-xs rounded-xl cursor-pointer border-none transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'vi' ? 'Chạy Lại Lộ Trình' : 'Restart Route'}</span>
              </button>

              <button
                onClick={handleExit}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-heritage-amber to-heritage-gold hover:from-heritage-gold hover:to-heritage-amber text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/15 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>{language === 'vi' ? 'Về Lịch Trình' : 'Back to Planner'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
