import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, MapPin, Star, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import spotService from '../../../services/spotService';

export default function LandingPage({ setActiveTab, setPlannerPrefill }) {
  const { language, t } = useLanguage();
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5);
  const [style, setStyle] = useState('Healing');

  // Featured spots + filter
  const [allFeaturedSpots, setAllFeaturedSpots] = useState([]);
  const [spots, setSpots] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [categorySpots, setCategorySpots] = useState({ sightseeing: [], cafe: [], food: [], stay: [] });
  const [loadingSpots, setLoadingSpots] = useState(true);

  const FILTERS = [
    { key: 'all',         labelVi: 'Tất cả',    labelEn: 'All' },
    { key: 'sightseeing', labelVi: 'Tham quan',  labelEn: 'Sightseeing' },
    { key: 'food',        labelVi: 'Ẩm thực',   labelEn: 'Food' },
    { key: 'cafe',        labelVi: 'Cà phê',     labelEn: 'Cafe' },
    { key: 'stay',        labelVi: 'Chỗ nghỉ',  labelEn: 'Stay' },
  ];

  const CATEGORY_LABELS = {
    sightseeing: { vi: '🏛️ Di sản & Tham quan', en: '🏛️ Sightseeing & Heritage' },
    cafe:        { vi: '☕ Cafe & Chill',         en: '☕ Cafe & Chill' },
    food:        { vi: '🍜 Ẩm thực đặc sản',     en: '🍜 Local Food' },
    stay:        { vi: '🏨 Chỗ nghỉ & Healing',  en: '🏨 Stay & Healing' },
  };

  // Radar scanner states
  const [radarRadius, setRadarRadius] = useState(5);
  const [scanning, setScanning] = useState(false);
  const [radarResults, setRadarResults] = useState([]);
  const [geolocating, setGeolocating] = useState(false);

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

  const mapSpot = (s) => ({
    id: s.id,
    raw: s,
    name:     { vi: s.nameVi, en: s.nameEn },
    category: { vi: s.category === 'sightseeing' ? 'Tham quan' : s.category === 'cafe' ? 'Cà phê' : s.category === 'stay' ? 'Chỗ nghỉ' : 'Ẩm thực', en: s.category },
    rating:   s.rating || 4.8,
    image:    (s.images && s.images.length > 0) ? s.images[0].imageUrl : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    tag:      s.tags ? s.tags.split(',')[0].trim() : s.category,
    price:    { vi: s.averageCost > 0 ? `${(s.averageCost).toLocaleString()}đ` : 'Miễn phí', en: s.averageCost > 0 ? `${(s.averageCost).toLocaleString()}đ` : 'Free' },
    desc:     { vi: s.descriptionVi || '', en: s.descriptionEn || '' },
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingSpots(true);
      try {
        // 1. Featured 8 random spots
        const res = await spotService.getFeaturedSpots(8);
        if (res?.success && res.data.length > 0) {
          const mapped = res.data.map(mapSpot);
          setAllFeaturedSpots(mapped);
          setSpots(mapped);
        }
        // 2. Top 4 per category
        const cats = ['sightseeing', 'cafe', 'food', 'stay'];
        const results = await Promise.all(cats.map(c => spotService.getTopByCategory(c, 4)));
        const newCatSpots = {};
        cats.forEach((c, i) => { newCatSpots[c] = results[i]?.success ? results[i].data.map(mapSpot) : []; });
        setCategorySpots(newCatSpots);
      } catch (err) {
        console.error('Could not load spots:', err);
      } finally {
        setLoadingSpots(false);
      }
    };
    fetchAll();
  }, []);

  // Filter featured spots client-side
  useEffect(() => {
    if (activeFilter === 'all') {
      setSpots(allFeaturedSpots);
    } else {
      setSpots(allFeaturedSpots.filter(s => s.raw.category === activeFilter));
    }
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
    try {
      const response = await spotService.getNearbySpots(lat, lng, radarRadius);
      if (response && response.success) {
        setRadarResults(response.data);
      }
    } catch (err) {
      console.error("Radar scan error:", err);
      alert(language === 'vi' ? "Lỗi khi kết nối với Radar GPS!" : "Error connecting to GPS Radar!");
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full h-[540px] flex items-center justify-center overflow-hidden border-b border-dark-border bg-gradient-to-b from-[#FDFCF7] via-[#FAF5E6] to-[#F5EEDC]">
        {/* Background Image / Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-[#FDFCF7]/50" />

        {/* Content - Cascade Fade In Up Animations */}
        <div className="relative z-10 max-w-4xl px-6 text-center flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-1.5 bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider animate-float shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-heritage-amber animate-spin-slow" />
            {t('heroBadge')}
          </div>

          <h1 className="font-outfit text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 max-w-3xl animate-fade-in-up [animation-delay:200ms]">
            {t('heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-heritage-amber via-heritage-gold to-ricefield-green">{t('heroTitleHighlight')}</span>
          </h1>

          <p className="text-gray-600 text-sm sm:text-base max-w-2xl leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            {t('heroSubtitle')}
          </p>


        </div>
      </section>

      {/* ── Featured Spots Spotlight ─────────────────────────── */}
      <section className="max-w-6xl w-full px-6 py-16 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-gray-200/80 pb-4">
          <div>
            <span className="text-[10px] text-ricefield-green font-extrabold uppercase tracking-widest block mb-1">{t('localSpotlight')}</span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-gray-900">{t('hiddenGems')}</h2>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm max-w-md">{t('hiddenGemsDesc')}</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-200 cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-heritage-amber text-white border-heritage-amber shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-heritage-amber/60 hover:text-heritage-amber'
              }`}
            >
              {language === 'vi' ? f.labelVi : f.labelEn}
            </button>
          ))}
        </div>

        {/* Spots Grid */}
        {loadingSpots ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : spots.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            {language === 'vi' ? 'Không có địa điểm nào trong danh mục này.' : 'No spots found in this category.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spots.map((spot) => (
              <div key={spot.id} className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:border-heritage-amber/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group">
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-gray-200 text-gray-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">{spot.category[language]}</span>
                  <span className="absolute bottom-3 right-3 bg-ricefield-green text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md z-10">{spot.tag}</span>
                </div>
                <div className="p-5 flex flex-col flex-grow gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-outfit text-base font-bold text-gray-900 group-hover:text-heritage-amber transition-colors line-clamp-1">{spot.name[language]}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-heritage-amber font-bold flex-shrink-0 ml-1">
                      <Star className="w-3 h-3 fill-heritage-amber text-heritage-amber" />
                      <span>{spot.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{spot.desc[language]}</p>
                  <div className="border-t border-gray-100 mt-auto pt-3 flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 font-semibold">{t('estimateCost')}</span>
                    <span className="text-gray-900 font-extrabold">{spot.price[language]}</span>
                  </div>
                  <button
                    onClick={() => { setPlannerPrefill({ days: 3, budget: 4000000, style: spot.tag }); setActiveTab('planner'); }}
                    className="w-full mt-2 py-2.5 border border-gray-200 hover:border-heritage-amber hover:bg-heritage-amber/5 rounded-xl text-xs text-gray-600 hover:text-heritage-amber transition-all duration-300 font-extrabold cursor-pointer bg-gray-50/50"
                  >{t('planByGu')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Category Sections ─────────────────────────────────── */}
      <section className="max-w-6xl w-full px-6 pb-12 flex flex-col gap-10">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          categorySpots[cat]?.length > 0 && (
            <div key={cat} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit text-xl font-extrabold text-gray-900">{language === 'vi' ? label.vi : label.en}</h3>
                <button
                  onClick={() => { setActiveFilter(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-[11px] text-heritage-amber font-extrabold hover:underline cursor-pointer"
                >{language === 'vi' ? 'Xem thêm →' : 'See more →'}</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {categorySpots[cat].map(spot => (
                  <div key={spot.id} className="flex-shrink-0 w-52 bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                    onClick={() => { setPlannerPrefill({ days: 2, budget: 3000000, style: spot.tag }); setActiveTab('planner'); }}
                  >
                    <div className="h-32 overflow-hidden bg-gray-100">
                      <img src={spot.image} alt={spot.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-xs font-extrabold text-gray-900 line-clamp-1 group-hover:text-heritage-amber transition-colors">{spot.name[language]}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{spot.price[language]}</span>
                        <div className="flex items-center gap-0.5 text-[10px] text-heritage-amber font-bold">
                          <Star className="w-2.5 h-2.5 fill-heritage-amber" />
                          {spot.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </section>

      {/* GPS Nearby Radar Scanner Section */}
      <section className="max-w-6xl w-full px-6 py-12 flex flex-col gap-8 bg-white border border-gray-200/80 rounded-3xl shadow-sm p-8 mt-4 shimmer-trigger relative overflow-hidden">
        {/* Animated Radar Pulse Background elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-ricefield-green/5 rounded-full animate-pulse pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-gray-150 pb-4 relative z-10">
          <div>
            <span className="text-[10px] text-heritage-amber font-extrabold uppercase tracking-widest block mb-1">
              {language === 'vi' ? 'KHÁM PHÁ CỰC LY GẦN' : 'PROXIMITY EXPLORATION'}
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-heritage-amber animate-spin-slow" />
              {language === 'vi' ? 'Radar Quét Điểm Đến Gần Bạn' : 'GPS Nearby Radar Scanner'}
            </h2>
          </div>
          <p className="text-gray-500 text-xs max-w-sm">
            {language === 'vi'
              ? 'Sử dụng định vị GPS để tìm kiếm quán ăn, cafe và thắng cảnh di sản trong bán kính lựa chọn xung quanh bạn.'
              : 'Utilize GPS geolocation to sweep cafes, diners, and heritage sights within a customized radius around you.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Controls Panel */}
          <div className="lg:col-span-4 flex flex-col gap-5 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-outfit text-sm font-bold text-gray-800">{language === 'vi' ? 'Cấu hình quét Radar' : 'Radar Configuration'}</h3>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase">{language === 'vi' ? 'Bán kính quét' : 'Scan Radius'}</label>
              <select
                value={radarRadius}
                onChange={(e) => setRadarRadius(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 text-gray-800 px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
              >
                <option value={1}>1.0 km ({language === 'vi' ? 'Đi bộ' : 'Walking'})</option>
                <option value={2}>2.0 km ({language === 'vi' ? 'Xe đạp' : 'Cycling'})</option>
                <option value={5}>5.0 km ({language === 'vi' ? 'Xe máy / Ô tô' : 'Driving'})</option>
                <option value={50}>50.0 km ({language === 'vi' ? 'Toàn vùng' : 'All Area'})</option>
              </select>
            </div>

            <button
              onClick={handleRadarScan}
              disabled={scanning}
              className="w-full py-3 bg-gradient-to-r from-heritage-amber to-heritage-gold hover:from-heritage-gold hover:to-heritage-amber text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 border-none cursor-pointer"
            >
              <Compass className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? (language === 'vi' ? 'Đang quét Radar...' : 'Sweeping Radar...') : (language === 'vi' ? 'Khởi động quét GPS' : 'Trigger GPS Scan')}
            </button>

            {/* Simulated Radar Position coordinate */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-1">
              <MapPin className="w-3.5 h-3.5 text-ricefield-green" />
              <span>
                GPS: {userLat.toFixed(4)}, {userLng.toFixed(4)} ({language === 'vi' ? 'Tâm Phố cổ' : 'Hoi An Ancient Center'})
              </span>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {scanning ? (
              <div className="w-full h-48 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50/50 animate-pulse">
                <div className="w-10 h-10 border-4 border-heritage-amber border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-500 font-bold">{language === 'vi' ? 'Đang gửi sóng định vị GPS...' : 'Emitting GPS radar signal...'}</span>
              </div>
            ) : radarResults.length === 0 ? (
              <div className="w-full h-48 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center p-6 bg-gray-50/50">
                <Compass className="w-8 h-8 text-gray-300 animate-pulse" />
                <span className="text-xs text-gray-500 font-bold">{language === 'vi' ? 'Chưa phát hiện địa điểm nào' : 'No spots detected yet'}</span>
                <span className="text-[10.5px] text-gray-400 max-w-xs leading-normal">
                  {language === 'vi' ? 'Nhấn nút khởi động để định vị và quét tất cả các điểm check-in hấp dẫn xung quanh bán kính của bạn.' : 'Trigger the scanner to locate all amazing local spots and hidden gems around your radius.'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                {radarResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-white border border-gray-150 hover:border-heritage-amber/30 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md animate-scale-up"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.spot.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=100&q=80'}
                        alt={item.spot.nameVi}
                        className="w-11 h-11 rounded-lg object-cover border border-gray-150"
                      />
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">{language === 'vi' ? item.spot.nameVi : item.spot.nameEn}</h4>
                        <span className="text-[9.5px] text-gray-400 uppercase font-bold block mt-0.5">{item.spot.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Distance Badge */}
                      <span className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2 py-0.5 rounded-full font-extrabold">
                        {item.distance < 1 ? `${Math.round(item.distance * 1000)} m` : `${item.distance.toFixed(1)} km`}
                      </span>

                      <button
                        onClick={() => {
                          setPlannerPrefill({
                            days: 2,
                            budget: 3000000,
                            style: item.spot.category === 'stay' ? 'Retreat' : item.spot.category === 'cafe' ? 'Healing' : 'Explorer'
                          });
                          setActiveTab('planner');
                        }}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-heritage-amber hover:text-heritage-amber text-gray-600 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors"
                      >
                        {language === 'vi' ? 'Đi tới Plan' : 'Plan Trip'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Prepositions Section */}
      <section className="w-full bg-[#FAF7EE]/60 border-y border-dark-border py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t('valuePropTitle1'), desc: t('valuePropDesc1'), icon: Compass, bg: 'bg-heritage-amber/10 text-heritage-amber border-heritage-amber/20' },
            { title: t('valuePropTitle2'), desc: t('valuePropDesc2'), icon: Star, bg: 'bg-ricefield-green/10 text-ricefield-green border-ricefield-green/20' },
            { title: t('valuePropTitle3'), desc: t('valuePropDesc3'), icon: ShieldAlert, bg: 'bg-purple-500/10 text-purple-600 border-purple-200/40' }
          ].map((item, idx) => {
            const ActiveIcon = item.icon;
            return (
              <div
                key={idx}
                className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 shimmer-trigger"
              >
                <div className={`${item.bg} p-3 rounded-xl border flex-shrink-0 z-10`}>
                  <ActiveIcon className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-outfit text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
