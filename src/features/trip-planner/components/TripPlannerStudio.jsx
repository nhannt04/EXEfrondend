import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, DollarSign, Users, Award, ShieldAlert, Check, RefreshCw, Star, Info, Moon, Sun, Sunrise, MapPin, Navigation, Compass, Footprints, Bike, Car, X, Maximize2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import tripService from '../../../services/tripService';
import authService from '../../../services/authService';
import spotService from '../../../services/spotService';

const LOADING_FACTS_VI = [
  "Hội An có hơn 1360 di tích kiến trúc cổ được xếp hạng bảo tồn.",
  "Chùa Cầu được người Nhật xây dựng vào đầu thế kỷ 17 như một thanh kiếm yểm trừ quái vật thủy quái.",
  "Mì Quảng có vị đậm, chan ít nước dùng, ăn kèm bánh tráng nướng giòn rụm và rau trà quế.",
  "Đèn lồng Hội An được làm từ tre ngâm muối 10 ngày để chống mối mọt và bọc vải lụa tơ tằm Hà Đông."
];

const LOADING_FACTS_EN = [
  "Hoi An has over 1,360 architectural heritage sites listed for conservation.",
  "The Covered Bridge was built by Japanese in the early 17th century to subdue the water demon Namazu.",
  "Mi Quang is intensely savory, served with highly concentrated broth, sesame rice crackers, and Tra Que herbs.",
  "Hoi An lanterns are crafted using salted bamboo frames soaked for 10 days and wrapped in luxurious Ha Dong silk."
];

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

