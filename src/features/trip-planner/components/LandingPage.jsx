import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, MapPin, Star, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import spotService from '../../../services/spotService';

export default function LandingPage({ setActiveTab, setPlannerPrefill }) {
  const { language, t } = useLanguage();
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5); // in millions VND
  const [style, setStyle] = useState('Healing');

  // Dynamic spots from backend Neon
  const [spots, setSpots] = useState([]);

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

  const mapBackendSpotToSpotlight = (s) => {
    return {
      id: s.id,
      name: { vi: s.nameVi, en: s.nameEn },
      category: {
        vi: s.category === 'sightseeing' ? 'Tham quan' : s.category === 'cafe' ? 'Cà phê' : s.category === 'stay' ? 'Chỗ nghỉ' : 'Ẩm thực',
        en: s.category.toUpperCase()
      },
      rating: s.rating || 4.8,
      reviews: Math.floor(Math.random() * 150) + 50,
      image: s.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
      style: {
        vi: s.tags.split(',')[0].toUpperCase() + ' / Chill',
        en: s.tags.split(',')[0].toUpperCase() + ' / Chill'
      },
      price: {
        vi: s.averageCost > 0 ? `${s.averageCost.toLocaleString()}đ` : 'Miễn phí',
        en: s.averageCost > 0 ? `${s.averageCost.toLocaleString()}đ` : 'Free of Charge'
      },
      desc: { vi: s.descriptionVi || 'Một điểm check-in độc đáo tại Hội An.', en: s.descriptionEn || 'A beautiful check-in spot in Hoi An.' }
    };
  };

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await spotService.getSpots();
        if (response && response.success && response.data.length > 0) {
          const mapped = response.data.map(mapBackendSpotToSpotlight);
          setSpots(mapped.slice(0, 4));
        }
      } catch (err) {
        console.error("Could not load dynamic spots from backend:", err);
      }
    };
    fetchSpots();
  }, []);

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

      {/* Local Hidden Gems Spotlight */}
      <section className="max-w-6xl w-full px-6 py-16 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-gray-200/80 pb-4">
          <div>
            <span className="text-[10px] text-ricefield-green font-extrabold uppercase tracking-widest block mb-1">
              {t('localSpotlight')}
            </span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-gray-900">
              {t('hiddenGems')}
            </h2>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm max-w-md">
            {t('hiddenGemsDesc')}
          </p>
        </div>

        {/* Spots Cards Grid with Shimmer Hover wave */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:border-heritage-amber/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group shimmer-trigger"
            >
              {/* Image Container */}
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img
                  src={spot.image}
                  alt={spot.name[language]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-gray-200 text-gray-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
                  {spot.category[language]}
                </span>

                {/* Style indicator */}
                <span className="absolute bottom-3 right-3 bg-ricefield-green text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md z-10">
                  {spot.style[language].split(' / ')[0]}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-grow gap-2 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="font-outfit text-base font-bold text-gray-900 group-hover:text-heritage-amber transition-colors">
                    {spot.name[language]}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-heritage-amber font-bold">
                    <Star className="w-3 h-3 fill-heritage-amber text-heritage-amber" />
                    <span>{spot.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                  {spot.desc[language]}
                </p>

                <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-semibold">{t('estimateCost')}</span>
                  <span className="text-gray-900 font-extrabold">{spot.price[language]}</span>
                </div>

                <button
                  onClick={() => handleSelectSpot(spot.style[language])}
                  className="w-full mt-3 py-2.5 text-center border border-gray-200 hover:border-heritage-amber hover:bg-heritage-amber/5 rounded-xl text-xs text-gray-600 hover:text-heritage-amber transition-all duration-300 font-extrabold cursor-pointer bg-gray-50/50"
                >
                  {t('planByGu')}
                </button>
              </div>
            </div>
          ))}
        </div>
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
