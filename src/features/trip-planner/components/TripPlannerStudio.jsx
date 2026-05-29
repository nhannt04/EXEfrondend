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

const LeafletMap = ({
  spots,
  selectedSpot,
  showTravelRoute,
  language,
  isNavigating,
  userLocation,
  transportMode,
  userHeading,
  activeStreetName,
  isDarkMode,
  alternativeRoutes,
  selectedRouteIndex,
  onSelectRoute,
  mapRotationActive,
  onRoutesFetched
}) => {
  const mapContainerId = React.useId().replace(/:/g, '');
  const mapRef = React.useRef(null);
  const tileLayerRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const polylineRef = React.useRef(null);
  const altPolylinesRef = React.useRef([]);
  const lastRouteParamsRef = React.useRef({ spotsKey: '', showTravelRoute: false });
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    const handleRecenter = () => {
      if (mapRef.current && userLocation) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 17.5);
      }
    };
    window.addEventListener('recenter-map', handleRecenter);
    return () => window.removeEventListener('recenter-map', handleRecenter);
  }, [userLocation]);

  // Handle map rotation styles dynamically via CSS Variables
  const mapRotationStyle = (mapRotationActive && userHeading !== null)
    ? { '--map-rotation': `${-userHeading}deg` }
    : { '--map-rotation': '0deg' };

  React.useEffect(() => {
    if (!mapLoaded || !window.L || spots.length === 0) return;

    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerId, {
        zoomControl: true,
        scrollWheelZoom: true
      });
    }

    const map = mapRef.current;

    // Manage map skins (Dark mode vs Satellite view) dynamically
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    const attribution = isDarkMode ? '&copy; CartoDB' : '&copy; Google Maps';
    tileLayerRef.current = window.L.tileLayer(tileUrl, { attribution }).addTo(map);

    const spotsKey = spots.map(s => `${s.id || ''}-${s.lat},${s.lng}`).join('|');
    const keyPrefix = `${transportMode || 'motorbike'}-` + (isNavigating && userLocation && selectedSpot
      ? `${userLocation.lat},${userLocation.lng}->${selectedSpot.lat},${selectedSpot.lng}-`
      : '');
    const paramsChanged = lastRouteParamsRef.current.spotsKey !== (keyPrefix + spotsKey) || lastRouteParamsRef.current.showTravelRoute !== showTravelRoute || lastRouteParamsRef.current.isDarkMode !== isDarkMode;

    if (paramsChanged) {
      // Clear old markers & polylines
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      altPolylinesRef.current.forEach(p => p.remove());
      altPolylinesRef.current = [];

      // Draw red dot markers
      spots.forEach((s, idx) => {
        const isSelected = selectedSpot && selectedSpot.lat === s.lat && selectedSpot.lng === s.lng;

        const pulseHtml = isSelected
          ? `<div class="relative flex items-center justify-center h-5 w-5"><div class="absolute h-5 w-5 rounded-full bg-red-500 animate-ping opacity-60"></div><div class="h-3.5 w-3.5 rounded-full bg-red-600 border-2 border-white shadow-md"></div></div>`
          : `<div class="h-3 w-3 rounded-full bg-red-500 border border-white shadow-md hover:scale-125 hover:bg-red-600 transition-all"></div>`;

        const customIcon = window.L.divIcon({
          html: pulseHtml,
          className: 'custom-dot-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = window.L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);

        const orderPrefix = showTravelRoute ? `${idx + 1}. ` : '';
        marker.bindTooltip(orderPrefix + (s.name?.[language] || ''), {
          permanent: isSelected,
          direction: 'top',
          className: 'leaflet-custom-tooltip font-outfit font-extrabold text-[10.5px] border-none shadow-sm rounded-lg bg-gray-900 text-white px-2 py-1'
        });

        markersRef.current.push(marker);
      });

      // Draw user live blue chevron marker if navigating
      if (isNavigating && userLocation) {
        const rotationStyle = (userHeading !== null && userHeading !== undefined && !mapRotationActive)
          ? `transform: rotate(${userHeading}deg);`
          : 'transform: rotate(0deg);';

        const userPulseHtml = `
          <div class="relative flex flex-col items-center justify-center" style="margin-top: -15px;">
            <div class="relative flex items-center justify-center h-9 w-9">
              <div class="absolute h-9 w-9 rounded-full bg-blue-500/30 animate-ping"></div>
              <div class="h-6.5 w-6.5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                <!-- White chevron arrow pointing to heading direction -->
                <svg class="w-4.5 h-4.5 text-white transition-transform duration-300" style="${rotationStyle}" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
              </div>
            </div>
            <!-- Google Maps style bottom street tag: White background with blue text -->
            <div class="mt-1.5 px-3 py-1 bg-white border-2 border-blue-500/35 shadow-lg rounded-full text-[10.5px] font-black text-blue-600 leading-none whitespace-nowrap text-center tracking-wide">
              ${activeStreetName || (language === 'vi' ? 'Đường Tứ Ngân 02' : 'Route')}
            </div>
          </div>
        `;
        const userIcon = window.L.divIcon({
          html: userPulseHtml,
          className: 'user-live-marker',
          iconSize: [120, 60],
          iconAnchor: [60, 30]
        });
        const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        markersRef.current.push(userMarker);
      }

      // Map dynamic OSRM profiles
      let osrmProfile = 'driving';
      if (transportMode === 'foot') osrmProfile = 'foot';
      else if (transportMode === 'bike') osrmProfile = 'bicycle';

      // Draw actual street routing path with alternatives and steps
      if (isNavigating && userLocation && selectedSpot) {
        // Fetch steps and alternatives to achieve full Google Maps high-fidelity
        const routingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${userLocation.lng},${userLocation.lat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

        fetch(routingUrl)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              // Send up to parent simulation coordinate lists
              if (onRoutesFetched) {
                onRoutesFetched(data.routes);
              }

              // Render alternative routes if they exist
              data.routes.forEach((route, idx) => {
                const routeCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

                if (idx === selectedRouteIndex) {
                  // Drawing primary selected route
                  if (polylineRef.current) {
                    polylineRef.current.remove();
                  }

                  polylineRef.current = window.L.polyline(routeCoords, {
                    color: isDarkMode ? '#60A5FA' : '#3B82F6', // Royal Blue
                    weight: 7,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round',
                    zIndex: 100
                  }).addTo(map);
                } else {
                  // Drawing alternative routes
                  const altPoly = window.L.polyline(routeCoords, {
                    color: '#94A3B8', // Slate Gray
                    weight: 5,
                    opacity: 0.65,
                    lineCap: 'round',
                    lineJoin: 'round',
                    dashArray: '4, 8',
                    zIndex: 50
                  }).addTo(map);

                  // Let users select this route directly by clicking it
                  altPoly.on('click', () => {
                    if (onSelectRoute) onSelectRoute(idx);
                  });

                  altPolylinesRef.current.push(altPoly);
                }
              });
            } else {
              drawFallbackNavLine();
            }
          })
          .catch(err => {
            console.warn("OSRM navigation routing failed, drawing straight line instead:", err);
            drawFallbackNavLine();
          });
      } else if (showTravelRoute && spots.length > 1) {
        // Standard Day sequence routing
        const coordsQuery = spots.map(s => `${s.lng},${s.lat}`).join(';');
        const routingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordsQuery}?overview=full&geometries=geojson`;

        fetch(routingUrl)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
              const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

              if (polylineRef.current) {
                polylineRef.current.remove();
              }

              polylineRef.current = window.L.polyline(routeCoords, {
                color: isDarkMode ? '#F87171' : '#EF4444',
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);
            } else {
              drawFallbackLine();
            }
          })
          .catch(err => {
            console.warn("OSRM street routing failed, drawing straight line instead:", err);
            drawFallbackLine();
          });
      }

      function drawFallbackNavLine() {
        if (!userLocation || !selectedSpot) return;
        polylineRef.current = window.L.polyline([[userLocation.lat, userLocation.lng], [selectedSpot.lat, selectedSpot.lng]], {
          color: '#3B82F6',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 12'
        }).addTo(map);
      }

      function drawFallbackLine() {
        const coords = spots.map(s => [s.lat, s.lng]);
        polylineRef.current = window.L.polyline(coords, {
          color: '#EF4444',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 12'
        }).addTo(map);
      }

      if (isNavigating && userLocation) {
        // Track coordinate tightly in central viewport
        map.setView([userLocation.lat, userLocation.lng], 17.5);
      } else if (showTravelRoute && spots.length > 1) {
        const bounds = window.L.latLngBounds(spots.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      } else {
        const activeLat = selectedSpot ? selectedSpot.lat : spots[0].lat;
        const activeLng = selectedSpot ? selectedSpot.lng : spots[0].lng;
        map.setView([activeLat, activeLng], 15);
      }

      // Save parameters
      lastRouteParamsRef.current = { spotsKey: keyPrefix + spotsKey, showTravelRoute, isDarkMode };
    } else {
      // ONLY update selection visually without recreating markers or polylines
      spots.forEach((s, idx) => {
        const isSelected = selectedSpot && selectedSpot.lat === s.lat && selectedSpot.lng === s.lng;
        const marker = markersRef.current[idx];
        if (marker) {
          const pulseHtml = isSelected
            ? `<div class="relative flex items-center justify-center h-5 w-5"><div class="absolute h-5 w-5 rounded-full bg-red-500 animate-ping opacity-60"></div><div class="h-3.5 w-3.5 rounded-full bg-red-600 border-2 border-white shadow-md"></div></div>`
            : `<div class="h-3 w-3 rounded-full bg-red-500 border border-white shadow-md hover:scale-125 hover:bg-red-600 transition-all"></div>`;

          const customIcon = window.L.divIcon({
            html: pulseHtml,
            className: 'custom-dot-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          marker.setIcon(customIcon);

          const orderPrefix = showTravelRoute ? `${idx + 1}. ` : '';
          marker.unbindTooltip();
          marker.bindTooltip(orderPrefix + (s.name?.[language] || ''), {
            permanent: isSelected,
            direction: 'top',
            className: 'leaflet-custom-tooltip font-outfit font-extrabold text-[10.5px] border-none shadow-sm rounded-lg bg-gray-900 text-white px-2 py-1'
          });
        }
      });

      // Handle center panning smoothly on spot selection
      if (selectedSpot) {
        if (isNavigating && userLocation) {
          map.setView([userLocation.lat, userLocation.lng], 17.5);
        } else if (!showTravelRoute) {
          map.setView([selectedSpot.lat, selectedSpot.lng], 16);
        } else {
          map.panTo([selectedSpot.lat, selectedSpot.lng]);
        }
      }
    }

  }, [mapLoaded, spots, selectedSpot, showTravelRoute, language, isNavigating, userLocation, transportMode, userHeading, activeStreetName, isDarkMode, alternativeRoutes, selectedRouteIndex, mapRotationActive]);

  return (
    <>
      <style>{`
        .leaflet-custom-tooltip {
          background-color: #111827 !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
        }
        .leaflet-custom-tooltip::before {
          border-top-color: #111827 !important;
        }
        .leaflet-container {
          font-family: inherit !important;
        }
        .leaflet-tilted {
          transform: perspective(800px) rotateX(32deg) scale(1.18);
          transform-origin: bottom center;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .leaflet-map-rotated {
          transform: rotate(var(--map-rotation, 0deg));
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
      <div 
        id={mapContainerId} 
        style={mapRotationStyle}
        className={`w-full h-full relative z-10 transition-all duration-500 ${isNavigating ? 'leaflet-tilted' : ''} ${mapRotationActive ? 'leaflet-map-rotated' : ''}`} 
      />
    </>
  );
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
  const [showTravelRoute, setShowTravelRoute] = useState(false); // Toggle to show connected daily route
  const [isNavigating, setIsNavigating] = useState(false);
  const [userSpeed, setUserSpeed] = useState(0); // Speed in km/h
  const [userHeading, setUserHeading] = useState(null); // Compass heading degrees
  const watchIdRef = React.useRef(null);

  // Advanced Navigation States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [mapRotationActive, setMapRotationActive] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(50); // Speed limit in km/h
  const [wsConnected, setWsConnected] = useState(true); // WS realtime status
  const [wsSyncedCount, setWsSyncedCount] = useState(0); // WS sync animation counter
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [turnAlert, setTurnAlert] = useState(''); // Near turn alert popups
  const [activeManeuvers, setActiveManeuvers] = useState([]); // List of steps parsed from OSRM
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Alternative routes states
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // OSRM Simulation States
  const [simCoords, setSimCoords] = useState([]);
  const [simIndex, setSimIndex] = useState(0);
  const [simActiveStreet, setSimActiveStreet] = useState('Đường Tứ Ngân 02');
  const [simDistance, setSimDistance] = useState(14);
  const [simDuration, setSimDuration] = useState(19);

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
      setActivePlannerTab('viewer');
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
          const { latitude, longitude, speed, heading } = position.coords;
          const distToHoiAn = getDistanceKm(latitude, longitude, 15.8771, 108.3267);
          if (distToHoiAn > 30) {
            setIsFarAway(true);
          } else {
            setUserLocation({ lat: latitude, lng: longitude });
            setIsFarAway(false);
          }
          const speedKmH = speed ? Math.round(speed * 3.6) : 0;
          setUserSpeed(speedKmH);
          setUserHeading(heading !== null && heading !== undefined ? heading : null);
          setIsLocating(false);
        },
        (error) => {
          console.warn("Geolocation warning:", error);
          setIsLocating(false);
          setIsFarAway(true); // Fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const speakInstruction = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  const calculateHeading = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  const handleStartNavigation = () => {
    if (!selectedSpot) {
      alert(language === 'vi' ? "Vui lòng chọn một địa điểm để bắt đầu dẫn đường!" : "Please select a destination to start navigation!");
      return;
    }

    setIsNavigating(true);
    setTurnAlert('');

    let osrmProfile = 'driving';
    if (transportMode === 'foot') osrmProfile = 'foot';
    else if (transportMode === 'bike') osrmProfile = 'bicycle';

    const originLat = userLocation.lat;
    const originLng = userLocation.lng;

    const routingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${originLng},${originLat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

    const generateFallbackSimCoords = () => {
      const stepsCount = 40;
      const coords = [];
      for (let i = 0; i <= stepsCount; i++) {
        const lat = originLat + (selectedSpot.lat - originLat) * (i / stepsCount);
        const lng = originLng + (selectedSpot.lng - originLng) * (i / stepsCount);
        coords.push({ lat, lng });
      }
      setSimCoords(coords);
      setSimIndex(0);
      setAlternativeRoutes([{ distance: getDistanceKm(originLat, originLng, selectedSpot.lat, selectedSpot.lng) * 1000, duration: 900 }]);
      setSelectedRouteIndex(0);
      setActiveManeuvers([]);
      setActiveStepIndex(0);
      speakInstruction(language === 'vi' ? `Bắt đầu dẫn đường bằng GPS tới ${selectedSpot.name.vi}.` : `Starting GPS navigation to ${selectedSpot.name.en}.`);
    };

    fetch(routingUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          setAlternativeRoutes(data.routes);
          setSelectedRouteIndex(0);
          
          const primaryRoute = data.routes[0];
          const coords = primaryRoute.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
          setSimCoords(coords);
          setSimIndex(0);

          // Parse intermediate steps and turn maneuvers
          const steps = primaryRoute.legs?.[0]?.steps || [];
          setActiveManeuvers(steps);
          setActiveStepIndex(0);

          const targetName = selectedSpot.name[language]?.split(',')[0] || '';
          speakInstruction(language === 'vi' ? `Bắt đầu dẫn đường tới ${targetName}. Hướng di chuyển thẳng.` : `Navigating to ${targetName}. Head straight.`);
        } else {
          generateFallbackSimCoords();
        }
      })
      .catch(err => {
        console.warn("OSRM routing fetch failed, generating fallback coordinates:", err);
        generateFallbackSimCoords();
      });
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setUserSpeed(0);
    setUserHeading(null);
    setSimCoords([]);
    setSimIndex(0);
    setTurnAlert('');
    setActiveManeuvers([]);
    setActiveStepIndex(0);
    setAlternativeRoutes([]);
    setSelectedRouteIndex(0);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Live real-time search geocoder: Supports spots, street names and custom coords search
  const handleSearchLocation = (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const trimmed = query.trim();

    // 1. Coordinates check: e.g. "15.877, 108.326"
    const coordRegex = /^[-+]?([1-9]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordRegex.test(trimmed)) {
      const parts = trimmed.split(',');
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      setSearchResults([{
        id: 'search-coord',
        name: { vi: `Tọa độ: ${lat}, ${lng}`, en: `Coordinates: ${lat}, ${lng}` },
        reason: { vi: 'Điểm ghim tùy chỉnh theo vĩ độ/kinh độ', en: 'Custom pinned coordinate point' },
        lat,
        lng,
        isCoord: true,
        category: 'sightseeing'
      }]);
      return;
    }

    // 2. Filter local spots
    const matchedSpots = allDbSpots.filter(s =>
      s.name[language]?.toLowerCase().includes(trimmed.toLowerCase())
    );

    // 3. Nominatim OpenStreetMap API query
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=Hoi An ${trimmed}&limit=4`)
      .then(res => res.json())
      .then(data => {
        const apiResults = data.map((item, idx) => ({
          id: `search-api-${idx}`,
          name: { vi: item.display_name.split(',')[0], en: item.display_name.split(',')[0] },
          reason: { vi: item.display_name, en: item.display_name },
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          isApi: true,
          category: 'sightseeing'
        }));
        setSearchResults([...matchedSpots.slice(0, 3), ...apiResults]);
      })
      .catch(() => {
        setSearchResults(matchedSpots.slice(0, 5));
      });
  };

  const lastSpeedAlertRef = React.useRef(0);

  // Dynamic Navigation simulation interval runner (1.5s step ticks)
  useEffect(() => {
    let intervalId = null;

    if (isNavigating && simCoords.length > 0) {
      intervalId = setInterval(() => {
        setSimIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < simCoords.length) {
            const currentPoint = simCoords[nextIndex];
            setUserLocation(currentPoint);

            // Compute dynamic route heading
            if (nextIndex + 1 < simCoords.length) {
              const nextPoint = simCoords[nextIndex + 1];
              const heading = calculateHeading(currentPoint.lat, currentPoint.lng, nextPoint.lat, nextPoint.lng);
              setUserHeading(heading);
            }

            // Sum up remaining distance segments
            let remainingDist = 0;
            for (let i = nextIndex; i < simCoords.length - 1; i++) {
              remainingDist += getDistanceKm(simCoords[i].lat, simCoords[i].lng, simCoords[i + 1].lat, simCoords[i + 1].lng);
            }
            if (remainingDist === 0) {
              remainingDist = getDistanceKm(currentPoint.lat, currentPoint.lng, selectedSpot.lat, selectedSpot.lng);
            }
            setSimDistance(parseFloat(remainingDist.toFixed(1)));

            // Compute remaining duration
            let baseSpeed = 40;
            if (transportMode === 'foot') baseSpeed = 5;
            else if (transportMode === 'bike') baseSpeed = 15;
            else if (transportMode === 'car') baseSpeed = 50;

            const durationMins = Math.max(1, Math.round((remainingDist / baseSpeed) * 60));
            setSimDuration(durationMins);

            // Speed fluctuations (jumping numbers)
            const variance = transportMode === 'foot' ? 1 : transportMode === 'bike' ? 3 : 8;
            const randomSpeed = Math.max(0, baseSpeed + Math.floor(Math.random() * variance * 2) - variance);
            setUserSpeed(randomSpeed);

            // Exceed speed limit check
            const limit = transportMode === 'foot' ? 5 : transportMode === 'bike' ? 20 : transportMode === 'car' ? 60 : 50;
            setSpeedLimit(limit);
            if (randomSpeed > limit && Date.now() - lastSpeedAlertRef.current > 8000) {
              speakInstruction(language === 'vi' ? "Cảnh báo! Bạn đang vượt quá tốc độ giới hạn! Vui lòng giảm tốc." : "Warning! You are exceeding the speed limit! Please slow down.");
              lastSpeedAlertRef.current = Date.now();
            }

            // Dynamic street name cycler
            const streetIdx = Math.floor(nextIndex / 4) % HOI_AN_STREETS.length;
            setSimActiveStreet(HOI_AN_STREETS[streetIdx]);

            // WebSocket broadcast sync heartbeat mock
            if (wsConnected) {
              setWsSyncedCount(prev => prev + 1);
            }

            // Parse intermediate turn maneuvers and alert popups
            if (activeManeuvers && activeManeuvers.length > 0 && activeStepIndex < activeManeuvers.length) {
              const step = activeManeuvers[activeStepIndex];
              if (step && step.location) {
                const distToTurn = getDistanceKm(currentPoint.lat, currentPoint.lng, step.location[1], step.location[0]) * 1000;
                
                if (distToTurn < 80) {
                  const modifier = step.maneuver?.modifier || '';
                  let turnLabel = '';
                  
                  if (language === 'vi') {
                    const dir = modifier.includes('left') ? 'rẽ trái' : modifier.includes('right') ? 'rẽ phải' : 'đi thẳng';
                    turnLabel = `Chuẩn bị ${dir} vào ${step.name || 'đường mới'} trong 50 mét!`;
                  } else {
                    const dir = modifier.includes('left') ? 'turn left' : modifier.includes('right') ? 'turn right' : 'go straight';
                    turnLabel = `Prepare to ${dir} onto ${step.name || 'new road'} in 50 meters!`;
                  }

                  setTurnAlert(turnLabel);
                  speakInstruction(turnLabel);
                  setActiveStepIndex(prev => prev + 1);

                  setTimeout(() => setTurnAlert(''), 4500);
                }
              }
            }

            return nextIndex;
          } else {
            clearInterval(intervalId);
            handleStopNavigation();
            setTimeout(() => {
              speakInstruction(language === 'vi' ? "Bạn đã đến nơi lưu trú an toàn!" : "You have arrived safely at your destination!");
              alert(language === 'vi' ? "🎉 Bạn đã đến địa điểm an toàn!" : "🎉 You have arrived at your destination!");
            }, 100);
            return prevIndex;
          }
        });
      }, 1500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isNavigating, simCoords, transportMode, language, activeManeuvers, activeStepIndex, wsConnected]);

  // Geolocation watch cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
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
      minCost: backendSpot.minCost || 0,
      maxCost: backendSpot.maxCost || 0,
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
    if (!itinerary) return { totalMin: 0, totalMax: 0, accommodationMin: 0, accommodationMax: 0, foodMin: 0, foodMax: 0, activitiesMin: 0, activitiesMax: 0, transport: 0 };

    let accMinCost = 0, accMaxCost = 0;
    let foodMinCost = 0, foodMaxCost = 0;
    let actMinCost = 0, actMaxCost = 0;
    let transCost = 0;

    itinerary.forEach((d) => {
      if (d.accommodation) {
        accMinCost += (d.accommodation.minCost || d.accommodation.cost || 0) * (adults + children / 2);
        accMaxCost += (d.accommodation.maxCost || d.accommodation.cost || 0) * (adults + children / 2);
      }

      if (d.slots) {
        d.slots.forEach(s => {
          if (s.slot === 'STAY') return; // STAY is counted in accommodation
          const min = (s.spot?.minCost || s.spot?.cost || 0) * (adults + children);
          const max = (s.spot?.maxCost || s.spot?.cost || 0) * (adults + children);
          if (s.slot === 'LUNCH' || s.spot?.category?.toLowerCase() === 'food') {
            foodMinCost += min;
            foodMaxCost += max;
          } else if (s.slot?.includes('CAFE') || s.spot?.category?.toLowerCase() === 'cafe') {
            foodMinCost += min;
            foodMaxCost += max;
          } else {
            actMinCost += min;
            actMaxCost += max;
          }
        });
      } else {
        // Fallback for old loaded formats
        if (d.morning) {
          foodMinCost += (d.morning.minCost || d.morning.cost || 0) * (adults + children);
          foodMaxCost += (d.morning.maxCost || d.morning.cost || 0) * (adults + children);
        }
        if (d.evening) {
          foodMinCost += (d.evening.minCost || d.evening.cost || 0) * (adults + children);
          foodMaxCost += (d.evening.maxCost || d.evening.cost || 0) * (adults + children);
        }
        if (d.afternoon) {
          actMinCost += (d.afternoon.minCost || d.afternoon.cost || 0) * (adults + children);
          actMaxCost += (d.afternoon.maxCost || d.afternoon.cost || 0) * (adults + children);
        }
      }
      transCost += 150000;
    });

    return {
      totalMin: Math.round(accMinCost + foodMinCost + actMinCost + transCost),
      totalMax: Math.round(accMaxCost + foodMaxCost + actMaxCost + transCost),
      accommodationMin: accMinCost,
      accommodationMax: accMaxCost,
      foodMin: foodMinCost,
      foodMax: foodMaxCost,
      activitiesMin: actMinCost,
      activitiesMax: actMaxCost,
      transport: transCost
    };
  };

  const costs = getItineraryCosts();
  const isOverBudget = costs.totalMax > budget;

  const getActiveDaySpots = () => {
    if (!itinerary) return [];
    const activeDayData = itinerary[activeDay - 1];
    if (!activeDayData) return [];
    const activeAcc = activeDayData.accommodation;

    const displaySlots = activeDayData.slots
      ? activeDayData.slots.filter(s => s.spot && s.slot !== 'STAY')
      : [
        { slot: 'morning', spot: activeDayData.morning },
        { slot: 'afternoon', spot: activeDayData.afternoon },
        { slot: 'evening', spot: activeDayData.evening }
      ].filter(s => s.spot);

    const spotsList = [];
    if (activeAcc) spotsList.push(activeAcc);
    displaySlots.forEach(s => {
      if (s.spot) spotsList.push(s.spot);
    });
    return spotsList;
  };

  const activeDaySpots = getActiveDaySpots();

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

  // Dynamic stats synced with simulation or multi-route alternatives
  const activeDistance = isNavigating 
    ? simDistance 
    : (alternativeRoutes && alternativeRoutes[selectedRouteIndex] 
        ? parseFloat((alternativeRoutes[selectedRouteIndex].distance / 1000).toFixed(1)) 
        : routeMetrics.distance);

  const activeDuration = isNavigating 
    ? simDuration 
    : (alternativeRoutes && alternativeRoutes[selectedRouteIndex] 
        ? Math.max(1, Math.round(alternativeRoutes[selectedRouteIndex].duration / 60)) 
        : routeMetrics.duration);

  const renderItineraryContent = () => {
    if (!itinerary) return null;
    return (
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
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
              {language === 'vi' ? 'Tổng chi phí ước tính' : 'Estimated Cost'}
            </span>
            <div className="flex items-center gap-1 text-gray-850 font-extrabold font-outfit text-[13px] md:text-sm lg:text-[15px] whitespace-nowrap">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              {costs.totalMin.toLocaleString()}đ - {costs.totalMax.toLocaleString()}đ
            </div>
          </div>

          <div className="flex flex-col relative z-10">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
              {language === 'vi' ? 'Trạng thái ngân sách' : 'Budget Status'}
            </span>
            <div className={`flex items-center gap-1 font-extrabold font-outfit text-xs md:text-sm ${costs.totalMax > budget ? 'text-red-600' : 'text-ricefield-green'}`}>
              {costs.totalMax > budget ? (
                <>
                  <span className="text-sm">⚠️</span>
                  {language === 'vi' ? 'Có nguy cơ vượt ngân sách!' : 'Risk of Over Budget!'}
                </>
              ) : (
                <>
                  <span className="text-sm">✅</span>
                  {language === 'vi' ? 'Ngân sách an toàn' : 'Budget Safe'}
                </>
              )}
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

        {/* Day selection tabs & Route Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3 overflow-x-auto select-none">
          <div className="flex gap-2">
            {itinerary.map((d) => (
              <button
                key={d.day}
                onClick={() => {
                  setActiveDay(d.day);
                  setSelectedSpot(d.accommodation);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${activeDay === d.day
                  ? 'bg-heritage-amber text-white shadow-md shadow-heritage-amber/15 scale-[1.02]'
                  : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400'
                  }`}
              >
                {t('dayTab')} {d.day}
              </button>
            ))}
          </div>

          {/* Premium Travel Route button - placed outside */}
          <button
            type="button"
            onClick={() => setShowTravelRoute(!showTravelRoute)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 border shadow-sm ${showTravelRoute
              ? 'bg-gradient-to-tr from-heritage-amber to-heritage-gold text-white border-transparent shadow-md scale-[1.02]'
              : 'bg-white border-gray-200 text-gray-600 hover:text-heritage-amber hover:border-gray-300'
              }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${showTravelRoute ? 'animate-pulse' : ''}`} />
            {language === 'vi' ? 'Xem Lộ Trình Cả Ngày' : 'Show Daily Route'}
          </button>
        </div>

        {/* Layout for Timeline vs Cost Breakdown & Dynamic GPS Maps */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Timeline Column */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {itinerary[activeDay - 1].accommodation ? (
              <div
                onClick={() => setSelectedSpot(itinerary[activeDay - 1].accommodation)}
                className={`w-full bg-white border p-4 rounded-xl flex gap-4 items-center shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md shimmer-trigger animate-fade-in-up [animation-delay:100ms] ${selectedSpot && selectedSpot.lat === itinerary[activeDay - 1].accommodation.lat
                  ? 'border-heritage-amber ring-2 ring-heritage-amber/20 scale-[1.01]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={itinerary[activeDay - 1].accommodation.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                    alt="Homestay"
                    className="w-16 h-16 rounded-lg object-cover relative z-10"
                  />
                  {showTravelRoute && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 z-25">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <div className="flex-grow relative z-10">
                  <span className="text-[9px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 font-bold px-1.5 py-0.5 rounded-md uppercase leading-none">{t('restPlace')}</span>
                  <h4 className="font-outfit text-sm font-bold text-gray-900 mt-1">{itinerary[activeDay - 1].accommodation.name?.[language] || 'Homestay / Khách sạn'}</h4>
                  <p className="text-[10.5px] text-gray-500 leading-normal">{itinerary[activeDay - 1].accommodation.reason?.[language] || 'Nơi lưu trú thư giãn lý tưởng.'}</p>
                </div>
                <div className="text-right flex-shrink-0 relative z-10">
                  <span className="text-[10px] text-gray-400 block">{t('estimatedNight')}</span>
                  <span className="text-xs font-extrabold text-heritage-amber">
                    {(itinerary[activeDay - 1].accommodation.minCost > 0 || itinerary[activeDay - 1].accommodation.maxCost > 0)
                      ? `${itinerary[activeDay - 1].accommodation.minCost.toLocaleString()}đ - ${itinerary[activeDay - 1].accommodation.maxCost.toLocaleString()}đ`
                      : (language === 'vi' ? 'Miễn phí' : 'Free')}
                  </span>
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
                    className={`relative flex gap-4 bg-white border p-4 rounded-2xl group hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer shimmer-trigger animate-fade-in-up ${delay} ${isFocus
                      ? 'border-heritage-amber ring-2 ring-heritage-amber/20 scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {/* Timeline node */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`p-2 rounded-xl border ${color} flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative`}>
                        <Icon className="w-4 h-4" />
                        {showTravelRoute && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-25">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        )}
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
                        <h4 className={`font-outfit text-sm font-bold transition-colors ${isFocus ? 'text-heritage-amber font-extrabold' : 'text-gray-900 group-hover:text-heritage-amber'
                          }`}>
                          {item.name?.[language] || 'Địa điểm tham quan'}
                        </h4>
                        <span className="text-xs font-extrabold text-heritage-amber flex-shrink-0">
                          {(item.minCost > 0 || item.maxCost > 0)
                            ? `${item.minCost.toLocaleString()}đ - ${item.maxCost.toLocaleString()}đ`
                            : t('free')}
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

              {/* Live GPS Active banner */}
              {isNavigating && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col gap-3 relative z-10 animate-fade-in shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <span className="text-[11px] font-extrabold text-blue-900">{t('mapNavigating')}</span>
                    </div>
                    <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-black">GPS HIGH ACCURACY</span>
                  </div>

                  {/* Speedometer & Compass Details */}
                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-inner">
                    <div className="flex flex-col items-center justify-center border-r border-blue-100 py-1">
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Tốc độ hiện tại' : 'Current Speed'}</span>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span className="text-xl font-black font-outfit text-blue-600 tracking-tight">{userSpeed}</span>
                        <span className="text-[9px] text-gray-500 font-bold">km/h</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-1">
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Hướng di chuyển' : 'Heading'}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {userHeading !== null ? (
                          <>
                            <Compass
                              className="w-4 h-4 text-indigo-600 transition-transform duration-300"
                              style={{ transform: `rotate(${userHeading}deg)` }}
                            />
                            <span className="text-xs font-black font-outfit text-indigo-900">{Math.round(userHeading)}°</span>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold italic">{language === 'vi' ? 'Đang đứng yên' : 'Stationary'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Maps embed Frame */}
              <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200/80 shadow-inner relative bg-gray-50 z-10">
                <LeafletMap
                  spots={activeDaySpots}
                  selectedSpot={selectedSpot}
                  showTravelRoute={showTravelRoute}
                  language={language}
                  isNavigating={isNavigating}
                  userLocation={userLocation}
                  transportMode={transportMode}
                  userHeading={userHeading}
                  activeStreetName={isNavigating ? simActiveStreet : ''}
                  isDarkMode={isDarkMode}
                  alternativeRoutes={alternativeRoutes}
                  selectedRouteIndex={selectedRouteIndex}
                  onSelectRoute={setSelectedRouteIndex}
                  mapRotationActive={mapRotationActive}
                  onRoutesFetched={(routes) => {
                    setAlternativeRoutes(routes);
                  }}
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
                      <span className="text-sm font-extrabold text-heritage-amber">{activeDistance} km</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-150 flex flex-col justify-center items-center hover:scale-102 transition-transform">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">{t('mapDuration')}</span>
                      <span className="text-sm font-extrabold text-ricefield-green">~{activeDuration} {language === 'vi' ? 'phút' : 'min'}</span>
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
                            className={`p-1.5 rounded-md cursor-pointer transition-colors border-none ${transportMode === item.mode
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

                  {/* Live Navigation Button */}
                  <button
                    onClick={isNavigating ? handleStopNavigation : handleStartNavigation}
                    className={`w-full mt-1.5 py-3 bg-gradient-to-tr from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] border-none ${isNavigating ? 'bg-red-500 hover:bg-red-650 animate-pulse' : ''
                      }`}
                  >
                    <Navigation className={`w-4 h-4 ${isNavigating ? 'animate-spin' : ''}`} />
                    {isNavigating ? t('mapStopNav') : t('mapStartNav')}
                  </button>

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
                  { name: t('costsAccommodation'), min: costs.accommodationMin, max: costs.accommodationMax, color: 'bg-indigo-600' },
                  { name: t('costsFood'), min: costs.foodMin, max: costs.foodMax, color: 'bg-heritage-amber' },
                  { name: t('costsActivities'), min: costs.activitiesMin, max: costs.activitiesMax, color: 'bg-ricefield-green' },
                  { name: t('costsTransport'), min: costs.transport, max: costs.transport, color: 'bg-gray-400' }
                ].map((cat) => {
                  const pct = costs.totalMax > 0 ? (cat.max / costs.totalMax) * 100 : 0;
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
                      <span className="text-[10px] text-gray-400 text-right font-semibold">
                        {cat.min === cat.max ? `${cat.min.toLocaleString()}đ` : `${cat.min.toLocaleString()}đ - ${cat.max.toLocaleString()}đ`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 relative z-10">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('advisorTitle')}</span>
                <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50 border border-gray-200 p-3.5 rounded-xl">
                  {isOverBudget
                    ? t('advisorOver')
                    : t('advisorUnder')
                  }
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col items-center gap-10">
      {/* Page Title */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber px-4 py-1.5 rounded-full text-xs font-semibold animate-float">
          <Sparkles className="w-4 h-4 text-heritage-gold animate-spin-slow" />
          Travelist Trip Planner Studio
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${activePlannerTab === 'studio'
            ? 'bg-white text-heritage-amber shadow-sm'
            : 'text-gray-500 hover:text-gray-900 bg-transparent'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          {language === 'vi' ? 'Sinh Lịch Trình AI' : 'AI Trip Planner'}
        </button>
        {itinerary && (
          <button
            onClick={() => setActivePlannerTab('viewer')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${activePlannerTab === 'viewer'
              ? 'bg-white text-heritage-amber shadow-sm'
              : 'text-gray-500 hover:text-gray-900 bg-transparent'
              }`}
          >
            <Navigation className="w-4 h-4 text-ricefield-green" />
            {t('mapActiveTab')}
          </button>
        )}
        <button
          onClick={() => {
            setActivePlannerTab('saved');
            fetchSavedItineraries();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 border-none cursor-pointer ${activePlannerTab === 'saved'
            ? 'bg-white text-heritage-amber shadow-sm'
            : 'text-gray-500 hover:text-gray-900 bg-transparent'
            }`}
        >
          <Calendar className="w-4 h-4" />
          {language === 'vi' ? '🎒 Lịch Trình Của Tôi' : '🎒 My Saved Itineraries'}
        </button>
      </div>

      {activePlannerTab === 'studio' && (
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
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer ${interests.includes(tag)
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
            {!loading && itinerary && renderItineraryContent()}
          </div>
        </div>
      )}

      {activePlannerTab === 'viewer' && (
        <div className="w-full max-w-5xl">
          {renderItineraryContent()}
        </div>
      )}

      {activePlannerTab === 'saved' && (
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-650 font-bold text-xs rounded-xl border-none cursor-pointer transition-colors"
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
          <div className={`border w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-900 shadow-slate-950/80' : 'bg-white border-gray-200'}`}>

            {/* Modal Header - Hidden if navigating to maximize immersive dashboard view */}
            {!isNavigating && (
              <div className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-b border-slate-800 text-slate-100' : 'bg-heritage-amber text-white'}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl animate-float ${isDarkMode ? 'bg-slate-800 text-heritage-gold' : 'bg-white/25 text-white'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-outfit text-sm sm:text-base font-extrabold tracking-tight">
                      {language === 'vi' ? 'Bản Đồ Chỉ Dẫn Chi Tiết (AI)' : 'AI Navigation Studio'}
                    </h4>
                    <span className="block text-[10px] font-bold uppercase tracking-wider leading-none opacity-80">
                      {selectedSpot ? selectedSpot.name[language] : ''}
                    </span>
                  </div>
                </div>

                {/* Segmented Tab Control - visible ONLY on mobile screens */}
                <div className={`flex md:hidden p-1 rounded-xl border w-fit self-center ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-white/20 border-white/10'}`}>
                  <button
                    type="button"
                    onClick={() => setActiveModalView('map')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none ${activeModalView === 'map'
                      ? (isDarkMode ? 'bg-slate-800 text-heritage-gold shadow-sm' : 'bg-white text-heritage-amber shadow-sm')
                      : (isDarkMode ? 'text-slate-400 hover:bg-slate-800/40 bg-transparent' : 'text-white hover:bg-white/5 bg-transparent')
                      }`}
                  >
                    {language === 'vi' ? 'Bản Đồ' : 'Map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalView('details')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none ${activeModalView === 'details'
                      ? (isDarkMode ? 'bg-slate-800 text-heritage-gold shadow-sm' : 'bg-white text-heritage-amber shadow-sm')
                      : (isDarkMode ? 'text-slate-400 hover:bg-slate-800/40 bg-transparent' : 'text-white hover:bg-white/5 bg-transparent')
                      }`}
                  >
                    {language === 'vi' ? 'Chỉ dẫn & Mẹo' : 'Steps & Tips'}
                  </button>
                </div>

                <button
                  onClick={() => setIsMapMaximized(false)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:scale-110 transition-transform ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-white hover:bg-white/10'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Modal Body - Map Split Layout */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
              {/* Actual Map frame - Shown on mobile if 'map' is active, always shown on md+ */}
              <div className={`flex-grow h-full relative overflow-hidden bg-gray-50 ${activeModalView === 'map' ? 'flex' : 'hidden md:flex'}`}>
                
                {/* Dynamic Leaflet Map Component */}
                <LeafletMap
                  spots={activeDaySpots}
                  selectedSpot={selectedSpot}
                  showTravelRoute={showTravelRoute}
                  language={language}
                  isNavigating={isNavigating}
                  userLocation={userLocation}
                  transportMode={transportMode}
                  userHeading={userHeading}
                  activeStreetName={simActiveStreet}
                  isDarkMode={isDarkMode}
                  alternativeRoutes={alternativeRoutes}
                  selectedRouteIndex={selectedRouteIndex}
                  onSelectRoute={(idx) => setSelectedRouteIndex(idx)}
                  mapRotationActive={mapRotationActive}
                  onRoutesFetched={(routes) => setAlternativeRoutes(routes)}
                />

                {/* Floating Realtime Search Input (Visible only when not active navigating) */}
                {!isNavigating && (
                  <div className="absolute top-4 left-4 z-[40] w-full max-w-xs sm:max-w-sm px-2">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                      <div className="flex items-center px-3.5 py-2">
                        <MapPin className="w-4 h-4 text-heritage-amber dark:text-heritage-gold mr-2.5 flex-shrink-0 animate-pulse" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchLocation(e.target.value)}
                          placeholder={language === 'vi' ? 'Tìm địa điểm, tên đường hoặc tọa độ...' : 'Search spot, street name, coords...'}
                          className="w-full bg-transparent border-none text-xs font-semibold text-gray-800 dark:text-slate-100 focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 border-none bg-transparent cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {searchResults.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-slate-800 max-h-[200px] overflow-y-auto bg-white/95 dark:bg-slate-900/95">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => {
                                setSelectedSpot(result);
                                setSearchQuery('');
                                setSearchResults([]);
                                const centerEvent = new CustomEvent('recenter-map');
                                window.dispatchEvent(centerEvent);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-heritage-amber/5 dark:hover:bg-slate-850 flex flex-col border-none bg-transparent cursor-pointer transition-colors border-b border-gray-50 dark:border-slate-800/80 last:border-b-0"
                            >
                              <strong className="text-xs text-gray-850 dark:text-slate-200 font-extrabold">{result.name[language]}</strong>
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 leading-tight truncate">{result.reason[language]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- FLOATING NAVIGATION HUD OVERLAYS (Visible only in simulation mode) --- */}
                {isNavigating && (
                  <>
                    {/* Top Green Turn Steps HUD Banner */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-xl">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-emerald-500/30">
                        {/* Dynamic Turn Arrow Icon */}
                        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
                          {(() => {
                            const step = activeManeuvers?.[activeStepIndex];
                            const modifier = step?.maneuver?.modifier || '';
                            // Helper inline render SVG turn arrows
                            const mod = modifier ? modifier.toLowerCase() : '';
                            if (mod.includes('left')) {
                              return (
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                              );
                            }
                            if (mod.includes('right')) {
                              return (
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                                </svg>
                              );
                            }
                            if (mod.includes('uturn')) {
                              return (
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.2 8H17" />
                                </svg>
                              );
                            }
                            return (
                              <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            );
                          })()}
                        </div>

                        {/* Turn Instruction Text & Current Street name */}
                        <div className="flex-grow">
                          <h4 className="text-xs sm:text-sm font-black tracking-tight leading-tight">
                            {(() => {
                              const step = activeManeuvers?.[activeStepIndex];
                              if (step) {
                                const modifier = step.maneuver?.modifier || '';
                                const name = step.name || (language === 'vi' ? 'đường mới' : 'new street');
                                const dir = language === 'vi'
                                  ? (modifier.includes('left') ? 'rẽ trái' : modifier.includes('right') ? 'rẽ phải' : modifier.includes('uturn') ? 'quay đầu' : 'đi thẳng')
                                  : (modifier.includes('left') ? 'turn left' : modifier.includes('right') ? 'turn right' : modifier.includes('uturn') ? 'make a U-turn' : 'go straight');
                                return language === 'vi' ? `Chuẩn bị ${dir} vào ${name}` : `Prepare to ${dir} onto ${name}`;
                              }
                              return language === 'vi' ? 'Đi thẳng theo chỉ dẫn trên bản đồ' : 'Drive straight following map guidelines';
                            })()}
                          </h4>
                          
                          {/* Current Street Tag */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] bg-white/20 text-white font-extrabold uppercase px-1.5 py-0.5 rounded leading-none">Street</span>
                            <span className="text-[11px] font-bold text-emerald-100">{simActiveStreet}</span>
                          </div>
                        </div>

                        {/* Distance to turn count */}
                        <div className="text-right flex-shrink-0 pl-2 border-l border-white/10">
                          <span className="text-[9px] text-emerald-200 block font-extrabold uppercase tracking-wider">Trong</span>
                          <span className="text-sm font-black font-outfit text-white leading-none">
                            {(() => {
                              const step = activeManeuvers?.[activeStepIndex];
                              if (step && userLocation) {
                                const dist = getDistanceKm(userLocation.lat, userLocation.lng, step.location[1], step.location[0]) * 1000;
                                return dist > 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`;
                              }
                              return 'GPS';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proximity Warning Turn Alert Popups */}
                    {turnAlert && (
                      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[42] w-[calc(100%-3rem)] max-w-md animate-bounce-slow">
                        <div className="bg-amber-500/95 backdrop-blur-md text-white border border-amber-400 px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-amber-500/25">
                          <div className="bg-white/25 p-2 rounded-xl text-white animate-pulse">
                            <ShieldAlert className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h5 className="font-outfit text-[10px] font-black uppercase tracking-wider text-amber-100 leading-none">
                              {language === 'vi' ? 'CẢNH BÁO RẼ CHUẨN BỊ' : 'MANEUVER ALERT'}
                            </h5>
                            <p className="text-xs font-extrabold mt-1.5 leading-relaxed">{turnAlert}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Floating Digital Speedometer and Traffic Sign Overlay */}
                    <div className="absolute left-4 bottom-4 z-[40] flex items-end gap-3 select-none">
                      {/* Speedometer card */}
                      <div className="bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex flex-col items-center text-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Tốc Độ</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-3xl font-black font-outfit text-white tracking-tighter leading-none animate-pulse">{userSpeed}</span>
                          <span className="text-[9px] font-bold text-slate-400 font-outfit leading-none">km/h</span>
                        </div>
                        {userSpeed > speedLimit && (
                          <span className="mt-1 text-[8px] bg-red-650 text-white font-extrabold px-1.5 py-0.5 rounded uppercase animate-pulse leading-none">Quá Tốc Độ!</span>
                        )}
                      </div>

                      {/* Red-border limit traffic sign */}
                      <div className="w-12 h-12 rounded-full border-[4px] border-red-650 bg-white shadow-lg flex items-center justify-center flex-shrink-0 animate-pulse-gold">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[15px] font-black text-slate-900 font-outfit leading-none">{speedLimit}</span>
                          <span className="text-[6px] font-bold text-slate-500 uppercase leading-none mt-0.5">LIMIT</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Charcoal Navigation Pull-Up HUD Sheet */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-xl animate-slide-in-up">
                      <div className="bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 p-5 rounded-3xl shadow-2xl flex items-center justify-between gap-6 shadow-slate-950/60">
                        <div className="flex items-center gap-5">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black font-outfit text-emerald-500 leading-none">{simDuration}</span>
                              <span className="text-xs font-bold text-emerald-400 uppercase leading-none">{language === 'vi' ? 'phút' : 'min'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                              {language === 'vi'
                                ? `Đến lúc: ${(() => {
                                  const date = new Date();
                                  date.setMinutes(date.getMinutes() + simDuration);
                                  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                })()}`
                                : `Arrival: ${(() => {
                                  const date = new Date();
                                  date.setMinutes(date.getMinutes() + simDuration);
                                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                                })()}`}
                            </span>
                          </div>

                          <div className="w-[1px] h-10 bg-slate-800" />

                          <div className="flex flex-col">
                            <span className="text-lg font-extrabold text-slate-200 font-outfit leading-none">{simDistance} km</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                              {language === 'vi' ? 'Khoảng cách' : 'Distance'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleStopNavigation}
                          className="px-5 py-3 bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider rounded-2xl shadow-lg shadow-red-650/20 border-none cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-1.5 animate-pulse"
                        >
                          <X className="w-4 h-4" />
                          {language === 'vi' ? 'THOÁT DẪN ĐƯỜNG' : 'STOP NAV'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Floating Alternative Routes Picker (Visible only if alternatives fetched & not navigating) */}
                {alternativeRoutes.length > 1 && !isNavigating && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-md animate-slide-in-up">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-800 flex flex-col gap-2.5">
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest text-center">
                        {language === 'vi' ? 'Tuyến đường thay thế (Nhấp chọn trực tiếp)' : 'Alternative Routes (Click to select)'}
                      </span>
                      <div className="flex gap-2">
                        {alternativeRoutes.map((route, rIdx) => {
                          const rDist = parseFloat((route.distance / 1000).toFixed(1));
                          const rDur = Math.max(1, Math.round(route.duration / 60));
                          const isSelected = rIdx === selectedRouteIndex;
                          return (
                            <button
                              key={`route-opt-${rIdx}`}
                              onClick={() => setSelectedRouteIndex(rIdx)}
                              className={`flex-1 text-left p-2.5 rounded-2xl border transition-all duration-300 flex flex-col justify-center border-none cursor-pointer ${isSelected
                                ? 'bg-heritage-amber/10 dark:bg-heritage-gold/10 border border-heritage-amber dark:border-heritage-gold ring-1 ring-heritage-amber/20 scale-[1.01]'
                                : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750'}`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-black text-gray-850 dark:text-slate-350">
                                  {rIdx === 0 ? (language === 'vi' ? 'Tuyến tối ưu' : 'Optimal Path') : `${language === 'vi' ? 'Tuyến' : 'Route'} ${rIdx + 1}`}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-heritage-amber dark:bg-heritage-gold animate-pulse" />
                                )}
                              </div>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-sm font-black text-gray-900 dark:text-slate-100">{rDur}</span>
                                <span className="text-[9px] font-extrabold text-gray-500 dark:text-slate-400 uppercase">{language === 'vi' ? 'phút' : 'min'}</span>
                                <span className="text-gray-300 dark:text-slate-650 mx-1 text-xs">|</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-slate-400">{rDist} km</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Circular Controls Dashboard Panel */}
                <div className="absolute right-4 top-4 z-[40] flex flex-col gap-3">
                  {/* Dark Mode Tile Switcher Toggle */}
                  <button
                    onClick={() => {
                      const nextDark = !isDarkMode;
                      setIsDarkMode(nextDark);
                      speakInstruction(language === 'vi'
                        ? (nextDark ? "Đã chuyển sang chế độ tối ban đêm." : "Đã chuyển sang chế độ sáng vệ tinh.")
                        : (nextDark ? "Switched to night dark mode." : "Switched to satellite light mode.")
                      );
                    }}
                    className={`w-11 h-11 rounded-full border-none shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-slate-900/90 border border-slate-700 text-yellow-450 shadow-slate-950/40' : 'bg-white/90 border border-gray-200/50 text-slate-800'}`}
                    title={language === 'vi' ? 'Bật/Tắt chế độ tối' : 'Toggle Dark Mode'}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5 text-yellow-455 animate-spin-slow" /> : <Moon className="w-5 h-5 text-indigo-650 animate-float" />}
                  </button>

                  {/* Voice guidance speech toggle */}
                  <button
                    onClick={() => {
                      const nextSpeech = !speechEnabled;
                      setSpeechEnabled(nextSpeech);
                      if (nextSpeech) {
                        speakInstruction(language === 'vi' ? "Đã bật âm thanh hướng dẫn giọng nói." : "Voice guidance instructions active.");
                      }
                    }}
                    className={`w-11 h-11 rounded-full border-none shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${speechEnabled ? 'bg-emerald-500/95 border border-emerald-400 text-white shadow-emerald-500/20' : 'bg-white/95 dark:bg-slate-900/95 border border-gray-200/50 dark:border-slate-800 text-gray-400 dark:text-slate-500'}`}
                    title={language === 'vi' ? 'Hướng dẫn giọng nói' : 'Voice Guidance'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      {speechEnabled ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6H4.51c-.88 0-1.704.507-1.938 1.354A9.01 9.01 0 002.25 12c0 .83.112 1.633.322 2.396C2.806 15.244 3.63 15.75 4.51 15.75H6.75l4.72 4.72a.75.75 0 001.28-.53V3.77a.75.75 0 00-1.28-.53L6.75 8.25z" />
                      )}
                    </svg>
                  </button>

                  {/* Map rotation auto-align vehicular toggle */}
                  <button
                    onClick={() => {
                      const nextRot = !mapRotationActive;
                      setMapRotationActive(nextRot);
                      if (nextRot) {
                        speakInstruction(language === 'vi' ? "Đã bật xoay bản đồ theo hướng di chuyển." : "Auto-rotating map container to vehicle direction.");
                      }
                    }}
                    className={`w-11 h-11 rounded-full border-none shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${mapRotationActive ? 'bg-indigo-650 text-white shadow-indigo-600/20' : 'bg-white/95 dark:bg-slate-900/95 border border-gray-200/50 dark:border-slate-800 text-indigo-650'}`}
                    title={language === 'vi' ? 'Tự động xoay bản đồ' : 'Auto Map Rotation'}
                  >
                    <Compass className={`w-5 h-5 ${mapRotationActive ? 'animate-spin-slow text-white' : 'text-indigo-600'}`} style={userHeading !== null ? { transform: `rotate(${userHeading}deg)` } : {}} />
                  </button>

                  {/* WebSocket database heartbeat sync sync telemetry */}
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-800 flex flex-col items-center justify-center gap-1 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[9px] font-black text-gray-500 dark:text-slate-400 tracking-wider">WS SYNC</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 font-mono leading-none mt-0.5">#{wsSyncedCount}</span>
                  </div>

                  {/* Floating Exit Navigation Button (Visible only when in active simulation navigation) */}
                  {isNavigating && (
                    <button
                      onClick={handleStopNavigation}
                      className="w-11 h-11 rounded-full border-none bg-red-650 hover:bg-red-700 text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 animate-pulse"
                      title={language === 'vi' ? 'Thoát dẫn đường' : 'Exit Navigation'}
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

              </div>

              {/* Details Side Navigation panel - Shown on mobile if 'details' is active, always shown on md+ (Hidden when actively navigating) */}
              {!isNavigating && (
                <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-850 flex flex-col bg-white dark:bg-slate-950 overflow-y-auto p-5 gap-5 animate-slide-in-right ${activeModalView === 'details' ? 'flex' : 'hidden md:flex'}`}>
                  <div className="flex flex-col gap-1 pb-3 border-b border-gray-100 dark:border-slate-850">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{t('mapRouteTo')}:</span>
                    <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-slate-100">{selectedSpot ? selectedSpot.name[language] : ''}</h3>
                    {selectedSpot && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-heritage-amber dark:text-heritage-gold font-bold">
                        <Star className="w-3.5 h-3.5 fill-heritage-gold text-heritage-gold" />
                        <span>{selectedSpot.rating || '4.8'} (215 {language === 'vi' ? 'đánh giá' : 'reviews'})</span>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-150 dark:border-slate-800 flex flex-col items-center justify-center hover:scale-102 transition-transform">
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-extrabold uppercase">{t('mapDistance')}</span>
                      <span className="text-base font-extrabold text-heritage-amber dark:text-heritage-gold mt-1">{activeDistance} km</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-150 dark:border-slate-800 flex flex-col items-center justify-center hover:scale-102 transition-transform">
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-extrabold uppercase">{t('mapDuration')}</span>
                      <span className="text-base font-extrabold text-ricefield-green dark:text-emerald-450 mt-1">~{activeDuration} {language === 'vi' ? 'phút' : 'min'}</span>
                    </div>
                  </div>

                  {/* Select Transport */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Phương tiện di chuyển' : 'Select Transport'}:</span>
                    <div className="grid grid-cols-4 gap-1.5 bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
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
                            className={`py-2 rounded-lg cursor-pointer transition-all duration-300 border-none flex items-center justify-center ${transportMode === item.mode
                              ? (isDarkMode ? 'bg-slate-800 text-heritage-gold shadow-sm font-bold scale-102' : 'bg-white text-heritage-amber shadow-sm font-bold scale-102')
                              : 'text-gray-450 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 bg-transparent'
                              }`}
                            title={item.label}
                          >
                            <ActiveIcon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Start Navigation CTA Trigger Button */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={handleStartNavigation}
                      className="w-full py-3.5 bg-gradient-to-tr from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] border-none"
                    >
                      <Navigation className="w-4 h-4 animate-pulse" />
                      {language === 'vi' ? 'BẮT ĐẦU BẢN ĐỒ' : 'START SIM NAVIGATION'}
                    </button>
                  </div>

                  {/* Detailed route steps list */}
                  <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-slate-850 pt-4">
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{t('mapStepsTitle')} (OSRM):</span>
                    <div className="flex flex-col gap-3 text-xs text-gray-655 max-h-[220px] overflow-y-auto pr-1">
                      {showTravelRoute ? (
                        // Daily schedule stops sequence
                        activeDaySpots.map((spot, idx) => {
                          const isAcc = idx === 0;
                          const isFocus = selectedSpot && selectedSpot.lat === spot.lat && selectedSpot.lng === spot.lng;

                          let segmentMetrics = null;
                          if (idx > 0) {
                            const prev = activeDaySpots[idx - 1];
                            const dist = getDistanceKm(prev.lat, prev.lng, spot.lat, spot.lng);
                            let speed = 40;
                            if (transportMode === 'foot') speed = 5;
                            if (transportMode === 'bike') speed = 15;
                            if (transportMode === 'car') speed = 45;
                            const mins = Math.max(1, Math.round((dist / speed) * 60));
                            segmentMetrics = { dist, mins };
                          }

                          const modeLabel = transportMode === 'foot'
                            ? (language === 'vi' ? 'đi bộ' : 'walk')
                            : transportMode === 'bike'
                              ? (language === 'vi' ? 'xe đạp' : 'cycle')
                              : transportMode === 'car'
                                ? (language === 'vi' ? 'ô tô' : 'drive')
                                : (language === 'vi' ? 'xe máy' : 'motorbike');

                          return (
                            <div
                              key={`step-${idx}`}
                              onClick={() => setSelectedSpot(spot)}
                              className={`flex flex-col gap-1 p-2.5 rounded-xl border cursor-pointer transition-all duration-300 ${isFocus
                                ? (isDarkMode ? 'bg-slate-900 border-heritage-gold shadow-sm ring-1 ring-heritage-gold/10' : 'bg-heritage-amber/5 border-heritage-amber shadow-sm ring-1 ring-heritage-amber/10 scale-[1.01]')
                                : 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-150 dark:border-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-850'
                                }`}
                            >
                              {segmentMetrics && (
                                <div className="flex items-center gap-1.5 pl-6 pb-2 text-[10px] text-gray-400 dark:text-slate-500 font-bold border-l-2 border-dashed border-gray-300 dark:border-slate-700 ml-2.5">
                                  <span>↓</span>
                                  <span>{segmentMetrics.dist} km ({segmentMetrics.mins} {language === 'vi' ? `phút ${modeLabel}` : `${modeLabel} mins`})</span>
                                </div>
                              )}
                              <div className="flex gap-2.5 items-start">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5 ${isAcc
                                  ? 'bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/30'
                                  : (isDarkMode ? 'bg-slate-800 text-heritage-gold border border-slate-700' : 'bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/30')
                                  }`}>
                                  {isAcc ? '🏨' : idx}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-extrabold text-gray-805 dark:text-slate-400 flex items-center gap-1">
                                    {isAcc
                                      ? (language === 'vi' ? 'Khởi hành từ nơi nghỉ' : 'Depart from accommodation')
                                      : (language === 'vi' ? `Chặng ${idx}` : `Segment ${idx}`)}
                                  </span>
                                  <strong className={`text-[11px] mt-0.5 transition-colors ${isFocus ? (isDarkMode ? 'text-heritage-gold font-extrabold' : 'text-heritage-amber font-extrabold') : 'text-gray-900 dark:text-slate-200'}`}>
                                    {spot.name?.[language] || ''}
                                  </strong>
                                  <span className="text-[10px] text-gray-500 dark:text-slate-450 leading-normal mt-0.5 font-semibold">
                                    {spot.reason?.[language] || ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Single destination transit route
                        selectedSpot && (
                          (() => {
                            const steps = [];
                            const modeLabel = transportMode === 'foot'
                              ? (language === 'vi' ? 'đi bộ' : 'walking')
                              : transportMode === 'bike'
                                ? (language === 'vi' ? 'xe đạp' : 'cycling')
                                : transportMode === 'car'
                                  ? (language === 'vi' ? 'ô tô' : 'driving')
                                  : (language === 'vi' ? 'xe máy' : 'riding');

                            steps.push({
                              title: language === 'vi' ? 'Điểm xuất phát' : 'Departure Spot',
                              desc: isFarAway
                                ? (itinerary[activeDay - 1].accommodation?.name?.[language] || (language === 'vi' ? 'Khách sạn trung tâm' : 'Central lodging'))
                                : (language === 'vi' ? 'Vị trí hiện tại của bạn (GPS chính xác)' : 'Your current precise GPS position'),
                              icon: '🏨'
                            });

                            steps.push({
                              title: language === 'vi' ? 'Lộ trình di chuyển' : 'Route Transit',
                              desc: language === 'vi'
                                ? `Di chuyển dọc theo lộ trình OSRM (~${activeDistance} km) trong khoảng ${activeDuration} phút bằng ${modeLabel}.`
                                : `Head along the specified OSRM route (~${activeDistance} km) for ~${activeDuration} mins by ${modeLabel}.`,
                              icon: '🛣️'
                            });

                            if (selectedSpot.category?.toLowerCase() === 'stay') {
                              steps.push({
                                title: language === 'vi' ? 'Nhận phòng nghỉ ngơi' : 'Check-in & Stay',
                                desc: language === 'vi'
                                  ? `Đến nơi lưu trú: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`
                                  : `Arrive at lodging: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`,
                                icon: '📍'
                              });
                            } else if (selectedSpot.category?.toLowerCase() === 'food') {
                              steps.push({
                                title: language === 'vi' ? 'Thưởng thức ẩm thực' : 'Savor Taste',
                                desc: language === 'vi'
                                  ? `Đến quán ăn: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`
                                  : `Arrive at eatery: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`,
                                icon: '🍴'
                              });
                            } else if (selectedSpot.category?.toLowerCase() === 'cafe') {
                              steps.push({
                                title: language === 'vi' ? 'Cà phê & Thư giãn' : 'Coffee & Chill',
                                desc: language === 'vi'
                                  ? `Đến quán cafe: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`
                                  : `Arrive at cafe: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`,
                                icon: '☕'
                              });
                            } else {
                              steps.push({
                                title: language === 'vi' ? 'Khám phá điểm đến' : 'Explore Destination',
                                desc: language === 'vi'
                                  ? `Đến nơi tham quan: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`
                                  : `Arrive at spot: ${selectedSpot.name[language]}. ${selectedSpot.reason[language]}`,
                                icon: '✨'
                              });
                            }

                            return steps.map((step, idx) => (
                              <div key={`nav-step-${idx}`} className="flex gap-2.5 items-start bg-gray-50/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-gray-150 dark:border-slate-800/80 transition-all duration-300 hover:border-gray-200">
                                <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-indigo-400 border border-blue-100 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">{step.icon}</div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-extrabold text-gray-800 dark:text-slate-350">{step.title}</span>
                                  <span className="text-[10.5px] text-gray-500 dark:text-slate-450 leading-normal mt-0.5 font-semibold">
                                    {step.desc}
                                  </span>
                                </div>
                              </div>
                            ));
                          })()
                        )
                      )}
                    </div>
                  </div>

                  {/* Local guide tips */}
                  <div className="mt-auto p-4 bg-green-50/50 dark:bg-emerald-950/20 border border-green-200 dark:border-emerald-900/50 rounded-2xl flex flex-col gap-1.5 animate-pulse">
                    <span className="text-[9px] text-ricefield-green dark:text-emerald-450 font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Mẹo Bản Địa' : 'Local Tip'}</span>
                    <p className="text-[11px] text-gray-655 dark:text-slate-350 leading-normal italic font-semibold">
                      {t('mapStepTip')}
                    </p>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