export default function TripPlannerStudio({ prefill }) {
  const { language, t } = useLanguage();
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5000000); // 5 Million default
  const [style, setStyle] = useState('Healing');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [interests, setInterests] = useState(['Cafe', 'Homestay', 'Biển']);
  
  const [loading, setLoading] = useState(false);
  const [loadingFactIndex, setLoadingFactIndex] = useState(0);
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [optimizing, setOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  // Map States
  const [userLocation, setUserLocation] = useState({ lat: 15.8821, lng: 108.3371 }); // Default to Little Pie
  const [isLocating, setIsLocating] = useState(false);
  const [isFarAway, setIsFarAway] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [transportMode, setTransportMode] = useState('motorbike'); // 'foot', 'bike', 'motorbike', 'car'
  const [isMapMaximized, setIsMapMaximized] = useState(false); // Maximize toggle
  const [activeModalView, setActiveModalView] = useState('map'); // 'map' | 'details'

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [activePlannerTab, setActivePlannerTab] = useState('studio');
  const [allDbSpots, setAllDbSpots] = useState([]);

  // Load saved itineraries
  const fetchSavedItineraries = async () => {
    const user = authService.getCurrentUser();
    if (!user) return;
    try {
      const response = await tripService.getMyItineraries();
      if (response && response.success) {
        setSavedItineraries(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch saved itineraries:", err);
    }
  };

  // Run initial check and listen to auth state changes
  useEffect(() => {
    const handleAuthStateChanged = () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        fetchSavedItineraries();
      } else {
        setSavedItineraries([]);
      }
    };

    handleAuthStateChanged();

    window.addEventListener('auth-state-changed', handleAuthStateChanged);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChanged);
    };
  }, []);

  const handleSaveItinerary = async () => {
    if (!currentUser || !itinerary) {
      alert(language === 'vi' ? "Vui lòng đăng nhập để lưu lịch trình!" : "Please login to save your itinerary!");
      window.dispatchEvent(new Event('auth-required'));
      return;
    }
    setIsSaving(true);
    try {
      const response = await tripService.saveItinerary({
        title: tripTitle || (language === 'vi' ? 'Lịch trình Hội An' : 'Hoi An Itinerary'),
        totalDays: days,
        totalBudget: budget,
        travelStyle: style,
        groupType: 'couple',
        tripData: JSON.stringify(itinerary)
      });
      if (response && response.success) {
        alert(language === 'vi' ? "Lưu lịch trình thành công!" : "Itinerary saved successfully!");
        setShowSaveModal(false);
        fetchSavedItineraries();
      } else {
        alert(language === 'vi' ? "Lỗi khi lưu lịch trình!" : "Failed to save itinerary!");
      }
    } catch (err) {
      console.error("Failed to save itinerary:", err);
      if (err.response?.status === 401) {
        alert(language === 'vi' ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!" : "Session expired. Please login again!");
        setShowSaveModal(false);
        window.dispatchEvent(new Event('auth-required'));
      } else {
        alert(language === 'vi' ? "Đã có lỗi xảy ra!" : "An error occurred!");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(language === 'vi' ? "Bạn chắc chắn muốn xóa lịch trình này?" : "Are you sure you want to delete this itinerary?")) return;
    try {
      const response = await tripService.deleteItinerary(id);
      if (response && response.success) {
        setSavedItineraries(savedItineraries.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete itinerary:", err);
      alert(language === 'vi' ? "Xóa thất bại!" : "Deletion failed!");
    }
  };

  const handleLoadSaved = (savedTrip) => {
    try {
      const parsedData = JSON.parse(savedTrip.tripData);
      setItinerary(parsedData);
      setDays(savedTrip.totalDays);
      setBudget(savedTrip.totalBudget);
      setStyle(savedTrip.travelStyle);
      setActiveDay(1);
      if (parsedData.length > 0) {
        setSelectedSpot(parsedData[0].accommodation);
      }
      setActivePlannerTab('studio');
    } catch (err) {
      console.error("Failed to load saved itinerary:", err);
      alert("Lỗi dữ liệu lịch trình không hợp lệ!");
    }
  };

  const facts = language === 'vi' ? LOADING_FACTS_VI : LOADING_FACTS_EN;

  // Track user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distToHoiAn = getDistanceKm(latitude, longitude, 15.8771, 108.3267);
          if (distToHoiAn > 30) {
            setIsFarAway(true);
          } else {
            setUserLocation({ lat: latitude, lng: longitude });
            setIsFarAway(false);
          }
          setIsLocating(false);
        },
        (error) => {
          console.warn("Geolocation warning:", error);
          setIsLocating(false);
          setIsFarAway(true); // Fallback
        }
      );
    }
  }, []);

  // Apply prefill if coming from landing page
  useEffect(() => {
    if (prefill) {
      if (prefill.days) setDays(prefill.days);
      if (prefill.budget) setBudget(prefill.budget);
      if (prefill.style) setStyle(prefill.style);
    }
  }, [prefill]);

  // Loading text cycler
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingFactIndex((prev) => (prev + 1) % facts.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading, facts]);

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const mapBackendSpotToFrontend = (backendSpot) => {
    if (!backendSpot) return null;
    return {
      id: backendSpot.id,
      cost: backendSpot.averageCost || 0,
      name: {
        vi: backendSpot.nameVi,
        en: backendSpot.nameEn
      },
      reason: {
        vi: backendSpot.descriptionVi || "Một địa điểm tuyệt vời được gợi ý.",
        en: backendSpot.descriptionEn || "A wonderful recommended spot."
      },
      img: backendSpot.imageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80",
      lat: backendSpot.latitude,
      lng: backendSpot.longitude,
      category: backendSpot.category
    };
  };

  // Load spots from database for swapping
  useEffect(() => {
    const fetchDbSpots = async () => {
      try {
        const response = await spotService.getSpots();
        if (response && response.success) {
          const mapped = response.data.map(mapBackendSpotToFrontend).filter(Boolean);
          setAllDbSpots(mapped);
        }
      } catch (err) {
        console.error("Failed to load spots from database for swapping:", err);
      }
    };
    fetchDbSpots();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setHasOptimized(false);
    
    try {
      const response = await tripService.generateTrip({
        days: days,
        budget: budget,
        style: style,
        people: adults + children,
        groupType: 'couple',
        interests: interests,
        currentLat: userLocation.lat || 15.8771,
        currentLng: userLocation.lng || 108.3267
      });

      if (response && response.success) {
        const backendData = response.data;
        const generatedDays = backendData.days.map((d) => {
          const staySpot = d.spots.find(s => s.slot === 'STAY')?.spot;
          const mappedSlots = d.spots.map(s => ({
            slot: s.slot,
            time: s.time,
            spot: mapBackendSpotToFrontend(s.spot)
          }));

          return {
            day: d.day,
            accommodation: mapBackendSpotToFrontend(staySpot) || {
              id: 999,
              name: { vi: 'Khách sạn Boutique Hội An', en: 'Little Hoi An Boutique Hotel' },
              cost: 300000,
              reason: { vi: 'Khách sạn nghỉ ngơi thoải mái.', en: 'Cozy boutique hotel stays.' },
              img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
              lat: 15.8770,
              lng: 108.3262
            },
            slots: mappedSlots,
            // Backwards compatibility for other elements accessing fixed fields
            morning: mapBackendSpotToFrontend(d.spots.find(s => s.slot === 'MORNING')?.spot),
            afternoon: mapBackendSpotToFrontend(d.spots.find(s => s.slot === 'AFTERNOON')?.spot),
            evening: mapBackendSpotToFrontend(d.spots.find(s => s.slot === 'EVENING')?.spot)
          };
        });

        setItinerary(generatedDays);
        setActiveDay(1);
        setSelectedSpot(generatedDays[0].accommodation);
      } else {
        alert("Lỗi khi sinh lịch trình!");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      alert("Đã xảy ra lỗi kết nối với server backend Spring Boot!");
    } finally {
      setLoading(false);
    }
  };

  const handleSwapSpot = (dayIndex, slotKey) => {
    if (!itinerary) return;
    
    const nextItinerary = [...itinerary];
    let targetSpot = null;
    let isDynamic = false;
    let slotName = slotKey;

    if (nextItinerary[dayIndex].slots) {
      const dynamicSlot = nextItinerary[dayIndex].slots.find(s => s.slot.toLowerCase() === slotKey.toLowerCase());
      if (dynamicSlot) {
        targetSpot = dynamicSlot.spot;
        isDynamic = true;
        slotName = dynamicSlot.slot;
      }
    }
    
    if (!targetSpot) {
      targetSpot = nextItinerary[dayIndex][slotKey];
    }
    
    if (!targetSpot) return;
    
    let newSpot = null;
    
    if (allDbSpots && allDbSpots.length > 0) {
      let categoryToFind = 'cafe';
      const upperSlot = slotName.toUpperCase();
      if (upperSlot.includes('LUNCH') || upperSlot.includes('FOOD') || upperSlot.includes('EVENING')) {
        categoryToFind = 'food';
      } else if (upperSlot.includes('MORNING') || upperSlot.includes('AFTERNOON') || upperSlot.includes('SIGHTSEEING')) {
        categoryToFind = 'sightseeing';
      }
      
      let dbItems = allDbSpots.filter(s => 
        s.category?.toLowerCase() === categoryToFind && 
        s.name[language] !== targetSpot.name[language]
      );
      
      if (dbItems.length === 0) {
        dbItems = allDbSpots.filter(s => 
          s.category?.toLowerCase() !== 'stay' && 
          s.name[language] !== targetSpot.name[language]
        );
      }
      
      if (dbItems.length > 0) {
        newSpot = dbItems[Math.floor(Math.random() * dbItems.length)];
      }
    }
    
    if (newSpot) {
      const swaped = { ...newSpot };
      if (isDynamic) {
        nextItinerary[dayIndex].slots = nextItinerary[dayIndex].slots.map(s => {
          if (s.slot.toLowerCase() === slotKey.toLowerCase()) {
            return { ...s, spot: swaped };
          }
          return s;
        });
        if (slotKey.toLowerCase() === 'morning') nextItinerary[dayIndex].morning = swaped;
        if (slotKey.toLowerCase() === 'afternoon') nextItinerary[dayIndex].afternoon = swaped;
        if (slotKey.toLowerCase() === 'evening') nextItinerary[dayIndex].evening = swaped;
      } else {
        nextItinerary[dayIndex][slotKey] = swaped;
      }
      
      setItinerary(nextItinerary);

      if (selectedSpot && selectedSpot.lat === targetSpot.lat && selectedSpot.lng === targetSpot.lng) {
        setSelectedSpot(swaped);
      }
    } else {
      console.warn("No suitable spots found in database for swapping.");
    }
  };

  const getItineraryCosts = () => {
    if (!itinerary) return { total: 0, accommodation: 0, food: 0, activities: 0, transport: 0 };
    
    let accCost = 0;
    let foodCost = 0;
    let actCost = 0;
    let transCost = 0;
    
    itinerary.forEach((d) => {
      if (d.accommodation) {
        accCost += (d.accommodation.cost || 0) * (adults + children / 2);
      }
      
      if (d.slots) {
        d.slots.forEach(s => {
          if (s.slot === 'STAY') return; // STAY is counted in accommodation
          const cost = (s.spot?.cost || 0) * (adults + children);
          if (s.slot === 'LUNCH' || s.spot?.category?.toLowerCase() === 'food') {
            foodCost += cost;
          } else if (s.slot?.includes('CAFE') || s.spot?.category?.toLowerCase() === 'cafe') {
            foodCost += cost;
          } else {
            actCost += cost;
          }
        });
      } else {
        // Fallback for old loaded formats
        if (d.morning) foodCost += (d.morning.cost || 0) * (adults + children);
        if (d.evening) foodCost += (d.evening.cost || 0) * (adults + children);
        if (d.afternoon) actCost += (d.afternoon.cost || 0) * (adults + children);
      }
      transCost += 150000;
    });

    return {
      total: Math.round(accCost + foodCost + actCost + transCost),
      accommodation: accCost,
      food: foodCost,
      activities: actCost,
      transport: transCost
    };
  };

  const costs = getItineraryCosts();
  const balance = budget - costs.total;
  const isOverBudget = balance < 0;

  const handleOptimizeBudget = () => {
    setOptimizing(true);
    setTimeout(() => {
      if (!itinerary) return;
      
      const optimizedItinerary = itinerary.map((d) => {
        const ecoHomestay = SPOTS_DATABASE.Homestay.Healing;
        const ecoMorning = SPOTS_DATABASE.Cafe[0];
        const ecoAfternoon = SPOTS_DATABASE.Activity[0];
        const ecoEvening = SPOTS_DATABASE.Food[1];
        
        return {
          ...d,
          accommodation: { ...ecoHomestay },
          morning: { ...ecoMorning },
          afternoon: { ...ecoAfternoon },
          evening: { ...ecoEvening }
        };
      });
      
      setItinerary(optimizedItinerary);
      setOptimizing(false);
      setHasOptimized(true);
      setSelectedSpot(ecoHomestay);
    }, 2500);
  };

  const getRouteMetrics = () => {
    if (!itinerary || !selectedSpot) return { distance: 0, duration: 0 };
    
    const activeAcc = itinerary[activeDay - 1].accommodation;
    const originLat = isFarAway ? activeAcc.lat : userLocation.lat;
    const originLng = isFarAway ? activeAcc.lng : userLocation.lng;

    const distance = getDistanceKm(originLat, originLng, selectedSpot.lat, selectedSpot.lng);
    
    let speed = 40;
    if (transportMode === 'foot') speed = 5;
    if (transportMode === 'bike') speed = 15;
    if (transportMode === 'car') speed = 45;

    const rawHours = distance / speed;
    const rawMinutes = Math.round(rawHours * 60);

    return {
      distance,
      duration: Math.max(1, rawMinutes)
    };
  };

  const routeMetrics = getRouteMetrics();

  const getMapEmbedUrl = () => {
    if (!itinerary) return '';
    const activeAcc = itinerary[activeDay - 1].accommodation;
    
    const originLat = isFarAway ? activeAcc.lat : userLocation.lat;
    const originLng = isFarAway ? activeAcc.lng : userLocation.lng;
    
    const destLat = selectedSpot ? selectedSpot.lat : activeAcc.lat;
    const destLng = selectedSpot ? selectedSpot.lng : activeAcc.lng;

    return `https://maps.google.com/maps?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col items-center gap-10">
      {/* Page Title */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber px-4 py-1.5 rounded-full text-xs font-semibold animate-float">
          <Sparkles className="w-4 h-4 text-heritage-gold animate-spin-slow" />
          HISTRA Trip Planner Studio
        </div>
        <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          {t('plannerTitle')}
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl">
          {t('plannerDesc')}
        </p>
      </div>

      {/* Tab Switcher - Premium Design */}
      <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 relative z-20">
        <button
          onClick={() => setActivePlannerTab('studio')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${
            activePlannerTab === 'studio'
              ? 'bg-white text-heritage-amber shadow-sm'
              : 'text-gray-500 hover:text-gray-900 bg-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {language === 'vi' ? 'Sinh Lịch Trình AI' : 'AI Trip Planner'}
        </button>
        <button
          onClick={() => {
            setActivePlannerTab('saved');
            fetchSavedItineraries();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${
            activePlannerTab === 'saved'
              ? 'bg-white text-heritage-amber shadow-sm'
              : 'text-gray-500 hover:text-gray-900 bg-transparent'
          }`}
        >
          <Calendar className="w-4 h-4" />
          {language === 'vi' ? '🎒 Lịch Trình Của Tôi' : '🎒 My Saved Itineraries'}
        </button>
      </div>

      {activePlannerTab === 'studio' ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side - Input Panel - Apple Shimmer */}
        <div className="lg:col-span-4 bg-white border border-gray-200 p-6 rounded-2xl flex flex-col gap-5 shadow-sm shimmer-trigger">
          <h3 className="font-outfit text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 relative z-10">
            <Calendar className="w-5 h-5 text-heritage-amber" />
            {t('tripParams')}
          </h3>

          {/* Destination */}
          <div className="flex flex-col gap-1.5 relative z-10">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('destination')}</label>
            <input 
              type="text" 
              value={language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam'} 
              disabled 
              className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold"
            />
          </div>

          {/* Days & Style */}
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('daysCount')}</label>
              <select 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value={1}>{language === 'vi' ? '1 Ngày' : '1 Day'}</option>
                <option value={2}>{language === 'vi' ? '2 Ngày' : '2 Days'}</option>
                <option value={3}>{language === 'vi' ? '3 Ngày' : '3 Days'}</option>
                <option value={4}>{language === 'vi' ? '4 Ngày' : '4 Days'}</option>
                <option value={5}>{language === 'vi' ? '5 Ngày' : '5 Days'}</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('travelStyle')}</label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value="Healing">{language === 'vi' ? 'Healing / Tĩnh' : 'Healing / Retreat'}</option>
                <option value="Ẩm thực">{language === 'vi' ? 'Ẩm thực local' : 'Foodie / Taste'}</option>
                <option value="Khám phá">{language === 'vi' ? 'Khám phá di sản' : 'Explorer / Heritage'}</option>
                <option value="Nghỉ dưỡng">{language === 'vi' ? 'Nghỉ dưỡng luxury' : 'Luxury / Relax'}</option>
              </select>
            </div>
          </div>

          {/* Budget Setting */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('budgetLabel')}</label>
              <span className="text-heritage-amber font-extrabold text-sm">{(budget / 1000000).toFixed(1)} {language === 'vi' ? 'triệu VND' : 'M VND'}</span>
            </div>
            <input 
              type="range" 
              min={1000000} 
              max={25000000} 
              step={500000}
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-amber"
            />
          </div>

          {/* Group size */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 relative z-10">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('adults')}</label>
              <input 
                type="number" 
                min={1} 
                max={10} 
                value={adults}
                onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber text-center font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('children')}</label>
              <input 
                type="number" 
                min={0} 
                max={10} 
                value={children}
                onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber text-center font-bold"
              />
            </div>
          </div>

          {/* Interests tags */}
          <div className="flex flex-col gap-2 relative z-10">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('interests')}</label>
            <div className="flex flex-wrap gap-2">
              {['Cafe', 'Homestay', 'Biển', 'Đi bộ', 'Gốm / Đèn Lồng', 'Di sản cổ'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                    interests.includes(tag)
                      ? 'bg-ricefield-green/10 text-ricefield-green border-ricefield-green/40 font-bold'
                      : 'border-gray-200 hover:border-gray-400 text-gray-500 bg-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4 py-3 bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-heritage-amber/15 cursor-pointer border-none z-10"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            {loading ? t('generating') : t('generateButton')}
          </button>
        </div>

        {/* Right Side - Output Timeline & Map Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Loading Animation */}
          {loading && (
            <div className="w-full h-[500px] bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 gap-6 shadow-sm animate-scale-up">
              <div className="relative w-16 h-16 border-4 border-heritage-amber/20 border-t-heritage-amber rounded-full animate-spin flex items-center justify-center" />
              <div className="text-center flex flex-col gap-2 max-w-sm">
                <span className="text-heritage-amber font-outfit text-sm font-extrabold tracking-wide uppercase">{t('generating')}</span>
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  "{t('loadingFact')} {facts[loadingFactIndex]}"
                </p>
              </div>
            </div>
          )}

          {/* Placeholder state */}
          {!loading && !itinerary && (
            <div className="w-full h-[500px] border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 gap-4 bg-[#FAF7EE]/10 animate-fade-in">
              <div className="bg-white border border-gray-200 p-4 rounded-full text-gray-400 shadow-sm animate-float">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-bold text-gray-800 mb-1">{t('noItinerary')}</h3>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  {t('noItineraryDesc')}
                </p>
              </div>
            </div>
          )}

          {/* Result view */}
          {!loading && itinerary && (
            <div className="w-full flex flex-col gap-6 animate-fade-in">
              {/* Financial Dashboard Banner - Apple Shimmer */}
              <div className="w-full bg-white rounded-2xl p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-sm shimmer-trigger">
                <div className="flex flex-col relative z-10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('yourBudget')}</span>
                  <div className="flex items-center gap-1.5 text-gray-800 font-extrabold font-outfit text-lg">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {(budget).toLocaleString()}đ
                  </div>
                </div>
                
                <div className="flex flex-col relative z-10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('estimateCost')}</span>
                  <div className="flex items-center gap-1.5 text-gray-800 font-extrabold font-outfit text-lg">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {costs.total.toLocaleString()}đ
                  </div>
                </div>

                <div className="flex flex-col relative z-10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('remainingBalance')}</span>
                  <div className={`flex items-center gap-1.5 font-extrabold font-outfit text-lg ${balance < 0 ? 'text-red-600' : 'text-ricefield-green'}`}>
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {balance.toLocaleString()}đ
                  </div>
                </div>

                <div className="flex gap-2 justify-end relative z-10">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert(language === 'vi' ? "Vui lòng đăng nhập để lưu lịch trình!" : "Please login to save your itinerary!");
                        window.dispatchEvent(new Event('auth-required'));
                        return;
                      }
                      setTripTitle(language === 'vi' ? `Chuyến đi Hội An ${days} Ngày` : `Hoi An ${days}-Day Journey`);
                      setShowSaveModal(true);
                    }}
                    className="px-3.5 py-2 bg-ricefield-green hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-md cursor-pointer border-none"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {language === 'vi' ? 'Lưu Lịch Trình' : 'Save Itinerary'}
                  </button>

                  {isOverBudget ? (
                    <button
                      onClick={handleOptimizeBudget}
                      disabled={optimizing}
                      className="px-4 py-2.5 bg-gradient-to-tr from-heritage-amber to-heritage-gold text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 animate-pulse-gold hover:scale-[1.03] active:scale-95 transition-transform duration-300 shadow-md cursor-pointer border-none"
                    >
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      {optimizing ? t('optimizing') : t('optimizeButton')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-ricefield-green/10 border border-ricefield-green/20 text-ricefield-green px-3 py-1.5 rounded-xl text-xs font-semibold">
                      <Check className="w-4 h-4 text-ricefield-green" />
                      {t('inControl')}
                    </div>
                  )}
                </div>
              </div>

              {/* Optimizing State indicator */}
              {optimizing && (
                <div className="w-full p-4 bg-[#FFFBEB] text-heritage-amber rounded-xl text-xs flex items-center gap-3 border border-amber-200 animate-pulse shadow-sm">
                  <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>{t('optMessage')}</span>
                </div>
              )}

              {hasOptimized && !optimizing && (
                <div className="w-full p-4 bg-green-50 text-ricefield-green rounded-xl text-xs flex items-center gap-3 border border-green-200 shadow-sm animate-scale-up">
                  <Check className="w-4 h-4 flex-shrink-0 text-ricefield-green" />
                  <span>{t('optSuccess')}</span>
                </div>
              )}

              {/* Day selection tabs */}
              <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                {itinerary.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => {
                      setActiveDay(d.day);
                      setSelectedSpot(d.accommodation);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                      activeDay === d.day
                        ? 'bg-heritage-amber text-white shadow-md shadow-heritage-amber/15 scale-[1.02]'
                        : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400'
                    }`}
                  >
                    {t('dayTab')} {d.day}
                  </button>
                ))}
              </div>

              {/* Layout for Timeline vs Cost Breakdown & Dynamic GPS Maps */}
              <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Timeline Column */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {itinerary[activeDay - 1].accommodation ? (
                    <div 
                      onClick={() => setSelectedSpot(itinerary[activeDay - 1].accommodation)}
                      className={`w-full bg-white border p-4 rounded-xl flex gap-4 items-center shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md shimmer-trigger animate-fade-in-up [animation-delay:100ms] ${
                        selectedSpot && selectedSpot.lat === itinerary[activeDay - 1].accommodation.lat 
                          ? 'border-heritage-amber ring-2 ring-heritage-amber/20 scale-[1.01]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={itinerary[activeDay - 1].accommodation.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'} 
                        alt="Homestay"
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 relative z-10"
                      />
                      <div className="flex-grow relative z-10">
                        <span className="text-[9px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 font-bold px-1.5 py-0.5 rounded-md uppercase leading-none">{t('restPlace')}</span>
                        <h4 className="font-outfit text-sm font-bold text-gray-900 mt-1">{itinerary[activeDay - 1].accommodation.name?.[language] || 'Homestay / Khách sạn'}</h4>
                        <p className="text-[10.5px] text-gray-500 leading-normal">{itinerary[activeDay - 1].accommodation.reason?.[language] || 'Nơi lưu trú thư giãn lý tưởng.'}</p>
                      </div>
                      <div className="text-right flex-shrink-0 relative z-10">
                        <span className="text-[10px] text-gray-400 block">{t('estimatedNight')}</span>
                        <span className="text-xs font-extrabold text-heritage-amber">{(itinerary[activeDay - 1].accommodation.cost || 0).toLocaleString()}đ</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Timeline elements with Cascading Delay Animations */}
                  {(() => {
                    const activeDayData = itinerary[activeDay - 1];
                    const displaySlots = activeDayData.slots
                      ? activeDayData.slots.filter(s => s.slot !== 'STAY')
                      : [
                          { slot: 'morning', spot: activeDayData.morning, time: '08:00 - 09:30' },
                          { slot: 'afternoon', spot: activeDayData.afternoon, time: '14:30 - 16:00' },
                          { slot: 'evening', spot: activeDayData.evening, time: '19:00 - 20:30' }
                        ].filter(s => s.spot);

                    const getSlotInfo = (slotKey) => {
                      const key = slotKey?.toUpperCase() || '';
                      if (key.includes('MORNING') && !key.includes('CAFE')) {
                        return { label: language === 'vi' ? '☀️ Tham quan Sáng' : '☀️ Morning Sightseeing', icon: Sunrise, color: 'text-amber-500 bg-amber-50 border-amber-200' };
                      }
                      if (key.includes('CAFE')) {
                        return { label: language === 'vi' ? '☕ Cà phê & Thư giãn' : '☕ Coffee & Chill', icon: Compass, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
                      }
                      if (key.includes('LUNCH') || key.includes('FOOD')) {
                        return { label: language === 'vi' ? '🍴 Bữa trưa / Ẩm thực' : '🍴 Lunch / Local Taste', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' };
                      }
                      if (key.includes('AFTERNOON')) {
                        return { label: language === 'vi' ? '🌇 Tham quan Chiều' : '🌇 Afternoon Sightseeing', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' };
                      }
                      if (key.includes('EVENING')) {
                        return { label: language === 'vi' ? '🏮 Hoạt động Tối' : '🏮 Evening Experience', icon: Moon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
                      }
                      return { label: language === 'vi' ? '📌 Trải nghiệm' : '📌 Activity', icon: Compass, color: 'text-gray-500 bg-gray-50 border-gray-200' };
                    };

                    return displaySlots.map((s, idx) => {
                      const item = s.spot;
                      if (!item) return null;
                      const { label, icon: Icon, color } = getSlotInfo(s.slot);
                      const isFocus = selectedSpot && selectedSpot.lat === item.lat && selectedSpot.lng === item.lng;
                      const delay = `[animation-delay:${200 + idx * 100}ms]`;
                      const timeStr = s.time ? s.time : (language === 'vi' ? 'Lịch trình dự kiến' : 'Estimated schedule');

                      return (
                        <div 
                          key={`${s.slot}-${idx}`} 
                          onClick={() => setSelectedSpot(item)}
                          className={`relative flex gap-4 bg-white border p-4 rounded-2xl group hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer shimmer-trigger animate-fade-in-up ${delay} ${
                            isFocus 
                              ? 'border-heritage-amber ring-2 ring-heritage-amber/20 scale-[1.01]' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Timeline node */}
                          <div className="flex flex-col items-center relative z-10">
                            <div className={`p-2 rounded-xl border ${color} flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="w-0.5 h-full bg-gray-150 mt-2 group-last:hidden" />
                          </div>

                          {/* Content */}
                          <div className="flex-grow relative z-10">
                            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              <span>{label}</span>
                              <span className="text-[10px] text-gray-500 font-semibold">{timeStr}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2 mt-1">
                              <h4 className={`font-outfit text-sm font-bold transition-colors ${
                                isFocus ? 'text-heritage-amber font-extrabold' : 'text-gray-900 group-hover:text-heritage-amber'
                              }`}>
                                {item.name?.[language] || 'Địa điểm tham quan'}
                              </h4>
                              <span className="text-xs font-extrabold text-heritage-amber flex-shrink-0">
                                {(item.cost || 0) > 0 ? `${(item.cost || 0).toLocaleString()}đ` : t('free')}
                              </span>
                            </div>

                            <p className="text-[10.5px] text-gray-500 leading-relaxed mt-1 flex items-start gap-1">
                              <Info className="w-3.5 h-3.5 text-ricefield-green flex-shrink-0 mt-0.5" />
                              <span>{item.reason?.[language] || 'Điểm check-in độc đáo thú vị.'}</span>
                            </p>

                            {/* Interchange actions */}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                              <span className="text-[10px] text-gray-400 font-semibold">{t('quickActions')}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSwapSpot(activeDay - 1, s.slot);
                                }}
                                className="text-[10px] hover:text-heritage-amber text-gray-500 flex items-center gap-1 transition-colors cursor-pointer font-bold border-none bg-transparent"
                              >
                                <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                {t('swapSpot')}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Costs Breakdown & Dynamic Google Maps Sidebar Column */}
                <div className="md:col-span-5 flex flex-col gap-6 animate-fade-in-up [animation-delay:250ms]">
                  
                  {/* Dynamic Google Map Routing Card - Apple Shimmer */}
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 relative z-10">
                      <h3 className="font-outfit text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-heritage-amber animate-float" />
                        {t('mapTitle')}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {/* FULLSCREEN MAP TRIGGER BUTTON */}
                        <button
                          onClick={() => setIsMapMaximized(true)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-heritage-amber rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                          title={t('mapMaximize')}
                        >
                          <Maximize2 className="w-4 h-4 hover:scale-110 transition-transform duration-300" />
                        </button>
                        {isLocating && (
                          <span className="text-[9px] bg-amber-50 text-heritage-amber border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <Compass className="w-3 h-3 animate-spin-slow" />
                            GPS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Geolocation Warning alert */}
                    {isFarAway && (
                      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-[10px] text-amber-700 leading-normal flex items-start gap-2 relative z-10 animate-fade-in">
                        <Info className="w-4 h-4 text-heritage-amber flex-shrink-0 mt-0.5 animate-bounce" />
                        <span>{t('mapFarAwayWarning')}</span>
                      </div>
                    )}

                    {/* Google Maps embed Frame */}
                    <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200/80 shadow-inner relative bg-gray-50 z-10">
                      <iframe 
                        title="Google Map Route"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0 }}
                        src={getMapEmbedUrl()} 
                        allowFullScreen
                      />
                    </div>

                    {/* Active Target Info bar */}
                    {selectedSpot && (
                      <div className="flex flex-col bg-gray-50/50 p-3 rounded-xl border border-gray-100 gap-2 relative z-10">
                        <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">{t('mapRouteTo')}:</span>
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-ricefield-green animate-pulse" />
                          {selectedSpot.name[language]}
                        </span>
                        
                        {/* Dynamic travel distances & durations */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="bg-white p-2 rounded-lg border border-gray-150 flex flex-col justify-center items-center hover:scale-102 transition-transform">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">{t('mapDistance')}</span>
                            <span className="text-sm font-extrabold text-heritage-amber">{routeMetrics.distance} km</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-gray-150 flex flex-col justify-center items-center hover:scale-102 transition-transform">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">{t('mapDuration')}</span>
                            <span className="text-sm font-extrabold text-ricefield-green">~{routeMetrics.duration} {language === 'vi' ? 'phút' : 'min'}</span>
                          </div>
                        </div>

                        {/* Transport mode selectors */}
                        <div className="flex gap-1.5 justify-between items-center mt-2 border-t border-gray-150 pt-2.5">
                          <span className="text-[9px] text-gray-400 uppercase font-bold">{language === 'vi' ? 'Phương tiện' : 'Transport'}:</span>
                          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            {[
                              { mode: 'foot', icon: Footprints, label: t('mapFoot') },
                              { mode: 'bike', icon: Bike, label: t('mapBike') },
                              { mode: 'motorbike', icon: Compass, label: t('mapMotorbike') },
                              { mode: 'car', icon: Car, label: t('mapCar') }
                            ].map((item) => {
                              const ActiveIcon = item.icon;
                              return (
                                <button
                                  key={item.mode}
                                  onClick={() => setTransportMode(item.mode)}
                                  title={item.label}
                                  className={`p-1.5 rounded-md cursor-pointer transition-colors border-none ${
                                    transportMode === item.mode 
                                      ? 'bg-white text-heritage-amber shadow-sm font-bold scale-102' 
                                      : 'text-gray-400 hover:text-gray-600 bg-transparent'
                                  }`}
                                >
                                  <ActiveIcon className="w-3.5 h-3.5" />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Direct maximize trigger instead of external redirect */}
                        <button 
                          onClick={() => setIsMapMaximized(true)}
                          className="w-full mt-2 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-[10.5px] rounded-xl flex items-center justify-center gap-1 text-center cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] border-none"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          {t('mapMaximize')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Financial analysis - Apple Shimmer */}
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-6 h-fit shadow-sm shimmer-trigger">
                    <h3 className="font-outfit text-base font-bold text-gray-900 border-b border-gray-100 pb-2 relative z-10">
                      {t('financialAnalysis')}
                    </h3>

                    {/* Progress Bars */}
                    <div className="flex flex-col gap-4 relative z-10">
                      {[
                        { name: t('costsAccommodation'), value: costs.accommodation, color: 'bg-indigo-600' },
                        { name: t('costsFood'), value: costs.food, color: 'bg-heritage-amber' },
                        { name: t('costsActivities'), value: costs.activities, color: 'bg-ricefield-green' },
                        { name: t('costsTransport'), value: costs.transport, color: 'bg-gray-400' }
                      ].map((cat) => {
                        const pct = costs.total > 0 ? (cat.value / costs.total) * 100 : 0;
                        return (
                          <div key={cat.name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10.5px] font-bold text-gray-500">
                              <span>{cat.name}</span>
                              <span className="text-gray-900 font-extrabold">{pct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                              <div 
                                className={`h-full ${cat.color} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 text-right font-semibold">{cat.value.toLocaleString()}đ</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 relative z-10">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('advisorTitle')}</span>
                      <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50 border border-gray-200 p-3.5 rounded-xl">
                        {balance < 0 
                          ? t('advisorOver')
                          : t('advisorUnder')
                        }
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
        <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
          <h3 className="font-outfit text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
            🎒 {language === 'vi' ? 'Lịch trình bạn đã lưu' : 'Your Saved Itineraries'}
          </h3>

          {!currentUser && (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <span className="text-4xl">🔑</span>
              <p className="text-sm font-semibold text-gray-500">
                {language === 'vi' ? 'Vui lòng đăng nhập để xem lịch trình đã lưu của bạn!' : 'Please login to view your saved itineraries!'}
              </p>
            </div>
          )}

          {currentUser && savedItineraries.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
              <Calendar className="w-8 h-8 text-gray-300 animate-float" />
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {language === 'vi' ? 'Chưa có lịch trình nào được lưu!' : 'No itineraries saved yet!'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'vi' ? 'Hãy dùng tính năng Sinh Lịch Trình AI và bấm Lưu để lưu giữ kỷ niệm.' : 'Generate a trip with AI and save it to cloud.'}
                </p>
              </div>
              <button
                onClick={() => setActivePlannerTab('studio')}
                className="mt-2 px-4 py-2 bg-heritage-amber text-white rounded-xl text-xs font-bold border-none hover:bg-heritage-gold cursor-pointer transition-colors"
              >
                {language === 'vi' ? 'Trải nghiệm sinh ngay' : 'Try AI Planner'}
              </button>
            </div>
          )}

          {currentUser && savedItineraries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedItineraries.map((saved) => (
                <div
                  key={saved.id}
                  onClick={() => handleLoadSaved(saved)}
                  className="group border border-gray-200 hover:border-heritage-amber hover:shadow-md bg-white p-5 rounded-2xl flex flex-col gap-4 transition-all duration-300 cursor-pointer relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-outfit font-extrabold text-base text-gray-900 group-hover:text-heritage-gold transition-colors">
                        {saved.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                        📅 {language === 'vi' ? 'Ngày lưu:' : 'Saved at:'} {new Date(saved.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSaved(saved.id, e)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                      title={language === 'vi' ? 'Xóa lịch trình' : 'Delete Itinerary'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{language === 'vi' ? 'Số ngày' : 'Days'}</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-0.5">{saved.totalDays} {language === 'vi' ? 'Ngày' : 'Days'}</span>
                    </div>
                    <div className="flex flex-col border-x border-gray-200">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{language === 'vi' ? 'Phong cách' : 'Style'}</span>
                      <span className="text-xs font-extrabold text-heritage-amber mt-0.5">{saved.travelStyle}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{language === 'vi' ? 'Chi phí' : 'Budget'}</span>
                      <span className="text-xs font-extrabold text-ricefield-green mt-0.5">{(saved.totalBudget / 1000000).toFixed(1)}M đ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end text-[10px] font-bold text-heritage-amber uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    <span>{language === 'vi' ? 'Mở lịch trình này' : 'Open this itinerary'}</span>
                    <span>➔</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Title Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-3xl p-6 flex flex-col gap-5 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="font-outfit text-base font-extrabold text-gray-900 flex items-center gap-2">
                💾 {language === 'vi' ? 'Đặt tên lịch trình' : 'Name Your Itinerary'}
              </h4>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {language === 'vi' ? 'Tên chuyến đi của bạn' : 'Your Journey Name'}
              </label>
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder={language === 'vi' ? 'Ví dụ: Kỷ niệm Hội An 3 Ngày Chữa Lành' : 'e.g. Beautiful Hoi An healing days'}
                className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-heritage-amber font-semibold text-gray-800"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl border-none cursor-pointer transition-colors"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveItinerary}
                disabled={isSaving}
                className="px-4 py-2 bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {language === 'vi' ? 'Lưu ngay' : 'Save now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IN-APP MAP MODAL VIEWER OVERLAY */}
      {isMapMaximized && itinerary && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
          <div className="bg-white border border-gray-200 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-heritage-amber text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/25 p-2 rounded-xl text-white animate-float">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-outfit text-sm sm:text-base font-extrabold tracking-tight">{t('mapTitle')}</h4>
                  <span className="block text-[10px] font-bold text-white/80 uppercase tracking-wider leading-none">
                    {selectedSpot ? selectedSpot.name[language] : ''}
                  </span>
                </div>
              </div>

              {/* Segmented Tab Control - visible ONLY on mobile screens */}
              <div className="flex sm:hidden bg-white/20 p-1 rounded-xl border border-white/10 w-fit self-center">
                <button
                  type="button"
                  onClick={() => setActiveModalView('map')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none ${
                    activeModalView === 'map' ? 'bg-white text-heritage-amber shadow-sm' : 'text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  {language === 'vi' ? 'Bản Đồ' : 'Map'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalView('details')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none ${
                    activeModalView === 'details' ? 'bg-white text-heritage-amber shadow-sm' : 'text-white hover:bg-white/5 bg-transparent'
                  }`}
                >
                  {language === 'vi' ? 'Chỉ dẫn & Mẹo' : 'Steps & Tips'}
                </button>
              </div>

              <button 
                onClick={() => setIsMapMaximized(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border-none bg-transparent text-white self-end sm:self-center"
              >
                <X className="w-5 h-5 text-white hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modal Body - Map Split Layout */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              {/* Actual Map frame - Shown on mobile if 'map' is active, always shown on md+ */}
              <div className={`flex-grow h-full bg-gray-50 ${activeModalView === 'map' ? 'flex' : 'hidden md:flex'}`}>
                <iframe 
                  title="Google Map Route Fullscreen animate"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0 }}
                  src={getMapEmbedUrl()} 
                  allowFullScreen
                />
              </div>

              {/* Details Side Navigation panel - Shown on mobile if 'details' is active, always shown on md+ */}
              <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col bg-white overflow-y-auto p-5 gap-5 animate-slide-in-right ${activeModalView === 'details' ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('mapRouteTo')}:</span>
                  <h3 className="font-outfit text-base font-bold text-gray-900">{selectedSpot ? selectedSpot.name[language] : ''}</h3>
                  {selectedSpot && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-heritage-amber font-bold">
                      <Star className="w-3.5 h-3.5 fill-heritage-gold text-heritage-gold" />
                      <span>{selectedSpot.rating || '4.8'} (215 {language === 'vi' ? 'đánh giá' : 'reviews'})</span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 flex flex-col items-center justify-center hover:scale-102 transition-transform">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase">{t('mapDistance')}</span>
                    <span className="text-base font-extrabold text-heritage-amber mt-1">{routeMetrics.distance} km</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 flex flex-col items-center justify-center hover:scale-102 transition-transform">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase">{t('mapDuration')}</span>
                    <span className="text-base font-extrabold text-ricefield-green mt-1">~{routeMetrics.duration} {language === 'vi' ? 'phút' : 'min'}</span>
                  </div>
                </div>

                {/* Select Transport */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Phương tiện di chuyển' : 'Select Transport'}:</span>
                  <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    {[
                      { mode: 'foot', icon: Footprints, label: t('mapFoot') },
                      { mode: 'bike', icon: Bike, label: t('mapBike') },
                      { mode: 'motorbike', icon: Compass, label: t('mapMotorbike') },
                      { mode: 'car', icon: Car, label: t('mapCar') }
                    ].map((item) => {
                      const ActiveIcon = item.icon;
                      return (
                        <button
                          key={item.mode}
                          onClick={() => setTransportMode(item.mode)}
                          className={`py-2 rounded-lg cursor-pointer transition-all duration-300 border-none flex items-center justify-center ${
                            transportMode === item.mode 
                              ? 'bg-white text-heritage-amber shadow-sm font-bold scale-102' 
                              : 'text-gray-400 hover:text-gray-600 bg-transparent'
                          }`}
                          title={item.label}
                        >
                          <ActiveIcon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed route steps */}
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{t('mapStepsTitle')}:</span>
                  <div className="flex flex-col gap-4 text-xs text-gray-600">
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</div>
                      <p className="leading-relaxed font-semibold">{t('mapStepDepart')}</p>
                    </div>
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-ricefield-green/10 border border-ricefield-green/30 text-ricefield-green flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</div>
                      <p className="leading-relaxed font-semibold">
                        {t('mapStepFollow')} <strong className="text-gray-900">{selectedSpot ? selectedSpot.name[language] : ''}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Local guide tips */}
                <div className="mt-auto p-4 bg-green-50/50 border border-green-200 rounded-2xl flex flex-col gap-1.5 animate-pulse">
                  <span className="text-[9px] text-ricefield-green font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Mẹo Bản Địa' : 'Local Tip'}</span>
                  <p className="text-[11px] text-gray-600 leading-normal italic font-semibold">
                    {t('mapStepTip')}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
