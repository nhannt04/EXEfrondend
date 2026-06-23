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

export default function LandingPage({ setActiveTab, setPlannerPrefill }) {
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
  const [featuredCommunityPost, setFeaturedCommunityPost] = useState(null);

  useEffect(() => {
    const fetchFeaturedPost = async () => {
      try {
        const response = await diaryService.getDiaries();
        if (response && response.success && response.data && response.data.length > 0) {
          // Sort by likesCount descending
          const sorted = [...response.data].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
          setFeaturedCommunityPost(sorted[0]);
        }
      } catch (e) {
        console.warn("Failed to fetch featured community post:", e);
      }
    };
    fetchFeaturedPost();
  }, []);



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
  }, [allFeaturedSpots, spots, categorySpots, featuredCommunityPost, showAllCategory, activeFilter]);

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
          {/* Left 30%: Bạn muốn đi đến đâu header (No search input) */}
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



      {/* ── Category Sections ─────────────────────────────────── */}
      <section className="max-w-[95%] w-full px-4 sm:px-8 pb-12 flex flex-col gap-10">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
          if (!categorySpots[cat] || categorySpots[cat].length === 0) return null;

          if (cat === 'cafe') {
            return (
              <React.Fragment key={cat}>
                {/* Rectangular divider section title */}
                <div className="w-full mt-12 mb-4 scroll-reveal">
                  <div className="w-full py-4 px-4 sm:py-5 sm:px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 sm:gap-6 shadow-sm overflow-hidden">
                    <div className="h-[1px] bg-gray-300 flex-grow" />
                    <span className="font-outfit text-sm sm:text-lg font-black text-gray-800 uppercase tracking-widest text-center">
                      {language === 'vi' ? 'Cafe và Ẩm thực' : 'Cafe & Local Food'}
                    </span>
                    <div className="h-[1px] bg-gray-300 flex-grow" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row-reverse items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
                  {/* Left 30%: Video background header */}
                  <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                    {/* Looping video background */}
                    <video
                      src={cafeVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                    {/* Content over video */}
                    <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                          Cafe
                        </h3>
                        <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                          {language === 'vi'
                            ? 'Những quán cà phê mang không gian mộc mạc, tinh tế và đầy chất thơ của phố cổ Hội An.'
                            : 'Poetic, rustic cafes reflecting the tranquil charm of Hoi An.'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSavedScrollY(window.scrollY);
                          setShowAllCategory('cafe');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                      </button>
                    </div>
                  </div>

                  {/* Right 70%: Auto Scroll Carousel */}
                  <AutoScrollCarousel 
                    spots={[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]]} 
                    language={language} 
                    onSpotClick={setSelectedSpotDetail} 
                  />
                </div>
              </React.Fragment>
            );
          }

          if (cat === 'entertainment') {
            return (
              <React.Fragment key={cat}>
                {/* Rectangular divider section title */}
                <div className="w-full mt-12 mb-4 scroll-reveal">
                  <div className="w-full py-4 px-4 sm:py-5 sm:px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 sm:gap-6 shadow-sm overflow-hidden">
                    <div className="h-[1px] bg-gray-300 flex-grow" />
                    <span className="font-outfit text-sm sm:text-lg font-black text-gray-800 uppercase tracking-widest text-center">
                      {language === 'vi' ? 'Vui chơi và Nghỉ dưỡng' : 'Entertainment & Stay'}
                    </span>
                    <div className="h-[1px] bg-gray-300 flex-grow" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
                  {/* Left 30%: Video background header */}
                  <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                    <video
                      src={homestayVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                    <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                          {language === 'vi' ? 'Vui chơi' : 'Entertainment'}
                        </h3>
                        <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                          {language === 'vi'
                            ? 'Những khu vui chơi, giải trí đặc sắc mang đậm văn hóa và sức sống của Hội An.'
                            : 'Vibrant entertainment venues and activities rooted in Hoi An culture.'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSavedScrollY(window.scrollY);
                          setShowAllCategory('entertainment');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                      </button>
                    </div>
                  </div>

                  {/* Right 70%: Scrollable spot cards */}
                  <AutoScrollCarousel 
                    spots={[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]]} 
                    language={language} 
                    onSpotClick={setSelectedSpotDetail} 
                  />
                </div>
              </React.Fragment>
            );
          }

          if (cat === 'food') {
            return (
              <div key={cat} className="flex flex-col md:flex-row-reverse items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
                {/* Left 30%: Video background */}
                <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                  <video
                    src={foodVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                  <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                        {language === 'vi' ? 'Ẩm thực' : 'Local Food'}
                      </h3>
                      <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                        {language === 'vi'
                          ? 'Những món ăn đặc sản mang đậm hương vị địa phương, tinh tú của ẩm thực Hội An và xứ Quảng.'
                          : 'Authentic local dishes capturing the rich culinary soul of Hoi An and Quang Nam.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSavedScrollY(window.scrollY);
                        setShowAllCategory('food');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                    </button>
                  </div>
                </div>

                {/* Right 70%: Marquee */}
                <AutoScrollCarousel 
                  spots={[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]]} 
                  language={language} 
                  onSpotClick={setSelectedSpotDetail} 
                />
              </div>
            );
          }

          if (cat === 'stay') {
            return (
              <div key={cat} className="flex flex-col md:flex-row items-stretch gap-4 w-full rounded-3xl bg-white border border-gray-200/80 shadow-lg p-4 scroll-reveal">
                {/* Left 30%: Video background */}
                <div className="w-full md:w-[30%] relative min-h-[280px] md:min-h-0 rounded-2xl overflow-hidden flex-shrink-0">
                  <video
                    src={stayVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
                  <div className="relative z-10 h-full flex flex-col justify-end items-start gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-outfit text-3xl font-black text-white leading-snug drop-shadow-lg">
                        {language === 'vi' ? 'Nghỉ dưỡng' : 'Stay & Healing'}
                      </h3>
                      <p className="text-sm text-white/80 font-semibold leading-relaxed drop-shadow">
                        {language === 'vi'
                          ? 'Những nơi lưu trú mang lại cảm giác bình yên, gần gũi thiên nhiên giữa lòng Hội An cổ kính.'
                          : 'Peaceful accommodations nestled in the heart of ancient Hoi An, close to nature.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSavedScrollY(window.scrollY);
                        setShowAllCategory('stay');
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/50 text-white font-extrabold text-[11px] rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      {language === 'vi' ? 'Khám phá ngay' : 'Explore Now'} →
                    </button>
                  </div>
                </div>

                {/* Right 70%: Marquee */}
                <AutoScrollCarousel 
                  spots={[...categorySpots[cat], ...categorySpots[cat], ...categorySpots[cat]]} 
                  language={language} 
                  onSpotClick={setSelectedSpotDetail} 
                />
              </div>
            );
          }

          return (
            <div key={cat} className="flex flex-col gap-4 scroll-reveal">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit text-xl font-extrabold text-gray-900">{language === 'vi' ? label.vi : label.en}</h3>
                <button
                  onClick={() => { setActiveFilter(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-[11px] text-heritage-amber font-extrabold hover:underline cursor-pointer"
                >{language === 'vi' ? 'Xem thêm →' : 'See more →'}</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {categorySpots[cat].map(spot => (
                  <div key={spot.id} className="flex-shrink-0 w-52 sm:w-56 bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer snap-start"
                    onClick={() => setSelectedSpotDetail(spot)}
                  >
                    <div className="h-32 overflow-hidden bg-gray-100">
                      <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-xs font-extrabold text-gray-900 line-clamp-1 group-hover:text-heritage-amber transition-colors">{spot.name[language]}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{spot.price[language]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Rectangular divider section title for Video */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-8 scroll-reveal">
        <div className="w-full py-4 px-4 sm:py-5 sm:px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 sm:gap-6 shadow-sm overflow-hidden">
          <div className="h-[1px] bg-gray-300 flex-grow" />
          <span className="font-outfit text-sm sm:text-lg font-black text-gray-800 uppercase tracking-widest text-center">
            Video
          </span>
          <div className="h-[1px] bg-gray-300 flex-grow" />
        </div>
      </div>

      {/* YouTube Shorts Videos grid container */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-12 flex justify-center scroll-reveal">
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full justify-items-center overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide snap-x snap-mandatory sm:snap-none">
          {[
            { id: 'xM4PQ1gQah8', title: 'Hoi An Ancient Town' },
            { id: 'wUz9ue-IWzY', title: 'Hoi An Street Food' },
            { id: 'HARa2cKXsnM', title: 'Hoi An Night Life' },
            { id: 'H0wjXWGXva4', title: 'Hoi An Lanterns' },
            { id: 'U7rYj3uPU4Q', title: 'Hoi An Travel Guide' },
          ].map((video) => (
            <div key={video.id} className="flex-shrink-0 snap-center w-[260px] sm:w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-black justify-self-center">
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

      {/* Rectangular divider section title for News */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-8 mt-4 scroll-reveal">
        <div className="w-full py-4 px-4 sm:py-5 sm:px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 sm:gap-6 shadow-sm overflow-hidden">
          <div className="h-[1px] bg-gray-300 flex-grow" />
          <span className="font-outfit text-sm sm:text-lg font-black text-gray-800 uppercase tracking-widest text-center">
            {language === 'vi' ? 'Tin tức nổi bật của chúng tôi' : 'Our Featured News'}
          </span>
          <div className="h-[1px] bg-gray-300 flex-grow" />
        </div>
      </div>

      {/* News Section Grid */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-16 flex justify-center scroll-reveal">
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full justify-items-center overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide snap-x snap-mandatory sm:snap-none">
          {[
            {
              id: '1',
              type: 'video',
              href: 'https://www.facebook.com/reel/36194449703532829/',
              title: 'Hoi An Reel 2'
            },
            {
              id: '2',
              type: 'post',
              href: 'https://www.facebook.com/permalink.php?story_fbid=pfbid033k2euPpSZyiTNLELicRCzfkQDWZXMo5Nj6XwMJbQwbpcVCzpMzi3n4C9ua2wmfFsl&id=61590702597670',
              title: 'Hoi An Reel 1'
            },
            {
              id: '3',
              type: 'post',
              href: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02jLcLokgLXCwyLp6TakJ8oiu6rf8qeQHdAUSxxqLJuDKtsx6eVeantdEB6KWnPs3ml&id=61590702597670',
              title: 'Hoi An Update Post'
            },
            {
              id: '4',
              type: 'post',
              href: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02s2xAL4HEmb7k7fCQZEY5A8e88yFeNst6QAxrQYXLLDrUKHadbwqZ7KFx5KnFDpHJl&id=61590702597670',
              title: 'Hoi An Heritage Post'
            }
          ].map((item) => {
            const encodedUrl = encodeURIComponent(item.href);
            const iframeSrc = item.type === 'video'
              ? `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=280`
              : `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=280`;

            return (
              <div key={item.id} className="flex-shrink-0 snap-center w-[260px] sm:w-full max-w-[280px] h-[500px] rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-white justify-self-center">
                <iframe
                  src={iframeSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={item.title}
                ></iframe>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rectangular divider section title for Featured Community Post */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-8 mt-4 scroll-reveal">
        <div className="w-full py-4 px-4 sm:py-5 sm:px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 sm:gap-6 shadow-sm overflow-hidden">
          <div className="h-[1px] bg-gray-300 flex-grow" />
          <span className="font-outfit text-sm sm:text-lg font-black text-gray-800 uppercase tracking-widest text-center">
            {language === 'vi' ? 'Bài viết cộng đồng nổi bật nhất' : 'Most Outstanding Community Post'}
          </span>
          <div className="h-[1px] bg-gray-300 flex-grow" />
        </div>
      </div>

      {/* Featured Community Post Embed */}
      {featuredCommunityPost && (
        <div className="max-w-[95%] w-full px-4 sm:px-8 mb-16 flex justify-center animate-fade-in scroll-reveal">
          <div className="w-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
            
            {/* Image (Left side on desktop if exists) */}
            {featuredCommunityPost.imageUrl && (
              <div className="w-full md:w-1/2 h-56 sm:h-64 md:h-72 overflow-hidden rounded-2xl border border-gray-150 bg-gray-50 flex-shrink-0">
                <img
                  src={featuredCommunityPost.imageUrl}
                  alt="Post Attachment"
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            )}

            {/* Content & Info (Right side on desktop) */}
            <div className={`w-full ${featuredCommunityPost.imageUrl ? 'md:w-1/2' : ''} flex flex-col justify-between gap-5`}>
              <div className="flex flex-col gap-4">
                {/* Author info */}
                <div className="flex items-center gap-3">
                  <img
                    src={featuredCommunityPost.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-heritage-amber"
                  />
                  <div className="flex flex-col">
                    <span className="font-outfit text-sm font-black text-gray-900">
                      {featuredCommunityPost.user?.fullName || 'Traveler'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(featuredCommunityPost.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                    </span>
                  </div>
                  <span className="ml-auto bg-green-50 text-ricefield-green border border-ricefield-green/20 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {featuredCommunityPost.category === 'food'
                      ? (language === 'vi' ? 'Ẩm thực' : 'Food')
                      : featuredCommunityPost.category === 'adventure'
                        ? (language === 'vi' ? 'Trải nghiệm' : 'Adventure')
                        : featuredCommunityPost.category === 'scenic'
                          ? (language === 'vi' ? 'Sống ảo' : 'Scenic')
                          : (language === 'vi' ? 'Thư giãn' : 'Healing')
                    }
                  </span>
                </div>

                {/* Content text */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                  {language === 'vi' ? featuredCommunityPost.contentVi : featuredCommunityPost.contentEn}
                </p>

                {/* Linked Spot */}
                {featuredCommunityPost.spot && (
                  <div className="flex flex-col gap-1 bg-gradient-to-r from-gray-50 to-blue-50/20 border border-gray-150 p-3 rounded-xl text-xs font-bold text-gray-750">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-heritage-amber animate-pulse" />
                      <span className="text-gray-400">{language === 'vi' ? 'Địa điểm' : 'Place'}:</span>
                      <span className="text-heritage-amber font-extrabold">
                        {language === 'vi' ? featuredCommunityPost.spot.nameVi : featuredCommunityPost.spot.nameEn}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 pl-5 font-semibold">
                      📍 {featuredCommunityPost.spot.address || (language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam')}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Display */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold text-gray-500 mt-2">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
                  <ThumbsUp className="w-4 h-4 text-green-600 fill-green-600" />
                  <span>{language === 'vi' ? 'Yêu thích nhất' : 'Most Popular'} ({featuredCommunityPost.likesCount || 0})</span>
                </div>
                <span className="text-[11px] text-heritage-amber hover:underline cursor-pointer font-bold" onClick={() => setActiveTab('social')}>
                  {language === 'vi' ? 'Xem trên cộng đồng →' : 'View on Community →'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}



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
