import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, MapPin, Star, ShieldAlert, CalendarDays, Plane, Map, Users, ThumbsUp, ThumbsDown, ArrowRight, Clock, Gem } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import spotService from '../../../services/spotService';
import diaryService from '../../../services/diaryService';
import cafeVideo from '../../../assets/cafe.mp4';
import homestayVideo from '../../../assets/vuichoi.mp4';
import foodVideo from '../../../assets/monan.mp4';
import stayVideo from '../../../assets/homestay.mp4';
import heroBackground from '../../../assets/backgroud.png';

const AutoScrollCarousel = ({ spots, language, onSpotClick }) => {
  const scrollRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (isHovered || !spots || spots.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const firstChild = container.children[0];
        if (!firstChild) return;
        const scrollAmount = firstChild.offsetWidth + 16;
        
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, spots]);

  return (
    <div className="w-full md:w-[70%] overflow-hidden relative flex items-center bg-gray-50/60 rounded-2xl py-5 px-2">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        {spots.map((spot, idx) => (
          <div
            key={`${spot.id}-${idx}`}
            className="flex-shrink-0 snap-start flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden w-[240px] md:min-w-[340px] md:max-w-[360px] hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300"
          >
            <div
              className="h-40 md:h-56 w-full overflow-hidden relative cursor-pointer"
              onClick={() => onSpotClick(spot)}
            >
              <img
                src={spot.image}
                alt={spot.name[language]}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-heritage-amber text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {spot.tag}
              </span>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-grow gap-2 md:gap-3">
              <div className="cursor-pointer" onClick={() => onSpotClick(spot)}>
                <h4 className="text-base md:text-lg font-black text-gray-900 line-clamp-1 leading-snug">
                  {spot.name[language]}
                </h4>
                <div className="text-xs sm:text-sm text-gray-700 flex flex-col gap-1.5 mt-2 leading-relaxed font-bold">
                  {spot.desc[language]
                    ? spot.desc[language]
                      .split(/[.\n;]+/)
                      .map(s => s.trim())
                      .filter(s => s.length > 0)
                      .slice(0, 3)
                      .map((sentence, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-heritage-amber text-sm select-none mt-0.5">•</span>
                          <span className="line-clamp-2 leading-snug">{sentence}</span>
                        </div>
                      ))
                    : null}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-amber-100 pt-3 bg-amber-50/60 -mx-4 md:-mx-5 px-4 md:px-5 pb-3">
                <span className="text-[11px] text-amber-600 font-black uppercase tracking-wider">{language === 'vi' ? 'Giá' : 'Price'}</span>
                <span className="text-heritage-amber text-sm md:text-base font-black">{spot.price[language]}</span>
              </div>
              <button
                onClick={() => onSpotClick(spot)}
                className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border-none py-3 -mx-4 md:-mx-5 -mb-4 md:-mb-5 mt-2"
                style={{ borderRadius: '0 0 1rem 1rem' }}
              >
                {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function LandingPage({ activeTab, setActiveTab, setPlannerPrefill }) {
  const { language, t } = useLanguage();
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5);
  const [style, setStyle] = useState('Healing');

  // Featured spots + filter
  const [allFeaturedSpots, setAllFeaturedSpots] = useState([]);
  const [spots, setSpots] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [categorySpots, setCategorySpots] = useState({ sightseeing: [], cafe: [], food: [], stay: [], entertainment: [] });
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [selectedSpotDetail, setSelectedSpotDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const spotsPerPage = 4;
  const [topCommunityPosts, setTopCommunityPosts] = useState([]);

  // Reset showAllCategory list view when switching to 'home' tab from header logo or bottom navbar
  useEffect(() => {
    if (activeTab === 'home') {
      setShowAllCategory(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResetCategories = () => {
      setShowAllCategory(null);
    };
    window.addEventListener('reset-homepage-categories', handleResetCategories);
    return () => {
      window.removeEventListener('reset-homepage-categories', handleResetCategories);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'home') return;
    const fetchTopPosts = async () => {
      try {
        const response = await diaryService.getDiaries();
        if (response && response.success && response.data && response.data.length > 0) {
          // Sort by likesCount descending, take top 5
          const sorted = [...response.data].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
          setTopCommunityPosts(sorted.slice(0, 5));
        }
      } catch (e) {
        console.warn("Failed to fetch top community posts:", e);
      }
    };
    fetchTopPosts();
  }, [activeTab]);

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.dispatchEvent(new Event('auth-required')); return; }
    setTopCommunityPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isLiked = p.myReaction === 'LIKE';
      return {
        ...p,
        likesCount: Math.max(0, (p.likesCount || 0) + (isLiked ? -1 : 1)),
        dislikesCount: p.myReaction === 'DISLIKE' ? Math.max(0, (p.dislikesCount || 0) - 1) : (p.dislikesCount || 0),
        myReaction: isLiked ? null : 'LIKE'
      };
    }));
    try { await diaryService.likeDiary(postId, 'LIKE'); } catch (e) { console.error(e); }
  };

  const handleDislikePost = async (postId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.dispatchEvent(new Event('auth-required')); return; }
    setTopCommunityPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isDisliked = p.myReaction === 'DISLIKE';
      return {
        ...p,
        dislikesCount: Math.max(0, (p.dislikesCount || 0) + (isDisliked ? -1 : 1)),
        likesCount: p.myReaction === 'LIKE' ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0),
        myReaction: isDisliked ? null : 'DISLIKE'
      };
    }));
    try { await diaryService.likeDiary(postId, 'DISLIKE'); } catch (e) { console.error(e); }
  };



  const FILTERS = [
    { key: 'all', labelVi: 'Tất cả', labelEn: 'All' },
    { key: 'sightseeing', labelVi: 'Tham quan', labelEn: 'Sightseeing' },
    { key: 'food', labelVi: 'Ẩm thực', labelEn: 'Food' },
    { key: 'cafe', labelVi: 'Cà phê', labelEn: 'Cafe' },
    { key: 'stay', labelVi: 'Nghỉ dưỡng', labelEn: 'Stay' },
    { key: 'entertainment', labelVi: 'Khu vui chơi', labelEn: 'Entertainment' },
  ];

  const CATEGORY_LABELS = {
    sightseeing: { vi: '🏛️ Di sản & Tham quan', en: '🏛️ Sightseeing & Heritage' },
    entertainment: { vi: 'Khu vui chơi giải trí', en: 'Entertainment & Play' },
    stay: { vi: 'Nghỉ dưỡng & Healing', en: 'Stay & Healing' },
    cafe: { vi: 'Cafe', en: 'Cafe' },
    food: { vi: 'Ẩm thực đặc sản', en: 'Local Food' },
  };

  // Radar scanner states
  const [radarRadius, setRadarRadius] = useState(5);
  const [scanning, setScanning] = useState(false);
  const [radarResults, setRadarResults] = useState([]);
  const [radarError, setRadarError] = useState(null); // null | 'timeout' | 'error'
  const [geolocating, setGeolocating] = useState(false);
  const [showAllCategory, setShowAllCategory] = useState(null); // null | 'cafe' | 'entertainment' | 'food' | 'stay'
  const [savedScrollY, setSavedScrollY] = useState(0);
  const [cafeSearchQuery, setCafeSearchQuery] = useState('');

  // Intersection Observer for Scroll Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [allFeaturedSpots, spots, categorySpots, topCommunityPosts, showAllCategory, activeFilter]);

  useEffect(() => {
    if (!showAllCategory && savedScrollY > 0) {
      setTimeout(() => {
        window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
      }, 50);
    }
  }, [showAllCategory, savedScrollY]);

  // User Real Location from Geolocation API (fallback to Hoi An if not available)
  const [userLat, setUserLat] = useState(15.8771);
  const [userLng, setUserLng] = useState(108.3267);

  // Get user's real location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          setGeolocating(false);
          console.log('Location detected:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation error, using default Hoi An coordinates:', error.message);
          setGeolocating(false);
          // Keep default Hoi An coordinates
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const mapSpot = (s) => {
    const isEnt = (s.id >= 400000 && s.id < 500000) || s.category === 'entertainment';
    return {
      id: s.id,
      raw: s,
      lat: s.latitude,
      lng: s.longitude,
      name: { vi: s.nameVi, en: s.nameEn },
      category: {
        vi: isEnt ? 'Khu vui chơi' : s.category === 'sightseeing' ? 'Tham quan' : s.category === 'cafe' ? 'Cà phê' : s.category === 'stay' ? 'Nghỉ dưỡng' : 'Ẩm thực',
        en: isEnt ? 'Entertainment' : s.category
      },
      image: (s.images && s.images.length > 0) ? s.images[0].imageUrl : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
      tag: s.tags ? s.tags.split(',')[0].trim() : s.category,
      price: {
        vi: (s.minCost > 0 || s.maxCost > 0) ? (s.minCost === s.maxCost ? `${(s.minCost).toLocaleString()}đ` : `${(s.minCost).toLocaleString()}đ - ${(s.maxCost).toLocaleString()}đ`) : 'Miễn phí',
        en: (s.minCost > 0 || s.maxCost > 0) ? (s.minCost === s.maxCost ? `${(s.minCost).toLocaleString()}đ` : `${(s.minCost).toLocaleString()}đ - ${(s.maxCost).toLocaleString()}đ`) : 'Free'
      },
      desc: { vi: s.descriptionVi || '', en: s.descriptionEn || '' },
    };
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingSpots(true);
      try {
        // 1. Featured spots (fetch 48 to ensure variety in the marquee)
        const res = await spotService.getFeaturedSpots(48);
        if (res?.success && res.data.length > 0) {
          const mapped = res.data.map(mapSpot);

          // Group by categories for interleaving
          const foodSpots = mapped.filter(s => s.raw.category === 'food');
          const cafeSpots = mapped.filter(s => s.raw.category === 'cafe');
          const staySpots = mapped.filter(s => s.raw.category === 'stay');
          const entSpots = mapped.filter(s => (s.id >= 400000 && s.id < 500000) || s.raw.category === 'entertainment');
          const sightSpots = mapped.filter(s => s.raw.category === 'sightseeing' && !(s.id >= 400000 && s.id < 500000));

          // Interleave: Food -> Entertainment -> Cafe -> Stay -> Sightseeing
          const interleaved = [];
          const maxLength = Math.max(foodSpots.length, entSpots.length, cafeSpots.length, staySpots.length, sightSpots.length);
          for (let i = 0; i < maxLength; i++) {
            if (i < foodSpots.length) interleaved.push(foodSpots[i]);
            if (i < entSpots.length) interleaved.push(entSpots[i]);
            if (i < cafeSpots.length) interleaved.push(cafeSpots[i]);
            if (i < staySpots.length) interleaved.push(staySpots[i]);
            if (i < sightSpots.length) interleaved.push(sightSpots[i]);
          }

          setAllFeaturedSpots(interleaved);
          setSpots(interleaved);
        }
        // 2. Fetch ALL spots for cafe & entertainment marquees; top 4 only for food/stay grids
        const [cafeRes, sightRes, foodRes, stayRes] = await Promise.all([
          spotService.getSpots('cafe'),          // ALL cafe spots
          spotService.getSpots('sightseeing'),   // ALL sightseeing (entertainment filtered from here)
          spotService.getSpots('food'),          // ALL food spots
          spotService.getSpots('stay'),          // ALL stay spots
        ]);

        const newCatSpots = {
          cafe: cafeRes?.success ? cafeRes.data.map(mapSpot) : [],
          food: foodRes?.success ? foodRes.data.map(mapSpot) : [],
          stay: stayRes?.success ? stayRes.data.map(mapSpot) : [],
          sightseeing: [],
          entertainment: [],
        };

        const allSightseeing = sightRes?.success ? sightRes.data.map(mapSpot) : [];
        newCatSpots['sightseeing'] = allSightseeing.filter(s => !(s.id >= 400000 && s.id < 500000)).slice(0, 4);
        newCatSpots['entertainment'] = allSightseeing.filter(s => (s.id >= 400000 && s.id < 500000)); // ALL, no slice

        setCategorySpots(newCatSpots);
      } catch (err) {
        console.error('Could not load spots:', err);
      } finally {
        setLoadingSpots(false);
      }
    };
    fetchAll();
  }, []);

  // Filter featured spots client-side or fetch by category from API
  useEffect(() => {
    const filterSpots = async () => {
      setCurrentPage(1);
      if (activeFilter === 'all') {
        setSpots(allFeaturedSpots);
      } else {
        try {
          const apiCategory = activeFilter === 'entertainment' ? 'sightseeing' : activeFilter;
          const res = await spotService.getSpots(apiCategory);
          if (res?.success && res.data) {
            let mapped = res.data.map(mapSpot);
            if (activeFilter === 'sightseeing') {
              mapped = mapped.filter(s => !(s.id >= 400000 && s.id < 500000));
            } else if (activeFilter === 'entertainment') {
              mapped = mapped.filter(s => (s.id >= 400000 && s.id < 500000));
            }
            setSpots(mapped);
          } else {
            setSpots([]);
          }
        } catch (err) {
          console.error('Error fetching filtered spots:', err);
          setSpots([]);
        }
      }
    };
    filterSpots();
  }, [activeFilter, allFeaturedSpots]);

  const handleRadarScan = async () => {
    // Request fresh location before scanning
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          await performRadarScan(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Could not get fresh location, using last known:', error.message);
          performRadarScan(userLat, userLng);
        }
      );
    } else {
      performRadarScan(userLat, userLng);
    }
  };

  const performRadarScan = async (lat, lng) => {
    setScanning(true);
    setRadarResults([]);
    setRadarError(null);
    try {
      const response = await spotService.getNearbySpots(lat, lng, radarRadius);
      if (response && response.success) {
        setRadarResults(response.data);
      }
    } catch (err) {
      console.warn("Radar scan error:", err);
      // Detect timeout vs other errors — show inline friendly messages instead of blocking alert()
      const isTimeout = err?.code === 'ECONNABORTED' || (err?.message || '').toLowerCase().includes('timeout');
      setRadarError(isTimeout ? 'timeout' : 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleQuickStart = () => {
    setPlannerPrefill({
      days,
      budget: budget * 1000000,
      style
    });
    setActiveTab('planner');
  };

  const handleSelectSpot = (spotStyle) => {
    const cleanStyle = spotStyle.split(' / ')[0];
    setPlannerPrefill({
      days: 3,
      budget: 4000000,
      style: cleanStyle
    });
    setActiveTab('planner');
  };

  const renderFormattedDescription = (descText) => {
    if (!descText) return null;
    const sentences = descText
      .split(/[.\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return (
      <div className="flex flex-col gap-1 bg-gray-50 p-4.5 rounded-2xl border border-gray-150 shadow-inner">
        {sentences.map((sentence, index) => {
          if (sentence.includes(':')) {
            const [key, ...valueParts] = sentence.split(':');
            const value = valueParts.join(':').trim();
            return (
              <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0 text-sm">
                <span className="font-bold text-gray-700 sm:w-28 flex-shrink-0">{key.trim()}</span>
                <span className="text-gray-600 leading-relaxed flex-grow font-medium">{value}</span>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-start gap-2 py-1.5 text-sm text-gray-650 leading-relaxed font-medium">
              <span className="text-heritage-amber text-xs select-none mt-1">✦</span>
              <span>{sentence}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (showAllCategory) {
    const catLabels = {
      sightseeing: {
        titleVi: 'Di sản & Tham quan',
        titleEn: 'Sightseeing & Heritage',
        descVi: 'Danh sách các địa danh tham quan cổ kính, mang đậm giá trị văn hóa và lịch sử.',
        descEn: 'List of ancient landmarks and historical heritage spots.'
      },
      cafe: {
        titleVi: 'Cafe',
        titleEn: 'Cafe',
        descVi: 'Danh sách đầy đủ các quán cà phê mang không gian mộc mạc, tinh tế và đầy chất thơ của Hội An.',
        descEn: 'Full list of rustic, poetic, and refined cafes in Hoi An Ancient Town.'
      },
      entertainment: {
        titleVi: 'Khu vui chơi giải trí',
        titleEn: 'Entertainment & Play',
        descVi: 'Danh sách đầy đủ các khu vui chơi, giải trí đặc sắc mang đậm văn hóa và sức sống của Hội An.',
        descEn: 'Full list of vibrant entertainment venues and activities in Hoi An.'
      },
      food: {
        titleVi: 'Ẩm thực đặc sản',
        titleEn: 'Local Food',
        descVi: 'Danh sách đầy đủ các món ăn đặc sản mang đậm hương vị địa phương, tinh tú của ẩm thực Hội An.',
        descEn: 'Full list of authentic local dishes in Hoi An.'
      },
      stay: {
        titleVi: 'Nghỉ dưỡng & Healing',
        titleEn: 'Stay & Healing',
        descVi: 'Danh sách đầy đủ các nơi lưu trú mang lại cảm giác bình yên, gần gũi thiên nhiên giữa lòng Hội An.',
        descEn: 'Full list of peaceful and nature-friendly accommodations in Hoi An.'
      }
    };

    const currentCatInfo = catLabels[showAllCategory] || { titleVi: '', titleEn: '', descVi: '', descEn: '' };

    const filteredSpots = (categorySpots[showAllCategory] || []).filter((spot) => {
      const q = cafeSearchQuery.toLowerCase().trim();
      if (!q) return true;
      const name = (spot.name[language] || '').toLowerCase();
      const tag = (spot.tag || '').toLowerCase();
      const desc = (spot.desc[language] || '').toLowerCase();
      return name.includes(q) || tag.includes(q) || desc.includes(q);
    });

    return (
      <div className="w-full max-w-[95%] mx-auto px-4 sm:px-8 py-12 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="font-outfit text-3xl font-extrabold text-[#003366]">
              {language === 'vi' ? currentCatInfo.titleVi : currentCatInfo.titleEn}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'vi' ? currentCatInfo.descVi : currentCatInfo.descEn}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'}
              value={cafeSearchQuery}
              onChange={(e) => setCafeSearchQuery(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-heritage-amber w-64 shadow-sm"
            />
            <button
              onClick={() => { setShowAllCategory(null); setCafeSearchQuery(''); }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer border-none flex items-center gap-1.5"
            >
              ← {language === 'vi' ? 'Quay lại' : 'Back'}
            </button>
          </div>
        </div>

        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredSpots.map((spot) => {
              const hasGps = spot.lat && spot.lng;
              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpotDetail(spot)}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-heritage-amber text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">{spot.tag}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow gap-3">
                    <h3 className="font-outfit text-xl font-black text-gray-900 group-hover:text-heritage-amber transition-colors line-clamp-1">{spot.name[language]}</h3>
                    <div className="text-[13px] sm:text-sm text-gray-850 flex flex-col gap-1.5 font-bold leading-relaxed">
                      {spot.desc[language]
                        ? spot.desc[language]
                          .split(/[.\n;]+/)
                          .map(s => s.trim())
                          .filter(s => s.length > 0)
                          .slice(0, 3)
                          .map((sentence, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-heritage-amber text-sm select-none mt-0.5">•</span>
                              <span className="line-clamp-2 leading-snug">{sentence}</span>
                            </div>
                          ))
                        : null}
                    </div>
                    {/* Price — prominent, amber */}
                    <div className={`flex justify-between items-center border-t border-amber-100 mt-auto pt-4 bg-amber-50/60 -mx-6 px-6 pb-5 ${!hasGps ? '-mb-6 rounded-b-2xl' : ''}`}>
                      <span className="text-[11px] text-amber-600 font-black uppercase tracking-wider">{language === 'vi' ? 'Chi phí ước tính' : 'Estimated cost'}</span>
                      <span className="text-heritage-amber text-lg font-black">{spot.price[language]}</span>
                    </div>
                    {/* Get Directions button */}
                    {hasGps && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlannerPrefill({ directionSpot: spot });
                          setShowAllCategory(null);
                          setActiveTab('planner');
                        }}
                        className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border-none py-3.5 -mx-6 -mb-6 mt-2 text-center"
                        style={{ borderRadius: '0 0 1rem 1rem' }}
                      >
                        {language === 'vi' ? 'Xem chỉ đường' : 'Get Directions'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 text-sm">
            {language === 'vi' ? 'Không tìm thấy địa điểm phù hợp.' : 'No matching spots found.'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden flex flex-col items-center">
      {/* DESKTOP-ONLY VIEW */}
      <div className="hidden md:flex flex-col w-full items-center">
        {/* Hero Section with Background Image */}
        <section className="relative w-full overflow-hidden min-h-[40vh] md:min-h-[85vh] flex pt-10 md:pt-24 pb-6 md:pb-12">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBackground}
              alt="Vietnam landscape"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-[95%] mx-auto px-4 sm:px-8 lg:px-12 w-full flex flex-col justify-between gap-4 md:gap-12">
            {/* Top Area: Text & Buttons */}
            <div className="flex flex-col items-start text-left max-w-2xl mt-2 md:mt-12">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <span className="text-3xl md:text-5xl font-light text-white" style={{fontFamily: "'Dancing Script', cursive"}}>{language === 'vi' ? 'Khám phá' : 'Discover'}</span>
                <Plane className="w-6 h-6 md:w-8 md:h-8 text-white -rotate-45" />
              </div>
              
              <h1 className="font-outfit text-[50px] md:text-[100px] lg:text-[120px] font-black text-white tracking-wider leading-none drop-shadow-xl mb-1 md:mb-2">
                {language === 'vi' ? (
                  <>VIỆT <span className="text-[#FFC107]">NAM</span></>
                ) : (
                  <>VIET<span className="text-[#FFC107]">NAM</span></>
                )}
              </h1>
              
              <div className="flex items-center gap-2 sm:gap-3 mt-2 mb-8 flex-wrap sm:flex-nowrap">
                <span className="text-sm sm:text-xl font-bold tracking-[0.1em] sm:tracking-[0.2em] text-white uppercase drop-shadow-md">{language === 'vi' ? 'THEO CÁCH LOCAL THỰC THỤ' : 'LIKE A TRUE LOCAL'}</span>
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              <p className="text-white/95 text-base sm:text-lg max-w-lg leading-relaxed font-medium drop-shadow-md mb-10 text-justify">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={handleQuickStart}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-[#FFC107] hover:bg-yellow-500 text-black font-extrabold text-base rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  {t('startNow')} <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight * 0.35, behavior: 'smooth' })}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white text-white hover:bg-white/10 font-extrabold text-base rounded-full shadow-lg transition-transform hover:scale-105 backdrop-blur-sm"
                >
                  {language === 'vi' ? 'Xem điểm đến nổi bật' : 'View Highlights'} <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Area: Features Box & Right Text */}
            <div className="flex items-end justify-between w-full mt-auto">
              {/* Bottom Feature Box */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-[2rem] p-6 hidden lg:flex gap-12 shadow-xl">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Sparkles className="w-8 h-8" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="font-bold text-sm">{language === 'vi' ? 'Gợi ý thông minh' : 'Smart Suggestions'}</p>
                    <p className="text-xs opacity-80">{language === 'vi' ? 'AI đề xuất theo sở thích' : 'AI-powered picks'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-white">
                  <Clock className="w-8 h-8" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="font-bold text-sm">{language === 'vi' ? 'Lịch trình tối ưu' : 'Optimal Itinerary'}</p>
                    <p className="text-xs opacity-80">{language === 'vi' ? 'Tiết kiệm thời gian' : 'Save your time'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-white">
                  <Gem className="w-8 h-8" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="font-bold text-sm">{language === 'vi' ? 'Trải nghiệm địa phương' : 'Local Experience'}</p>
                    <p className="text-xs opacity-80">Local tips & hidden gems</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-white">
                  <Users className="w-8 h-8" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="font-bold text-sm">{language === 'vi' ? 'Cộng đồng du lịch' : 'Travel Community'}</p>
                    <p className="text-xs opacity-80">{language === 'vi' ? 'Chia sẻ & kết nối' : 'Share & connect'}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Right Text */}
              <div className="text-right hidden lg:block" style={{fontFamily: "'Dancing Script', cursive"}}>
                <div className="text-4xl text-white drop-shadow-md">{language === 'vi' ? 'Đi để cảm nhận' : 'Travel to feel'}</div>
                <div className="text-5xl font-bold text-[#FFC107] drop-shadow-md mt-2">{language === 'vi' ? 'Sống để nhớ mãi' : 'Live to remember'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Spots Spotlight ─────────────────────────── */}
        <section className="max-w-[95%] w-full px-4 sm:px-8 py-12 sm:py-16 flex flex-col gap-8">
          {/* Destination Header & Marquee Spot Showcase */}
          <div className="flex flex-col md:flex-row items-stretch gap-6 w-full bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm overflow-hidden scroll-reveal">
            {/* Left 30%: Bạn muốn đi đến đâu header */}
            <div className="w-full md:w-[30%] flex flex-col justify-center gap-1.5 pr-0 md:pr-4 md:border-r border-gray-150">
              <h3 className="font-outfit text-lg font-black text-gray-900 leading-snug">
                {language === 'vi' ? 'Bạn muốn đi đến đâu?' : 'Where do you want to go?'}
              </h3>
              <p className="text-[11px] text-gray-400 font-semibold leading-normal">
                {language === 'vi' ? 'Khám phá tất cả ngóc ngách Việt Nam' : 'Explore all corners of Vietnam'}
              </p>
            </div>

            {/* Right 70%: Marquee Scrolling Spots */}
            <div className="w-full md:w-[70%] overflow-x-auto md:overflow-hidden scrollbar-hide relative flex items-center bg-gray-50/50 rounded-2xl py-2 px-1">
              {allFeaturedSpots.length > 0 ? (
                <div
                  className="animate-marquee-horizontal flex gap-4 select-none"
                  style={{ animationDuration: `${Math.max(20, allFeaturedSpots.length * 5)}s` }}
                >
                  {[...allFeaturedSpots, ...allFeaturedSpots, ...allFeaturedSpots].map((spot, idx) => (
                    <div
                      key={`${spot.id}-${idx}`}
                      className="flex flex-col items-center gap-2 group cursor-pointer w-[72px]"
                      onClick={() => setSelectedSpotDetail(spot)}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden relative border-2 border-transparent group-hover:border-heritage-amber transition-all duration-300 shadow-sm flex-shrink-0 bg-gray-100">
                        <img
                          src={spot.image}
                          alt={spot.name[language]}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100/e2e8f0/64748b?text=VN";
                          }}
                        />
                      </div>
                      <span className="font-outfit text-[10px] sm:text-[11px] font-bold text-gray-700 text-center line-clamp-2 leading-tight group-hover:text-heritage-amber transition-colors">
                        {spot.name[language]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full text-center text-gray-400 text-sm italic py-4">
                  {language === 'vi' ? 'Đang tải địa điểm nổi bật...' : 'Loading featured spots...'}
                </div>
              )}
            </div>
          </div>
        </section>


        {/* 3. Section "TRẢI NGHIỆM NỔI BẬT" */}
        <section className="max-w-[95%] w-full px-4 sm:px-8 pb-12 flex flex-col gap-6 scroll-reveal">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
              {language === 'vi' ? 'Trải nghiệm nổi bật' : 'Featured Experiences'}
            </h2>
            <button
              onClick={() => { setShowAllCategory('entertainment'); }}
              className="text-sm text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Card 1: Vui chơi dark image background card (Span 4 cols) */}
            <div className="md:col-span-4 h-[360px] rounded-3xl overflow-hidden relative p-6 flex flex-col justify-end text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25)), url("https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {language === 'vi' ? 'NỔI BẬT' : 'FEATURED'}
              </span>
              <div>
                <h3 className="text-yellow-400 text-2xl font-black leading-tight">
                  {language === 'vi' ? 'Khu vui chơi giải trí' : 'Entertainment Hub'}
                </h3>
                <p className="text-xs text-gray-200 mt-2 leading-relaxed">
                  {language === 'vi' ? 'Trải nghiệm độc đáo và những trò chơi sôi động dành riêng cho bạn' : 'Unique experiences and exciting activities tailored for you'}
                </p>
                <button
                  onClick={() => {
                    setPlannerPrefill({ days: 3, budget: 4000000, style: 'Healing' });
                    setActiveTab('planner');
                  }}
                  className="mt-4 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-xs rounded-full shadow-md border-none flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                >
                  {language === 'vi' ? 'Khám phá ngay' : 'Explore now'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Other entertainment spot cards (Span 8 cols, Grid of 3 items) */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {categorySpots.entertainment.slice(0, 3).map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpotDetail(spot)}
                  className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="h-44 relative bg-gray-100">
                    <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {language === 'vi' ? 'NỔI BẬT' : 'FEATURED'}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-grow justify-between">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-1">{spot.name[language]}</h3>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">📍 {spot.tag}</p>
                      <p className="text-xs text-gray-500 mt-1 font-semibold line-clamp-3 leading-relaxed">{spot.desc[language]}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                      <span className="text-blue-600 text-xs font-black">{spot.price[language]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Section "NƠI NGHỈ BƯỚC YÊU THÍCH" */}
        <section className="max-w-[95%] w-full px-4 sm:px-8 pb-12 flex flex-col gap-6 scroll-reveal">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
              {language === 'vi' ? 'Nơi nghỉ được yêu thích' : 'Favorite Stays'}
            </h2>
            <button
              onClick={() => { setShowAllCategory('stay'); }}
              className="text-sm text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categorySpots.stay.slice(0, 5).map((spot, idx) => (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotDetail(spot)}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="h-36 relative bg-gray-100">
                  <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {idx === 0 ? (language === 'vi' ? 'GIẢM 20%' : '20% OFF') : 'HOT'}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5 flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-1">{spot.name[language]}</h3>
                    <p className="text-xs text-gray-450 font-bold mt-1">📍 {spot.tag}</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold line-clamp-3 leading-relaxed">{spot.desc[language]}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                    <span className="text-blue-600 text-xs font-black">{spot.price[language]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Section "KHÁM PHÁ ẨM THỰ" */}
        <section className="max-w-[95%] w-full px-4 sm:px-8 pb-12 flex flex-col gap-6 scroll-reveal">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
              {language === 'vi' ? 'Khám phá ẩm thực' : 'Food Discovery'}
            </h2>
            <button
              onClick={() => { setShowAllCategory('food'); }}
              className="text-sm text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 justify-center">
            {[...categorySpots.food.slice(0, 4), ...categorySpots.cafe.slice(0, 4)].map((spot, idx) => (
              <div
                key={spot.id}
                className="flex flex-col items-center text-center gap-1 cursor-pointer hover:scale-105 transition-transform duration-300 group"
                onClick={() => setSelectedSpotDetail(spot)}
              >
                <div className="w-20 h-20 rounded-3xl overflow-hidden relative shadow-md bg-gray-50 border border-gray-100">
                  <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${idx % 4 === 0 ? 'bg-orange-500' : idx % 4 === 1 ? 'bg-red-500' : idx % 4 === 2 ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>
                <h4 className="text-xs font-black text-gray-900 leading-tight mt-2 line-clamp-2 w-20 group-hover:text-heritage-amber transition-colors">{spot.name[language]}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Section "VIDEO TRẢI NGHIỆM" */}
        <section className="max-w-[95%] w-full px-4 sm:px-8 pb-12 flex flex-col gap-6 scroll-reveal">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
              {language === 'vi' ? 'Video trải nghiệm' : 'Experience Videos'}
            </h2>
            <button
              onClick={() => { setActiveTab('social'); }}
              className="text-sm text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { id: 'xM4PQ1gQah8', title: 'Hoi An Ancient Town' },
              { id: 'wUz9ue-IWzY', title: 'Hoi An Street Food' },
              { id: 'HARa2cKXsnM', title: 'Hoi An Night Life' },
              { id: 'H0wjXWGXva4', title: 'Hoi An Lanterns' },
              { id: 'U7rYj3uPU4Q', title: 'Hoi An Travel Guide' },
            ].map((video) => (
              <div key={video.id} className="w-full aspect-[9/16] rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Section "CỘNG ĐỒNG TRAVELIST" */}
        <section className="max-w-[95%] w-full px-4 sm:px-8 pb-16 flex flex-col gap-6 scroll-reveal">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
              {language === 'vi' ? 'Cộng đồng Travelist' : 'Travelist Community'}
            </h2>
            <button
              onClick={() => { setActiveTab('social'); }}
              className="text-sm text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          {topCommunityPosts.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {topCommunityPosts.map((post, idx) => (
                <div key={post.id} className="w-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 p-5 flex flex-col gap-4">
                  {/* Rank badge + Author */}
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-gray-300 text-gray-800' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>#{idx + 1}</span>
                    <img
                      src={post.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-heritage-amber flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-outfit text-sm font-black text-gray-900 truncate">{post.user?.fullName || 'Traveler'}</span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(post.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-xs text-gray-700 leading-relaxed font-medium line-clamp-3">
                    {language === 'vi' ? post.contentVi : post.contentEn}
                  </p>

                  {/* Image */}
                  {post.imageUrl && (
                    <div className="w-full aspect-video overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                      <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                  )}

                  {/* Location tag */}
                  {post.spot && (
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs font-bold text-gray-600">
                      <MapPin className="w-3 h-3 text-heritage-amber flex-shrink-0" />
                      <span className="text-heritage-amber font-extrabold truncate">{language === 'vi' ? post.spot.nameVi : post.spot.nameEn}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm bg-transparent cursor-pointer active:scale-95 transition-transform ${
                          post.myReaction === 'LIKE' ? 'text-blue-500 font-extrabold bg-blue-50/50' : 'text-gray-500'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${post.myReaction === 'LIKE' ? 'fill-blue-500 text-blue-500' : 'text-gray-500'}`} />
                        <span>{post.likesCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleDislikePost(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm bg-transparent cursor-pointer active:scale-95 transition-transform ${
                          post.myReaction === 'DISLIKE' ? 'text-red-500 font-extrabold bg-red-50/50' : 'text-gray-500'
                        }`}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${post.myReaction === 'DISLIKE' ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        <span>{post.dislikesCount || 0}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-heritage-amber hover:underline cursor-pointer font-bold" onClick={() => setActiveTab('social')}>
                      {language === 'vi' ? 'Xem thêm →' : 'View more →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-semibold text-center py-6">
              {language === 'vi' ? 'Chưa có bài viết nào.' : 'No posts yet.'}
            </p>
          )}
        </section>
      </div>

      {/* MOBILE-ONLY VIEW (Giao diện Mobile thiết kế như hình chụp) */}
      <div className="flex md:hidden flex-col w-full bg-white pb-10 px-4 gap-6">
        
        {/* 1. Mobile Hero Banner */}
        <div className="w-full relative rounded-3xl overflow-hidden min-h-[48vh] flex flex-col p-5 text-white" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Main Title & Paragraph */}
          <div className="mt-4 flex-grow">
            <p className="text-3xl font-light text-yellow-300 italic" style={{fontFamily: "'Dancing Script', cursive"}}>
              {language === 'vi' ? 'Khám phá' : 'Discover'}
            </p>
            <h1 className="text-5xl font-black tracking-wider leading-none mt-1">
              VIỆT <span className="text-yellow-400">NAM</span>
            </h1>
            <p className="text-xs font-bold tracking-[0.1em] text-gray-205 mt-1.5 flex items-center gap-1 uppercase">
              {language === 'vi' ? 'THEO CÁCH LOCAL THỰC THỰ 📍' : 'THE REAL LOCAL WAY 📍'}
            </p>
            <p className="text-sm text-gray-200 font-medium leading-relaxed max-w-[280px] mt-4 text-justify">
              {language === 'vi' 
                ? 'Nhập ngân sách, thời gian và sở thích của bạn. Trí tuệ nhân tạo sẽ lập lịch trình ăn chơi, nghỉ ngơi tối ưu và tiết kiệm nhất.'
                : 'Enter your budget, time, and styles. Artificial intelligence will generate the most optimal and cost-saving itinerary for playing and resting.'}
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleQuickStart}
                className="flex items-center gap-1.5 px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-sm rounded-full shadow-md active:scale-95 transition-transform border-none cursor-pointer"
              >
                {language === 'vi' ? 'Bắt đầu ngay' : 'Get Started'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const destEl = document.getElementById('mobile-destinations');
                  if (destEl) destEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-5 py-3 bg-black/45 backdrop-blur-md text-white font-extrabold text-sm rounded-full shadow-md active:scale-95 transition-transform border border-white/20 cursor-pointer"
              >
                {language === 'vi' ? 'Xem điểm đến 📍' : 'View Spots 📍'}
              </button>
            </div>
          </div>

          {/* Feature highlights grid overlapping bottom slightly */}
          <div className="bg-black/35 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 grid grid-cols-4 gap-1.5 text-center shadow-lg mt-6">
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <p className="text-[10px] font-black leading-tight text-white">
                {language === 'vi' ? 'Gợi ý thông minh' : 'Smart Suggests'}
              </p>
              <p className="text-[7.5px] text-gray-300 leading-none mt-0.5">
                {language === 'vi' ? 'Đề xuất theo sở thích' : 'Personalized recommendations'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-[10px] font-black leading-tight text-white">
                {language === 'vi' ? 'Lịch trình tối ưu' : 'Optimal Plan'}
              </p>
              <p className="text-[7.5px] text-gray-300 leading-none mt-0.5">
                {language === 'vi' ? 'Tiết kiệm thời gian' : 'Save your time'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Gem className="w-4 h-4 text-yellow-400" />
              <p className="text-[10px] font-black leading-tight text-white">
                {language === 'vi' ? 'Trải nghiệm local' : 'Local Gems'}
              </p>
              <p className="text-[7.5px] text-gray-300 leading-none mt-0.5">
                {language === 'vi' ? 'Tips & hidden gems' : 'Tips & secrets'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="w-4 h-4 text-yellow-400" />
              <p className="text-[10px] font-black leading-tight text-white">
                {language === 'vi' ? 'Cộng đồng du lịch' : 'Travel Hub'}
              </p>
              <p className="text-[7.5px] text-gray-300 leading-none mt-0.5">
                {language === 'vi' ? 'Chia sẻ & kết nối' : 'Share & Connect'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Section "Bạn muốn đi đâu?" */}
        <div id="mobile-destinations" className="w-full px-1 mt-3 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              {language === 'vi' ? 'Bạn muốn đi đâu?' : 'Where to go?'}
            </h2>
          </div>
          
          <style>{`
            @keyframes marquee-dest {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-dest {
              display: flex;
              gap: 20px;
              width: max-content;
              animation: marquee-dest 35s linear infinite;
            }
            .animate-marquee-dest:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Seamless Infinite Scroll Wrapper */}
          <div className="w-full overflow-hidden">
            <div className="animate-marquee-dest">
              {/* First set of spots */}
              {allFeaturedSpots.slice(0, 10).map((spot) => (
                <div
                  key={`dest-1-${spot.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
                  onClick={() => setSelectedSpotDetail(spot)}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm relative bg-gray-100 flex-shrink-0">
                    <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 truncate w-14 text-center">{spot.name[language]}</span>
                </div>
              ))}
              {/* Identical replica set for seamless loop */}
              {allFeaturedSpots.slice(0, 10).map((spot) => (
                <div
                  key={`dest-2-${spot.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
                  onClick={() => setSelectedSpotDetail(spot)}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm relative bg-gray-100 flex-shrink-0">
                    <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 truncate w-14 text-center">{spot.name[language]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Section "TRẢI NGHIỆM NỔI BẬT" */}
        <div className="w-full px-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              {language === 'vi' ? 'Trải nghiệm nổi bật' : 'Featured Experiences'}
            </h2>
            <button
              onClick={() => { setShowAllCategory('entertainment'); }}
              className="text-xs text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {/* Card 1: Vui chơi dark image background card */}
            <div className="flex-shrink-0 w-60 h-[280px] rounded-3xl overflow-hidden relative p-4 flex flex-col justify-end text-white snap-start" style={{
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15)), url("https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=260&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {language === 'vi' ? 'NỔI BẬT' : 'FEATURED'}
              </span>
              <div>
                <h3 className="text-yellow-400 text-xl font-black leading-none">
                  {language === 'vi' ? 'Vui chơi' : 'Entertainment'}
                </h3>
                <p className="text-xs text-gray-200 mt-1 leading-normal">
                  {language === 'vi' ? 'Trải nghiệm độc đáo dành riêng cho bạn' : 'Unique experiences tailored for you'}
                </p>
                <button
                  onClick={() => {
                    setPlannerPrefill({ days: 3, budget: 4000000, style: 'Healing' });
                    setActiveTab('planner');
                  }}
                  className="mt-3 px-4.5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-xs rounded-full shadow-md border-none flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                >
                  {language === 'vi' ? 'Khám phá ngay' : 'Explore now'} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Dynamic experiences from DB */}
            {categorySpots.entertainment.slice(0, 5).map((spot) => (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotDetail(spot)}
                className="flex-shrink-0 w-60 bg-white border border-gray-150 rounded-3xl overflow-hidden flex flex-col justify-between snap-start shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="h-32 relative bg-gray-100">
                  <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-red-665 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {language === 'vi' ? 'NỔI BẬT' : 'FEATURED'}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-1">{spot.name[language]}</h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">📍 {spot.tag}</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold line-clamp-3 leading-relaxed">{spot.desc[language]}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                    <span className="text-blue-600 text-xs font-black">{spot.price[language]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Section "NƠI NGHỈ BƯỚC YÊU THÍCH" */}
        <div className="w-full px-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              {language === 'vi' ? 'Nơi nghỉ được yêu thích' : 'Favorite Stays'}
            </h2>
            <button
              onClick={() => { setShowAllCategory('stay'); }}
              className="text-xs text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {/* Dynamic Stays from DB */}
            {categorySpots.stay.slice(0, 5).map((spot, idx) => (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotDetail(spot)}
                className="flex-shrink-0 w-56 bg-white border border-gray-150 rounded-3xl overflow-hidden flex flex-col justify-between snap-start shadow-sm cursor-pointer"
              >
                <div className="h-32 relative bg-gray-100">
                  <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {idx === 0 ? (language === 'vi' ? 'GIẢM 20%' : '20% OFF') : 'HOT'}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5 flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-1">{spot.name[language]}</h3>
                    <p className="text-xs text-gray-450 font-bold mt-1">📍 {spot.tag}</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold line-clamp-3 leading-relaxed">{spot.desc[language]}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                    <span className="text-blue-600 text-xs font-black">{spot.price[language]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Section "KHÁM PHÁ ẨM THỰ" */}
        <div className="w-full px-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              {language === 'vi' ? 'Khám phá ẩm thực' : 'Food Discovery'}
            </h2>
            <button
              onClick={() => { setShowAllCategory('food'); }}
              className="text-xs text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[...categorySpots.food.slice(0, 3), ...categorySpots.cafe.slice(0, 1)].map((spot, idx) => (
              <div
                key={spot.id}
                className="flex flex-col items-center text-center gap-1 cursor-pointer active:scale-95 transition-transform"
                onClick={() => setSelectedSpotDetail(spot)}
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden relative shadow-sm bg-gray-50">
                  <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover" />
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${idx % 4 === 0 ? 'bg-orange-500' : idx % 4 === 1 ? 'bg-red-500' : idx % 4 === 2 ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>
                <h4 className="text-[10px] font-black text-gray-900 leading-tight mt-1 line-clamp-2 w-14">{spot.name[language]}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Section "VIDEO TRẢI NGHIỆM" */}
        <div className="w-full px-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              {language === 'vi' ? 'Video trải nghiệm' : 'Experience Videos'}
            </h2>
            <button
              onClick={() => { setActiveTab('social'); }}
              className="text-xs text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {[
              { id: 'xM4PQ1gQah8', title: 'Hoi An Ancient Town' },
              { id: 'wUz9ue-IWzY', title: 'Hoi An Street Food' },
              { id: 'HARa2cKXsnM', title: 'Hoi An Night Life' },
              { id: 'H0wjXWGXva4', title: 'Hoi An Lanterns' },
              { id: 'U7rYj3uPU4Q', title: 'Hoi An Travel Guide' },
            ].map((video) => (
              <div key={video.id} className="flex-shrink-0 snap-center w-[160px] aspect-[9/16] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Section "CỘNG ĐỒNG TRAVELIST" */}
        <div className="w-full px-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              {language === 'vi' ? 'Cộng đồng Travelist' : 'Travelist Community'}
            </h2>
            <button
              onClick={() => { setActiveTab('social'); }}
              className="text-xs text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {language === 'vi' ? 'Xem tất cả' : 'See all'}
            </button>
          </div>

          {topCommunityPosts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topCommunityPosts.map((post, idx) => (
                <div key={post.id} className="w-full bg-white border border-gray-150 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
                  {/* Rank + Author */}
                  <div className="flex items-center gap-2.5">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-gray-300 text-gray-800' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>#{idx + 1}</span>
                    <img
                      src={post.user?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black text-gray-900 truncate">{post.user?.fullName || 'Traveler'}</span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(post.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed font-semibold line-clamp-3">
                    {language === 'vi' ? post.contentVi : post.contentEn}
                  </p>

                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden aspect-video bg-gray-50 border border-gray-100">
                      <img src={post.imageUrl} alt="post media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Likes and Dislikes Buttons */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-3 text-sm font-bold text-gray-500 mt-1">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm bg-transparent cursor-pointer active:scale-95 transition-transform ${
                        post.myReaction === 'LIKE' ? 'text-blue-500 font-extrabold bg-blue-50/50' : 'text-gray-650'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${post.myReaction === 'LIKE' ? 'fill-blue-500 text-blue-500' : 'text-gray-500'}`} />
                      <span>{post.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleDislikePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm bg-transparent cursor-pointer active:scale-95 transition-transform ${
                        post.myReaction === 'DISLIKE' ? 'text-red-500 font-extrabold bg-red-50/50' : 'text-gray-650'
                      }`}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${post.myReaction === 'DISLIKE' ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                      <span>{post.dislikesCount || 0}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-gray-500 px-2.5 py-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-semibold text-center py-4">
              {language === 'vi' ? 'Chưa có bài viết nào.' : 'No posts yet.'}
            </p>
          )}
        </div>
      </div>

      {/* Spot Detail Modal overlay */}
      {selectedSpotDetail && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up max-h-[90vh]">

            {/* Modal Image Header */}
            <div className="relative h-60 bg-gray-150 flex-shrink-0">
              <img
                src={selectedSpotDetail.image}
                alt={selectedSpotDetail.name[language]}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedSpotDetail(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full border-none cursor-pointer backdrop-blur-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Title & Badges in overlay */}
              <div className="absolute bottom-4 left-6 right-6 text-white flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <span className="bg-heritage-amber text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {selectedSpotDetail.category[language]}
                  </span>
                  <span className="bg-ricefield-green text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {selectedSpotDetail.tag}
                  </span>
                </div>
                <h3 className="font-outfit text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-sm">
                  {selectedSpotDetail.name[language]}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Mô tả chi tiết' : 'Description'}
                </span>
                {selectedSpotDetail.desc[language] ? (
                  renderFormattedDescription(selectedSpotDetail.desc[language])
                ) : (
                  <p className="text-xs sm:text-sm text-gray-650 leading-relaxed font-medium">
                    {language === 'vi' ? 'Không có mô tả chi tiết cho địa điểm này.' : 'No detailed description available.'}
                  </p>
                )}
              </div>

              {/* Cost / Price */}
              <div className="flex justify-between items-center bg-gray-50 border border-gray-150 p-4 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    {language === 'vi' ? 'Chi phí ước tính' : 'Estimated Cost'}
                  </span>
                  <span className="text-sm font-black text-gray-800 mt-0.5">
                    {selectedSpotDetail.price[language]}
                  </span>
                </div>

                {/* Latitude & Longitude display */}
                {selectedSpotDetail.lat && selectedSpotDetail.lng && (
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">GPS</span>
                    <span className="text-[10.5px] font-bold text-gray-500 mt-0.5">
                      {selectedSpotDetail.lat.toFixed(4)}, {selectedSpotDetail.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                {/* Directions Button using local map */}
                {selectedSpotDetail.lat && selectedSpotDetail.lng && (
                  <button
                    onClick={() => {
                      setPlannerPrefill({ directionSpot: selectedSpotDetail });
                      setSelectedSpotDetail(null);
                      setActiveTab('planner');
                    }}
                    className="w-full py-3 bg-gradient-to-tr from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 border-none"
                  >
                    🗺️ {language === 'vi' ? 'XEM CHỈ ĐƯỜNG' : 'GET DIRECTIONS'}
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
