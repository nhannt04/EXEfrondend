import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, DollarSign, Users, Award, ShieldAlert, Check, RefreshCw, Star, Info, Moon, Sun, Sunrise, MapPin, Navigation, Compass, Footprints, Bike, Car, X, Maximize2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import tripService from '../../../services/tripService';

const SPOTS_DATABASE = {
  Homestay: {
    Healing: {
      name: { vi: 'Little Pie Homestay', en: 'Little Pie Homestay' },
      cost: 450000,
      lat: 15.8821,
      lng: 108.3371,
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Bình yên, có vườn tranh tre truyền thống rất thích hợp để tĩnh dưỡng.',
        en: 'Peaceful nooks featuring traditional bamboo gardens. Great for wellness retreats.'
      }
    },
    'Ẩm thực': {
      name: { vi: 'Thanh Binh Riverside Hotel', en: 'Thanh Binh Riverside Hotel' },
      cost: 950000,
      lat: 15.8768,
      lng: 108.3235,
      img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Nằm ngay sát sông Hoài, đi bộ 3 phút tới ngay chợ đêm ăn vặt.',
        en: 'Located right next to Hoai River. A 3-minute stroll takes you to the night food market.'
      }
    },
    'Khám phá': {
      name: { vi: 'Vinh Hung Heritage Hotel', en: 'Vinh Hung Heritage Hotel' },
      cost: 1200000,
      lat: 15.8775,
      lng: 108.3262,
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Ngôi nhà cổ hơn 100 năm tuổi phong cách di sản độc đáo.',
        en: 'A historic merchant house with over 100 years of living heritage and unique local style.'
      }
    },
    'Nghỉ dưỡng': {
      name: { vi: 'An Villa Hoi An Resort', en: 'An Villa Hoi An Resort' },
      cost: 2400000,
      lat: 15.8892,
      lng: 108.3512,
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Resort khép kín biệt lập sang trọng, có hồ bơi sinh thái mộc mạc.',
        en: 'Secluded premium boutique resort featuring a natural ecological swimming pool.'
      }
    },
    LuxurySwap: {
      name: { vi: 'Four Seasons The Nam Hai', en: 'Four Seasons The Nam Hai' },
      cost: 7500000,
      lat: 15.9189,
      lng: 108.3235,
      img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Đẳng cấp nghỉ dưỡng 5 sao quốc tế, ngắm hoàng hôn siêu đỉnh.',
        en: 'Five-star ultra-luxury oceanfront experience. World-class sunset views.'
      }
    }
  },
  Cafe: [
    {
      name: { vi: 'FeFe Coffee', en: 'FeFe Coffee' },
      cost: 45000,
      lat: 15.8835,
      lng: 108.3421,
      img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Cafe hạt local tự rang củi thủ công cực thơm, ẩn giữa đồng lúa.',
        en: 'Locally grown beans wood-roasted on-site, hidden deep in Cam Chau green fields.'
      }
    },
    {
      name: { vi: 'Faifo Coffee', en: 'Faifo Coffee' },
      cost: 65000,
      lat: 15.8773,
      lng: 108.3281,
      img: 'https://images.unsplash.com/photo-1463797900201-d172f2360243?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Góc ban công ngắm toàn cảnh mái ngói rêu phong Phố cổ cực hot.',
        en: 'Famous rooftop spot providing panoramic views over the historic terracotta roofs.'
      }
    },
    {
      name: { vi: 'Reaching Out Teahouse', en: 'Reaching Out Teahouse' },
      cost: 85000,
      lat: 15.8770,
      lng: 108.3275,
      img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Trà đạo yên tĩnh tuyệt đối do các bạn khiếm thính phục vụ, cực kỳ healing.',
        en: 'A completely silent oasis of tea served elegantly by hearing-impaired staff.'
      }
    }
  ],
  Food: [
    {
      name: { vi: 'Cơm Gà Bà Buội', en: 'Ba Buoi Chicken Rice' },
      cost: 55000,
      lat: 15.8779,
      lng: 108.3292,
      img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Cơm gà xé truyền thống chuẩn vị Hội An, nước sốt lòng đậm đà.',
        en: 'Traditional hand-shredded chicken rice with a secret, rich giblet gravy.'
      }
    },
    {
      name: { vi: 'Bánh Mì Phượng', en: 'Phuong Bread' },
      cost: 35000,
      lat: 15.8774,
      lng: 108.3312,
      img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Bánh mì ngon nhất thế giới do Anthony Bourdain khen ngợi, vỏ giòn pate béo ngậy.',
        en: 'Globally praised crunchy baguettes stuffed with rich local pâté and savory meats.'
      }
    },
    {
      name: { vi: "Vy's Market Restaurant", en: "Vy's Market Restaurant" },
      cost: 180000,
      lat: 15.8761,
      lng: 108.3228,
      img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Nhà hàng buffet món ăn dân dã Việt Nam, tái hiện chợ ẩm thực truyền thống.',
        en: 'Vibrant indoor food market displaying dozens of live-cooking authentic street eats.'
      }
    },
    {
      name: { vi: 'Morning Glory Signature', en: 'Morning Glory Signature' },
      cost: 450000,
      lat: 15.8765,
      lng: 108.3255,
      img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Nhà hàng sang trọng ven sông Hoài chuyên ẩm thực Hội An nâng tầm cao cấp.',
        en: 'High-end riverside restaurant serving refined versions of traditional Hoi An classics.'
      }
    }
  ],
  Activity: [
    {
      name: { vi: 'Đi thuyền thả hoa đăng sông Hoài', en: 'Hoai River Lantern Boat Ride' },
      cost: 50000,
      lat: 15.8763,
      lng: 108.3248,
      img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Trải nghiệm tâm linh, ngắm phố hội lung linh đèn lồng trôi trên mặt nước.',
        en: 'Float lanterns on the river while taking in the candle-lit historic views.'
      }
    },
    {
      name: { vi: 'Workshop tự tay làm Đèn Lồng', en: 'Handmade Lantern Craft Workshop' },
      cost: 150000,
      lat: 15.8788,
      lng: 108.3325,
      img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Được nghệ nhân hướng dẫn tỉ mỉ xếp tre dán lụa tạo ra đèn lồng của riêng mình.',
        en: 'Under professional guidance, bend bamboo frames and glue silk to construct a lantern.'
      }
    },
    {
      name: { vi: 'Trải nghiệm Rừng dừa Bảy Mẫu thúng xoay', en: 'Bay Mau Nipa Palm Basket Boat Spin' },
      cost: 120000,
      lat: 15.8675,
      lng: 108.3685,
      img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Vui nhộn và tràn ngập năng lượng khi chèo thúng đung đưa giữa rừng dừa ngập mặn.',
        en: 'Vibrant, high-energy basket boat spinning and fishing inside mangrove waterways.'
      }
    },
    {
      name: { vi: 'Cham Island Snorkeling Tour', en: 'Cham Island Snorkeling Tour' },
      cost: 850000,
      lat: 15.8725,
      lng: 108.3850,
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80',
      reason: {
        vi: 'Tour cano cao tốc lặn biển ngắm san hô đảo Cù Lao Chàm tuyệt đẹp.',
        en: 'Speedboat tour to Cham Island for rich coral diving, pristine beaches and fresh catches.'
      }
    }
  ]
};

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
          const morningSpot = d.spots.find(s => s.slot === 'MORNING')?.spot;
          const afternoonSpot = d.spots.find(s => s.slot === 'AFTERNOON')?.spot;
          const eveningSpot = d.spots.find(s => s.slot === 'EVENING')?.spot;

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
            morning: mapBackendSpotToFrontend(morningSpot),
            afternoon: mapBackendSpotToFrontend(afternoonSpot),
            evening: mapBackendSpotToFrontend(eveningSpot)
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

  const handleSwapSpot = (dayIndex, slot) => {
    if (!itinerary) return;
    
    const nextItinerary = [...itinerary];
    const targetSlot = nextItinerary[dayIndex][slot];
    
    let newSpot;
    if (slot === 'morning') {
      const items = SPOTS_DATABASE.Cafe.filter(c => c.name[language] !== targetSlot.name[language]);
      newSpot = items[Math.floor(Math.random() * items.length)];
    } else if (slot === 'afternoon') {
      const items = SPOTS_DATABASE.Activity.filter(a => a.name[language] !== targetSlot.name[language]);
      newSpot = items[Math.floor(Math.random() * items.length)];
    } else {
      const items = SPOTS_DATABASE.Food.filter(f => f.name[language] !== targetSlot.name[language]);
      newSpot = items[Math.floor(Math.random() * items.length)];
    }
    
    const swaped = { ...newSpot };
    nextItinerary[dayIndex][slot] = swaped;
    setItinerary(nextItinerary);

    if (selectedSpot && selectedSpot.lat === targetSlot.lat && selectedSpot.lng === targetSlot.lng) {
      setSelectedSpot(swaped);
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
      if (d.morning) {
        foodCost += (d.morning.cost || 0) * (adults + children);
      }
      if (d.evening) {
        foodCost += (d.evening.cost || 0) * (adults + children);
      }
      if (d.afternoon) {
        actCost += (d.afternoon.cost || 0) * (adults + children);
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

                <div className="flex justify-end relative z-10">
                  {isOverBudget ? (
                    <button
                      onClick={handleOptimizeBudget}
                      disabled={optimizing}
                      className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-tr from-heritage-amber to-heritage-gold text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 animate-pulse-gold hover:scale-[1.03] active:scale-95 transition-transform duration-300 shadow-md cursor-pointer border-none"
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
                  {[
                    { slot: 'morning', label: t('morning'), icon: Sunrise, color: 'text-amber-500 bg-amber-50 border-amber-200', delay: '[animation-delay:200ms]' },
                    { slot: 'afternoon', label: t('afternoon'), icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200', delay: '[animation-delay:300ms]' },
                    { slot: 'evening', label: t('evening'), icon: Moon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', delay: '[animation-delay:400ms]' }
                  ].map(({ slot, label, icon: Icon, color, delay }) => {
                    const item = itinerary[activeDay - 1][slot];
                    if (!item) return null;
                    const isFocus = selectedSpot && selectedSpot.lat === item.lat && selectedSpot.lng === item.lng;
                    return (
                      <div 
                        key={slot} 
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
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
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
                                handleSwapSpot(activeDay - 1, slot);
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
                  })}
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
