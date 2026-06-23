import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, MapPin, Star, ShieldAlert, CalendarDays, Plane, Map, Users, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import axiosClient from '@/services/axiosClient';
import spotService from '@/services/spotService';
import diaryService from '@/services/diaryService';
import cafeVideo from '@/assets/cafe.mp4';
import homestayVideo from '@/assets/vuichoi.mp4';
import foodVideo from '@/assets/monan.mp4';
import stayVideo from '@/assets/homestay.mp4';
import HeroSection from './landing/HeroSection';
import SpotlightMarquee from './landing/SpotlightMarquee';
import CategorySection from './landing/CategorySection';
import FeaturedCommunityPost from './landing/FeaturedCommunityPost';
import SpotDetailModal from './landing/SpotDetailModal';

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
      <div className="flex flex-col gap-1 bg-gray-50 p-5 rounded-2xl border border-gray-150 shadow-inner">
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
    <div className="w-full flex flex-col items-center">
      <HeroSection language={language} handleQuickStart={handleQuickStart} />

      <SpotlightMarquee 
        language={language}
        spots={spots}
        allFeaturedSpots={allFeaturedSpots}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        FILTERS={FILTERS}
        setSelectedSpotDetail={setSelectedSpotDetail}
      />

      <CategorySection
        language={language}
        categorySpots={categorySpots}
        CATEGORY_LABELS={CATEGORY_LABELS}
        setShowAllCategory={setShowAllCategory}
        setSavedScrollY={setSavedScrollY}
        setSelectedSpotDetail={setSelectedSpotDetail}
        setActiveFilter={setActiveFilter}
        setActiveTab={setActiveTab}
        setPlannerPrefill={setPlannerPrefill}
      />

      {/* Rectangular divider section title for Video */}
      <div className="max-w-[95%] w-full px-4 sm:px-8 mb-8 scroll-reveal">
        <div className="w-full py-5 px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-6 shadow-sm">
          <div className="h-[1px] bg-gray-300 flex-grow" />
          <span className="font-outfit text-[clamp(0.875rem,3.5vw,1.125rem)] font-black text-gray-800 uppercase tracking-widest text-center px-4">
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
        <div className="w-full py-5 px-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-center gap-6 shadow-sm">
          <div className="h-[1px] bg-gray-300 flex-grow" />
          <span className="font-outfit text-[clamp(0.875rem,3.5vw,1.125rem)] font-black text-gray-800 uppercase tracking-widest text-center px-4">
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
              ? `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=350&height=500`
              : `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=350`;

            return (
              <div key={item.id} className="flex-shrink-0 snap-center w-[320px] sm:w-[350px] max-w-full h-[500px] rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-white justify-self-center">
                <iframe
                  src={iframeSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'auto' }}
                  scrolling="auto"
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

      <FeaturedCommunityPost
        featuredCommunityPost={featuredCommunityPost}
        language={language}
        setActiveTab={setActiveTab}
      />

      <SpotDetailModal
        selectedSpotDetail={selectedSpotDetail}
        language={language}
        setSelectedSpotDetail={setSelectedSpotDetail}
        setPlannerPrefill={setPlannerPrefill}
        setActiveTab={setActiveTab}
        renderFormattedDescription={renderFormattedDescription}
      />
    </div>
  );
}
