import React, { useState, useEffect } from 'react';
import { BookOpen, Coffee, Compass, Info, MapPin, Printer, ShieldAlert, Sparkles, Sun, Sunrise, Download, Calendar, ArrowLeft, RefreshCw, Key, DollarSign, Heart, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import tripService from '../services/tripService';
import authService from '../services/authService';

export default function PocketHandbook() {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  
  // Selection states
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [parsedTripDays, setParsedTripDays] = useState([]);
  const [activeDay, setActiveDay] = useState(1);
  const [hoveredSpot, setHoveredSpot] = useState(null); // Detail spot card to display on the right
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load auth state
  useEffect(() => {
    const handleAuthStateChanged = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('auth-state-changed', handleAuthStateChanged);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChanged);
    };
  }, []);

  // Fetch saved itineraries
  useEffect(() => {
    if (currentUser) {
      fetchItineraries();
    } else {
      setSavedItineraries([]);
    }
  }, [currentUser]);

  const fetchItineraries = async () => {
    setLoadingList(true);
    try {
      const response = await tripService.getMyItineraries();
      if (response && response.success) {
        setSavedItineraries(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch itineraries:", err);
    } finally {
      setLoadingList(false);
    }
  };

  // When an itinerary is clicked, parse its tripData
  const handleSelectItinerary = (itinerary) => {
    setSelectedItinerary(itinerary);
    setSaveSuccess(false);
    try {
      const parsed = JSON.parse(itinerary.tripData);
      setParsedTripDays(parsed);
      setActiveDay(1);
      
      // Default hovered spot to the accommodation of Day 1
      if (parsed.length > 0) {
        setHoveredSpot(parsed[0].accommodation || (parsed[0].slots && parsed[0].slots[0]?.spot));
      }
    } catch (e) {
      console.error("Invalid tripData JSON:", e);
      setParsedTripDays([]);
    }
  };

  // Clones/Saves the itinerary to database (Save to My Trips feature)
  const handleSaveToMyTrips = async () => {
    if (!currentUser || !selectedItinerary) return;
    setIsSaving(true);
    try {
      const response = await tripService.saveItinerary({
        title: `${selectedItinerary.title} (Copy)`,
        totalDays: selectedItinerary.totalDays,
        totalBudget: selectedItinerary.totalBudget,
        travelStyle: selectedItinerary.travelStyle,
        groupType: selectedItinerary.groupType || 'couple',
        tripData: selectedItinerary.tripData
      });
      if (response && response.success) {
        setSaveSuccess(true);
        fetchItineraries(); // Refresh list
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save copy:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotHeader = (slotKey) => {
    const key = slotKey?.toLowerCase() || '';
    if (key.includes('stay') || key.includes('accommodation')) return { label: language === 'vi' ? '🏨 Lưu trú' : '🏨 Stay', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    if (key.includes('morning') || key.includes('breakfast')) return { label: language === 'vi' ? '☀️ Buổi Sáng' : '☀️ Morning', color: 'bg-blue-50 border-blue-200 text-blue-700' };
    if (key.includes('afternoon') || key.includes('lunch')) return { label: language === 'vi' ? '🌇 Buổi Chiều' : '🌇 Afternoon', color: 'bg-orange-50 border-orange-200 text-orange-700' };
    return { label: language === 'vi' ? '🌃 Buổi Tối' : '🌃 Evening', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
  };

  const openAuthModal = () => {
    window.dispatchEvent(new Event('auth-required'));
  };

  // Render: Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 heritage-pattern">
        <div className="max-w-md w-full text-center space-y-6 glass-panel p-8 sm:p-10 rounded-3xl shadow-xl animate-page-enter">
          <div className="w-16 h-16 bg-heritage-amber/10 text-heritage-amber rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Key className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold font-outfit text-gray-900 tracking-tight">
              {language === 'vi' ? 'Yêu cầu đăng nhập' : 'Login Required'}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              {language === 'vi' 
                ? 'Vui lòng đăng nhập để xem danh sách lịch trình đã lưu và mở rộng cẩm nang dòng thời gian.' 
                : 'Please log in to view your saved itineraries and explore the interactive timeline.'}
            </p>
          </div>
          <button
            onClick={openAuthModal}
            className="w-full py-3 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer border-none transition-all"
          >
            {language === 'vi' ? 'ĐĂNG NHẬP NGAY' : 'LOG IN NOW'}
          </button>
        </div>
      </div>
    );
  }

  // Render: List of saved itineraries (Default screen)
  if (!selectedItinerary) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 heritage-pattern">
        <div className="max-w-4xl w-full space-y-8 animate-page-enter">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-heritage-amber/10 border border-heritage-amber/20 text-heritage-amber text-xs font-semibold uppercase tracking-wider animate-pulse-gold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Interactive Guide</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-outfit">
              {language === 'vi' ? 'Cẩm Nang Hành Trình Bỏ Túi' : 'Pocket Trip Handbooks'}
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              {language === 'vi' 
                ? 'Xem lịch trình dưới dạng dòng thời gian (Timeline) trực quan, tương tác và quản lý ghi chú thực tế.' 
                : 'View your itineraries in a clean, interactive timeline with handy travel notes.'}
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-heritage-amber to-heritage-gold mx-auto rounded-full mt-4" />
          </div>

          {loadingList ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-heritage-amber animate-spin" />
              <p className="text-xs text-gray-550">{language === 'vi' ? 'Đang tải danh sách...' : 'Loading list...'}</p>
            </div>
          ) : savedItineraries.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-4 border border-dashed border-gray-200 bg-white rounded-3xl shadow-sm max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-gray-300 animate-float" />
              <div>
                <h3 className="font-bold text-gray-800 text-base font-outfit">{language === 'vi' ? 'Không có lịch trình' : 'No itineraries'}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {language === 'vi' ? 'Hãy lên lịch trình du lịch để xem cẩm nang tại đây!' : 'Please plan a trip to view it here!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {savedItineraries.map((saved) => (
                <div
                  key={saved.id}
                  onClick={() => handleSelectItinerary(saved)}
                  className="group border border-gray-150 hover:border-heritage-amber hover:shadow-lg bg-white p-6 rounded-3xl flex flex-col justify-between gap-5 transition-all duration-300 cursor-pointer relative animate-scale-up glow-amber"
                >
                  <div className="space-y-4">
                    <h4 className="font-outfit font-extrabold text-lg sm:text-xl text-gray-900 group-hover:text-heritage-amber transition-colors tracking-tight">
                      {saved.title}
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-2 bg-gray-50/80 p-3 rounded-2xl border border-gray-150/60 text-center text-xs">
                      <div>
                        <span className="block text-[9px] text-gray-450 font-bold uppercase">{language === 'vi' ? 'Thời gian' : 'Days'}</span>
                        <span className="font-extrabold text-gray-800 mt-1">{saved.totalDays} ngày</span>
                      </div>
                      <div className="border-x border-gray-200">
                        <span className="block text-[9px] text-gray-450 font-bold uppercase">{language === 'vi' ? 'Phong cách' : 'Style'}</span>
                        <span className="font-extrabold text-heritage-amber mt-1 truncate px-0.5">{saved.travelStyle}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-450 font-bold uppercase">{language === 'vi' ? 'Chi phí' : 'Budget'}</span>
                        <span className="font-extrabold text-ricefield-green mt-1">{(saved.totalBudget / 1000000).toFixed(1)}M đ</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-heritage-amber uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    <span>{language === 'vi' ? 'Mở cẩm nang' : 'Open Handbook'}</span>
                    <span>➔</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  }

  // Gather active day timeline spots
  const dayData = parsedTripDays[activeDay - 1] || {};
  const timelineSpots = [];

  if (dayData.accommodation) {
    timelineSpots.push({
      slot: 'stay',
      spot: dayData.accommodation,
      time: '07:00'
    });
  }

  if (dayData.slots) {
    dayData.slots.forEach(s => {
      if (s.spot) {
        timelineSpots.push({
          slot: s.slot,
          spot: s.spot,
          time: s.time || '09:00'
        });
      }
    });
  } else {
    // Fallback if slots array is not present
    ['morning', 'afternoon', 'evening'].forEach(key => {
      if (dayData[key]) {
        timelineSpots.push({
          slot: key,
          spot: dayData[key],
          time: key === 'morning' ? '08:30' : key === 'afternoon' ? '14:30' : '19:00'
        });
      }
    });
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 heritage-pattern">
      <div className="max-w-6xl w-full space-y-6 animate-page-enter">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/60 shadow-sm">
          <button
            onClick={() => setSelectedItinerary(null)}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-heritage-amber cursor-pointer transition-colors bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'vi' ? 'Quay lại danh sách' : 'Back to List'}
          </button>
          
          <h2 className="font-outfit font-extrabold text-base text-gray-900 truncate max-w-md">
            📖 {selectedItinerary.title}
          </h2>

          <button
            onClick={handleSaveToMyTrips}
            disabled={isSaving}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm border-none cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-600/10' 
                : 'bg-heritage-amber hover:bg-heritage-gold text-white shadow-heritage-amber/15'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                {language === 'vi' ? 'ĐÃ LƯU THÀNH CÔNG!' : 'SAVED SUCCESSFULLY!'}
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                {language === 'vi' ? 'Lưu vào hành trình' : 'Save to My Trips'}
              </>
            )}
          </button>
        </div>

        {/* Day tabs selection */}
        {parsedTripDays.length > 1 && (
          <div className="flex gap-2 pb-1 overflow-x-auto select-none">
            {parsedTripDays.map((d) => (
              <button
                key={d.day}
                onClick={() => {
                  setActiveDay(d.day);
                  // Default hover to day's accommodation or first spot
                  const activeDayData = parsedTripDays[d.day - 1] || {};
                  setHoveredSpot(activeDayData.accommodation || (activeDayData.slots && activeDayData.slots[0]?.spot) || activeDayData.morning);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  activeDay === d.day
                    ? 'bg-heritage-amber text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {language === 'vi' ? `Ngày ${d.day}` : `Day ${d.day}`}
              </button>
            ))}
          </div>
        )}

        {/* Main Grid: Left Vertical Timeline, Right Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Timeline View (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">
              {language === 'vi' ? 'Dòng thời gian chuyến đi' : 'Itinerary Timeline'}
            </h3>

            {timelineSpots.length === 0 ? (
              <p className="text-sm text-gray-400 pl-4">{language === 'vi' ? 'Ngày này chưa có điểm đến.' : 'No destinations for this day.'}</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-gray-200 space-y-8 ml-4 pt-2">
                {timelineSpots.map((item, index) => {
                  const spot = item.spot;
                  const slotConfig = getSlotHeader(item.slot);
                  const isSelected = hoveredSpot && hoveredSpot.id === spot.id;

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredSpot(spot)}
                      onClick={() => setHoveredSpot(spot)}
                      className={`relative pl-8 group cursor-pointer transition-all duration-300 ${
                        isSelected ? 'scale-[1.01]' : ''
                      }`}
                    >
                      {/* Timeline Dot Node */}
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md transition-all duration-300 ${
                        isSelected ? 'bg-heritage-amber scale-125' : 'bg-gray-300 group-hover:bg-heritage-gold'
                      }`} />

                      {/* Card Content */}
                      <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white ${
                        isSelected 
                          ? 'border-heritage-amber ring-2 ring-heritage-amber/15 shadow-md shadow-heritage-amber/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        
                        <div className="space-y-2 flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-gray-400">{item.time}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${slotConfig.color}`}>
                              {slotConfig.label}
                            </span>
                          </div>
                          
                          <h4 className="font-outfit font-extrabold text-base text-gray-900 truncate">
                            {spot.name?.[language] || spot.name?.vi}
                          </h4>

                          {/* Quick Local Recommendation Tags */}
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px] font-bold">
                              ✨ Local Favorite
                            </span>
                            {spot.priceMin === 0 && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold">
                                💵 Miễn phí
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cost/Action indicators */}
                        <div className="flex-shrink-0 text-right sm:border-l border-gray-100 sm:pl-4 min-w-[80px]">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase">{language === 'vi' ? 'Chi phí' : 'Cost'}</span>
                          <span className="text-xs font-black text-gray-800 mt-1 block">
                            {spot.priceMin !== undefined && spot.priceMin > 0 
                              ? `${(spot.priceMin / 1000).toFixed(0)}k+` 
                              : (language === 'vi' ? 'Tự do' : 'Free')}
                          </span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detail Frame (Span 5) */}
          <div className="lg:col-span-5 sticky top-24">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4">
              {language === 'vi' ? 'Chi tiết điểm đến' : 'Spot Details'}
            </h3>

            {hoveredSpot ? (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/80 shadow-md space-y-6 animate-scale-up">
                
                {/* Spot Image */}
                <div className="w-full h-44 rounded-2xl overflow-hidden relative bg-gray-100 shadow-inner group">
                  <img
                    src={hoveredSpot.img || hoveredSpot.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'}
                    alt="Destination Spot"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
                      📍 {hoveredSpot.category || 'Sightseeing'}
                    </span>
                  </div>
                </div>

                {/* Spot Header Information */}
                <div className="space-y-2">
                  <h4 className="font-outfit font-extrabold text-xl sm:text-2xl text-gray-900 leading-snug">
                    {hoveredSpot.name?.[language] || hoveredSpot.name?.vi}
                  </h4>
                  {hoveredSpot.address && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-heritage-amber flex-shrink-0" />
                      <span>{hoveredSpot.address}</span>
                    </p>
                  )}
                </div>

                {/* Costs & Cost optimizer metrics */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50/60 border border-gray-150 rounded-2xl text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider mb-0.5">{language === 'vi' ? 'Dự kiến chi tiêu' : 'Cost Range'}</span>
                    <span className="font-black text-gray-800">
                      {hoveredSpot.priceMin !== undefined && hoveredSpot.priceMin > 0
                        ? `${hoveredSpot.priceMin.toLocaleString()}đ - ${hoveredSpot.priceMax.toLocaleString()}đ`
                        : (language === 'vi' ? 'Miễn phí tham quan' : 'Free of charge')}
                    </span>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider mb-0.5">{language === 'vi' ? 'Ưu tiên trải nghiệm' : 'Vibe'}</span>
                    <span className="font-black text-heritage-amber flex items-center gap-1 uppercase text-[10px]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Local Spot
                    </span>
                  </div>
                </div>

                {/* Notes/AI Recommendation reason */}
                {hoveredSpot.reason && (
                  <div className="space-y-2 bg-blue-50/30 border border-blue-100/50 p-4.5 rounded-2xl">
                    <span className="text-[10px] text-heritage-amber font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {language === 'vi' ? 'Lý do khuyên dùng' : 'Recommendation Insight'}
                    </span>
                    <p className="text-xs text-gray-655 leading-relaxed font-normal italic">
                      "{hoveredSpot.reason?.[language] || hoveredSpot.reason?.vi}"
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="glass-panel p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                <Compass className="w-10 h-10 mx-auto text-gray-300 animate-spin-slow mb-2" />
                <p className="text-xs">{language === 'vi' ? 'Rê chuột vào địa điểm để xem chi tiết.' : 'Hover on a spot to inspect details.'}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
