import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, DollarSign, Users, Award, ShieldAlert, Check, RefreshCw, Info, Moon, Sun, Sunrise, MapPin, Navigation, Compass, Footprints, Bike, Car, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
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

const HOI_AN_STREETS = [
  'Đường Trần Phú', 'Đường Nguyễn Thái Học', 'Đường Bạch Đằng', 'Đường Phan Bội Châu',
  'Đường Lê Lợi', 'Đường Hai Bà Trưng', 'Đường Hoàng Diệu', 'Đường Nguyễn Duy Hiệu',
  'Đường Cửa Đại', 'Đường An Bàng', 'Đường Tứ Ngân 02', 'Đường Nguyễn Huệ',
  'Đường Đinh Tiên Hoàng', 'Đường Phan Chu Trinh', 'Đường Lý Thường Kiệt', 'Đường Ngô Quyền'
];

const SPOTS_DATABASE = {
  Homestay: {
    Healing: { id: 'eco-01', name: { vi: 'Homestay Làng Rau Trà Quế', en: 'Tra Que Herb Village Homestay' }, lat: 15.9019, lng: 108.3456, category: 'stay', reason: { vi: 'Không gian xanh mát, giá bình dân, gần làng rau hữu cơ', en: 'Green peaceful space, affordable, near organic herb village' } }
  },
  Cafe: [
    { id: 'eco-cafe-01', name: { vi: 'Cà Phê Reaching Out', en: 'Reaching Out Tea House' }, lat: 15.8771, lng: 108.3290, category: 'cafe', reason: { vi: 'Quán cà phê im lặng dành cho người khiếm thính, rất độc đáo', en: 'Silent café run by hearing-impaired staff, truly unique' } }
  ],
  Activity: [
    { id: 'eco-act-01', name: { vi: 'Đạp Xe Làng Cổ', en: 'Ancient Village Cycling' }, lat: 15.8870, lng: 108.3350, category: 'activity', reason: { vi: 'Khám phá làng cổ bằng xe đạp, thân thiện môi trường', en: 'Explore ancient village by bicycle, eco-friendly' } }
  ],
  Food: [
    { id: 'eco-food-01', name: { vi: 'Nhà Hàng Morning Glory', en: 'Morning Glory Restaurant' }, lat: 15.8780, lng: 108.3280, category: 'food', reason: { vi: 'Ẩm thực Hội An truyền thống, sử dụng rau hữu cơ địa phương', en: 'Traditional Hoi An cuisine with local organic vegetables' } },
    { id: 'eco-food-02', name: { vi: 'Quán Cơm Gà Bà Buội', en: 'Ba Buoi Chicken Rice' }, lat: 15.8795, lng: 108.3268, category: 'food', reason: { vi: 'Cơm gà nổi tiếng nhất Hội An, phải thử một lần', en: 'Most famous chicken rice in Hoi An, a must-try' } }
  ]
};

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

const formatPriceRange = (min, max, freeLabel = 'Free') => {
  const hasAnyPrice = min > 0 || max > 0;
  if (!hasAnyPrice) return freeLabel;
  if (min === max) return `${min.toLocaleString()}đ`;
  return `${min.toLocaleString()}đ - ${max.toLocaleString()}đ`;
};

const LeafletMap = ({
  spots,
  selectedSpot,
  showTravelRoute,
  language,
  isNavigating,
  isMobile,
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
  const tileThemeRef = React.useRef('');
  const isProgrammaticMoveRef = React.useRef(false);
  const isNavigatingRef = React.useRef(isNavigating);
  const lastRouteParamsRef = React.useRef({ spotsKey: '', showTravelRoute: false });
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [autoFollow, setAutoFollow] = React.useState(true);

  React.useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  React.useEffect(() => {
    // Start each navigation session in follow mode.
    if (isNavigating) {
      setAutoFollow(true);
    }
  }, [isNavigating]);

  const getFollowTarget = React.useCallback((location, heading, useForwardOffset = false) => {
    if (!location) return null;

    // When following on mobile, keep the user slightly ahead in the viewport
    // instead of rotating the whole map. This mimics Google Maps' feel while
    // avoiding mobile tile rendering glitches.
    if (useForwardOffset && heading !== null && heading !== undefined) {
      const offsetDist = 0.00045;
      const headRad = (heading * Math.PI) / 180;
      return {
        lat: location.lat + Math.cos(headRad) * offsetDist,
        lng: location.lng + Math.sin(headRad) * offsetDist
      };
    }

    return location;
  }, []);

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
        setAutoFollow(true);
        isProgrammaticMoveRef.current = true;
        const target = getFollowTarget(userLocation, userHeading, isMobile && isNavigating);
        mapRef.current.setView([target.lat, target.lng], isMobile ? 18.5 : 17.5);
        window.setTimeout(() => {
          isProgrammaticMoveRef.current = false;
        }, 700);
      }
    };
    window.addEventListener('recenter-map', handleRecenter);
    return () => window.removeEventListener('recenter-map', handleRecenter);
  }, [userLocation, userHeading, isMobile, isNavigating, getFollowTarget]);

  // Course-up stable mode: keep map canvas flat while navigating to avoid white-screen rendering glitches.
  // Direction feeling is preserved via moving chevron + forward follow target.
  const headingUpActive = !isNavigating && mapRotationActive && userHeading !== null;
  const mapRotationStyle = headingUpActive
    ? { '--map-rotation': `${-userHeading}deg` }
    : { '--map-rotation': '0deg' };

  React.useEffect(() => {
    if (!mapLoaded || !window.L || spots.length === 0) return;

    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerId, {
        zoomControl: true,
        scrollWheelZoom: true
      });

      // If user manually drags/zooms while navigating, pause auto-follow
      // so they can inspect the map without being snapped back immediately.
      mapRef.current.on('movestart', () => {
        if (isProgrammaticMoveRef.current) return;
        if (isNavigatingRef.current) {
          setAutoFollow(false);
        }
      });
    }

    const map = mapRef.current;
    const setViewSafely = (action) => {
      isProgrammaticMoveRef.current = true;
      action();
      map.once('moveend', () => {
        isProgrammaticMoveRef.current = false;
      });
      window.setTimeout(() => {
        isProgrammaticMoveRef.current = false;
      }, 900);
    };

    // Keep tile layer stable during GPS updates; only recreate when theme changes.
    const desiredTheme = isDarkMode ? 'dark' : 'light';
    if (!tileLayerRef.current || tileThemeRef.current !== desiredTheme) {
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
        tileLayerRef.current = null;
      }

      const tileProviders = isDarkMode
        ? [
          {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; CartoDB',
            maxNativeZoom: 20
          },
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; OpenStreetMap contributors',
            maxNativeZoom: 19
          }
        ]
        : [
          {
            // Satellite first (Esri World Imagery)
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri',
            maxNativeZoom: 19
          },
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; OpenStreetMap contributors',
            maxNativeZoom: 19
          },
          {
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; CartoDB',
            maxNativeZoom: 20
          }
        ];

      let providerIndex = 0;
      let tileErrorCount = 0;
      let tileLoadCount = 0;
      let fallbackTimer = null;

      const mountTileLayer = (index) => {
        const provider = tileProviders[index];
        if (!provider) return;

        if (tileLayerRef.current) {
          tileLayerRef.current.remove();
        }

        const layer = window.L.tileLayer(provider.url, {
          attribution: provider.attribution,
          maxNativeZoom: provider.maxNativeZoom || 19,
          maxZoom: 22,
          keepBuffer: 4
        });

        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
        }
        tileLoadCount = 0;

        layer.on('tileerror', () => {
          tileErrorCount += 1;
          if (tileErrorCount >= 8 && providerIndex < tileProviders.length - 1) {
            providerIndex += 1;
            tileErrorCount = 0;
            mountTileLayer(providerIndex);
          }
        });

        layer.on('tileload', () => {
          tileLoadCount += 1;
        });

        fallbackTimer = setTimeout(() => {
          if (tileLoadCount === 0 && providerIndex < tileProviders.length - 1) {
            providerIndex += 1;
            tileErrorCount = 0;
            mountTileLayer(providerIndex);
          }
        }, 3500);

        tileLayerRef.current = layer;
        layer.addTo(map);
      };

      mountTileLayer(providerIndex);
      tileThemeRef.current = desiredTheme;
    }

    // Ensure Leaflet recalculates tiles after layout/overlay transitions.
    map.invalidateSize();

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
        const arrowRotationStyle = (userHeading !== null && userHeading !== undefined)
          ? `transform: rotate(${userHeading}deg);`
          : 'transform: rotate(0deg);';

        const userPulseHtml = `
          <div class="relative flex flex-col items-center justify-center" style="margin-top: -15px;">
            <div class="relative flex items-center justify-center h-10 w-10 select-none">
              
              <!-- 1. Pulsing wave ring background -->
              <div class="absolute h-10 w-10 rounded-full bg-blue-500/25 animate-ping"></div>

              <!-- 2. Central glowing blue location dot with white chevron arrow pointing to heading direction -->
              <div class="absolute h-7.5 w-7.5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 border-2 border-white shadow-xl flex items-center justify-center relative z-10 transition-transform duration-300" style="${arrowRotationStyle}">
                <!-- Glowing inner pulse -->
                <div class="absolute inset-0.5 rounded-full bg-blue-500/10 animate-pulse"></div>
                
                <!-- White chevron arrow pointing to heading direction -->
                <svg class="w-4.5 h-4.5 text-white filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
              </div>
            </div>
            
            <!-- Google Maps style bottom street tag: White background with blue text -->
            <div class="mt-1.5 px-3 py-1 bg-white border-2 border-blue-500/35 shadow-lg rounded-full text-[10.5px] font-black text-blue-600 leading-none whitespace-nowrap text-center tracking-wide relative z-20">
              ${activeStreetName || (language === 'vi' ? 'Đang xác định...' : 'Determining...')}
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

      // Draw actual street routing path using primary route from parent state
      if ((isNavigating || (selectedSpot && !showTravelRoute)) && userLocation && selectedSpot) {
        if (alternativeRoutes && alternativeRoutes.length > 0) {
          // Render ONLY the primary optimal route, completely removing all alternative routes
          const primaryRoute = alternativeRoutes[0];
          if (primaryRoute && primaryRoute.geometry && primaryRoute.geometry.coordinates) {
            const routeCoords = primaryRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);

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
          }
        } else {
          drawFallbackNavLine();
        }
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
        const navZoom = isMobile ? 18.5 : 17.5;
        if (autoFollow) {
          if (isMobile && userHeading !== null) {
            // 0.00045 deg ≈ 50m offset forward in heading direction
            const offsetDist = 0.00045;
            const headRad = (userHeading * Math.PI) / 180;
            const offsetLat = userLocation.lat + Math.cos(headRad) * offsetDist;
            const offsetLng = userLocation.lng + Math.sin(headRad) * offsetDist;
            setViewSafely(() => map.setView([offsetLat, offsetLng], navZoom, { animate: true, duration: 0.5 }));
          } else {
            setViewSafely(() => map.setView([userLocation.lat, userLocation.lng], navZoom, { animate: true, duration: 0.5 }));
          }
        }
      } else if (showTravelRoute && spots.length > 1) {
        const bounds = window.L.latLngBounds(spots.map(s => [s.lat, s.lng]));
        setViewSafely(() => map.fitBounds(bounds, { padding: [40, 40] }));
      } else {
        const activeLat = selectedSpot ? selectedSpot.lat : spots[0].lat;
        const activeLng = selectedSpot ? selectedSpot.lng : spots[0].lng;
        setViewSafely(() => map.setView([activeLat, activeLng], 15));
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
          const navZoom = isMobile ? 18.5 : 17.5;
          if (autoFollow) {
            const target = getFollowTarget(userLocation, userHeading, isMobile);
            setViewSafely(() => map.setView([target.lat, target.lng], navZoom, { animate: true, duration: 0.4 }));
          }
        } else if (!showTravelRoute) {
          setViewSafely(() => map.setView([selectedSpot.lat, selectedSpot.lng], 16));
        } else {
          setViewSafely(() => map.panTo([selectedSpot.lat, selectedSpot.lng]));
        }
      }
    }

  }, [mapLoaded, spots, selectedSpot, showTravelRoute, language, isNavigating, isMobile, userLocation, transportMode, userHeading, activeStreetName, isDarkMode, alternativeRoutes, selectedRouteIndex, mapRotationActive, autoFollow, getFollowTarget]);

  // Keep flat rendering in all modes; 3D perspective causes rendering issues on some mobile browsers.
  const use3DPerspective = false;

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
        .leaflet-tilted-wrapper {
          perspective: 800px;
          perspective-origin: 50% 60%;
          overflow: hidden;
          width: 100%;
          height: 100%;
          position: relative;
          -webkit-transform-style: preserve-3d;
          transform-style: preserve-3d;
        }
        .leaflet-tilted-content {
          transform: rotateX(40deg) scale(1.55) translateY(-6%);
          transform-origin: 50% 60%;
          transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
          width: 100%;
          height: 100%;
          -webkit-transform-style: preserve-3d; /* ensure 3D children (tile images) render correctly */
          transform-style: preserve-3d;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .leaflet-map-rotated {
          transform: rotate(var(--map-rotation, 0deg));
          transform-origin: center center;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          -webkit-transform-style: preserve-3d;
          transform-style: preserve-3d;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        /* Force tile images onto their own GPU layer to avoid disappearing when parents are 3D-transformed */
        .leaflet-container .leaflet-tile-pane img {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          will-change: transform, opacity;
        }
        .leaflet-top.leaflet-left {
          top: 80px !important;
          left: 10px !important;
          transition: all 0.3s ease;
        }
        .leaflet-tilted-content .leaflet-top.leaflet-left {
          top: 180px !important;
        }
        /* Heading-up mode: counter-rotate markers and controls so they stay upright */
        .leaflet-map-rotated .custom-dot-marker,
        .leaflet-map-rotated .user-live-marker {
          transform: rotate(calc(-1 * var(--map-rotation, 0deg))) !important;
          transition: transform 0.4s ease !important;
        }
        /* Counter-rotate tooltips */
        .leaflet-map-rotated .leaflet-tooltip {
          transform: rotate(calc(-1 * var(--map-rotation, 0deg))) !important;
        }
        /* Hide zoom controls on mobile navigation for clean heading-up view */
        .leaflet-tilted-content .leaflet-control-zoom {
          display: none !important;
        }
        .leaflet-tilted-content .leaflet-control-attribution {
          display: none !important;
        }
        /* Smooth map rotation */
        .leaflet-map-rotated {
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        @media (max-width: 767px) {
          .leaflet-map-rotated,
          .leaflet-map-rotated .custom-dot-marker,
          .leaflet-map-rotated .user-live-marker,
          .leaflet-map-rotated .leaflet-tooltip {
            transform: none !important;
          }
        }

      `}</style>

      {/* Tier 1: Outer perspective wrapper — only on mobile during navigation */}
      <div className={use3DPerspective ? "leaflet-tilted-wrapper" : "w-full h-full relative"}>
        {/* Tier 2: Middle 3D tilt container — only on mobile during navigation */}
        <div className={`w-full h-full relative ${use3DPerspective ? 'leaflet-tilted-content' : ''}`}>
          {/* Tier 3: Map element with rotation and Leaflet mounting */}
          <div
            id={mapContainerId}
            style={mapRotationStyle}
            className={`w-full h-full relative z-10 ${headingUpActive ? 'leaflet-map-rotated' : ''}`}
          />
        </div>
      </div>
    </>
  );
};

export default function TripPlannerStudio({ prefill, initialTab }) {
  const { language, t } = useLanguage();
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState(5000000); // 5 Million default
  const [style, setStyle] = useState('Chill & Thư giãn');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [interests, setInterests] = useState('Ăn cao lầu, uống cà phê sữa đá, đi dạo phố cổ Hội An');

  const [loading, setLoading] = useState(false);
  const [loadingFactIndex, setLoadingFactIndex] = useState(0);
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [slotPage, setSlotPage] = useState(1);
  const [sidebarPage, setSidebarPage] = useState(1);
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
  // Detect mobile screen (< 768px) for 3rd-person perspective mode
  const [isMobileDevice, setIsMobileDevice] = useState(() => window.innerWidth < 768);
  const [mobileViewMode, setMobileViewMode] = useState('list'); // 'list' | 'map'
  const watchIdRef = React.useRef(null);
  const prevGpsPosRef = React.useRef(null); // Previous GPS position for heading calc
  const prevGpsTimeRef = React.useRef(null); // Previous GPS timestamp for speed calc
  const lastRouteFetchPosRef = React.useRef(null); // Last route-fetched GPS position
  const lastRouteFetchTimeRef = React.useRef(0); // Last route-fetched GPS timestamp

  // Resize listener to keep isMobileDevice in sync
  useEffect(() => {
    const handleResize = () => setIsMobileDevice(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectSpotAndScroll = (spot) => {
    setSelectedSpot(spot);
    setSidebarPage(1);
    if (window.innerWidth < 768) {
      setMobileViewMode('map');
    }
    setTimeout(() => {
      const el = document.getElementById('trip-planner-map-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Advanced Navigation States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [mapRotationActive, setMapRotationActive] = useState(false);
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
  const [simActiveStreet, setSimActiveStreet] = useState('');
  const [simDistance, setSimDistance] = useState(14);
  const [simDuration, setSimDuration] = useState(19);

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [activePlannerTab, setActivePlannerTab] = useState(initialTab || 'studio');
  const [allDbSpots, setAllDbSpots] = useState([]);
  const [rentalPage, setRentalPage] = useState(1);
  const [isSavedItinerary, setIsSavedItinerary] = useState(false);
  const [swapDropdown, setSwapDropdown] = useState(null);
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [activeItineraryStatus, setActiveItineraryStatus] = useState('NOT_STARTED');
  const [savedFilter, setSavedFilter] = useState('ALL');

  useEffect(() => {
    if (initialTab) {
      setActivePlannerTab(initialTab);
    }
  }, [initialTab]);

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
        setIsSavedItinerary(true);
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

  const handleLoadSaved = async (savedTrip) => {
    try {
      const parsedData = JSON.parse(savedTrip.tripData);
      setItinerary(parsedData);
      setDays(savedTrip.totalDays);
      setBudget(savedTrip.totalBudget);
      setStyle(savedTrip.travelStyle);
      setActiveDay(1);
      setSlotPage(1);
      if (parsedData.length > 0) {
        setSelectedSpot(parsedData[0].accommodation);
      }
      setIsSavedItinerary(true);
      setActiveItineraryId(savedTrip.id);

      let currentStatus = savedTrip.status || 'NOT_STARTED';
      if (currentStatus === 'NOT_STARTED') {
        try {
          const res = await tripService.updateItineraryStatus(savedTrip.id, 'IN_PROGRESS');
          if (res && res.success) {
            currentStatus = 'IN_PROGRESS';
            fetchSavedItineraries(); // Refresh list in background
          }
        } catch (e) {
          console.error("Failed to update status to IN_PROGRESS on load:", e);
        }
      }
      setActiveItineraryStatus(currentStatus);
      setActivePlannerTab('viewer');
    } catch (err) {
      console.error("Failed to load saved itinerary:", err);
      alert("Lỗi dữ liệu lịch trình không hợp lệ!");
    }
  };

  const handleCompleteItinerary = async () => {
    if (!activeItineraryId) return;
    try {
      const res = await tripService.updateItineraryStatus(activeItineraryId, 'COMPLETED');
      if (res && res.success) {
        setActiveItineraryStatus('COMPLETED');
        alert(language === 'vi' ? "🎉 Chúc mừng bạn đã hoàn thành lộ trình xuất sắc!" : "🎉 Congratulations on completing your journey successfully!");
        fetchSavedItineraries();
      }
    } catch (e) {
      console.error("Failed to complete itinerary:", e);
      alert(language === 'vi' ? "Cập nhật thất bại!" : "Update failed!");
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
    // Voice instructions removed entirely by user request
    return;
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
    if (!currentUser) {
      alert(language === 'vi' ? "Vui lòng đăng nhập để sử dụng tính năng xem chỉ đường!" : "Please login to use the directions feature!");
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    if (!selectedSpot) {
      alert(language === 'vi' ? "Vui lòng chọn một địa điểm để bắt đầu dẫn đường!" : "Please select a destination to start navigation!");
      return;
    }

    if (!navigator.geolocation) {
      alert(language === 'vi' ? "Trình duyệt không hỗ trợ GPS!" : "Your browser does not support GPS geolocation!");
      return;
    }

    setIsNavigating(true);
    setIsMapMaximized(true);
    setActiveModalView('map');
    setTurnAlert('');
    prevGpsPosRef.current = null;
    prevGpsTimeRef.current = null;
    lastRouteFetchPosRef.current = null;
    lastRouteFetchTimeRef.current = 0;

    // Course-up mode uses camera follow + arrow direction, not full map rotation.
    setMapRotationActive(false);

    const osrmProfile = 'driving';

    // Step 1: Get accurate initial GPS position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsLat = position.coords.latitude;
        const gpsLng = position.coords.longitude;
        setUserLocation({ lat: gpsLat, lng: gpsLng });

        // Step 2: Fetch OSRM route from real GPS to destination (for polyline + maneuvers)
        const routingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${gpsLng},${gpsLat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

        fetch(routingUrl)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              setAlternativeRoutes(data.routes);
              setSelectedRouteIndex(0);

              const primaryRoute = data.routes[0];
              const coords = primaryRoute.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
              setSimCoords(coords); // For polyline drawing only
              setSimIndex(0);

              // Calculate initial heading from first point to second point of the OSRM route for instant 3rd person perspective alignment
              if (coords.length > 1) {
                const initialHeading = calculateHeading(coords[0].lat, coords[0].lng, coords[1].lat, coords[1].lng);
                setUserHeading(initialHeading);
              }

              const steps = primaryRoute.legs?.[0]?.steps || [];
              setActiveManeuvers(steps);
              setActiveStepIndex(0);

              const totalDist = parseFloat((primaryRoute.distance / 1000).toFixed(1));
              let totalDur = Math.max(1, Math.round(primaryRoute.duration / 60));
              if (transportMode === 'motorbike') {
                totalDur = Math.max(1, Math.round((primaryRoute.duration * 0.8) / 60));
              } else if (transportMode === 'car') {
                totalDur = Math.max(1, Math.round((primaryRoute.duration * 1.25) / 60));
              } else if (transportMode === 'bike') {
                totalDur = Math.max(1, Math.round((totalDist / 12) * 60));
              } else if (transportMode === 'foot') {
                totalDur = Math.max(1, Math.round((totalDist / 4) * 60));
              }
              setSimDistance(totalDist);
              setSimDuration(totalDur);

              if (steps.length > 0 && steps[0].name) {
                setSimActiveStreet(steps[0].name);
              }

              const targetName = selectedSpot.name[language]?.split(',')[0] || '';
              speakInstruction(language === 'vi' ? `Bắt đầu dẫn đường GPS tới ${targetName}.` : `Starting GPS navigation to ${targetName}.`);
            } else {
              setSimCoords([]);
              setActiveManeuvers([]);
              setSimDistance(getDistanceKm(gpsLat, gpsLng, selectedSpot.lat, selectedSpot.lng));
              speakInstruction(language === 'vi' ? `Dẫn đường GPS trực tiếp tới ${selectedSpot.name.vi}.` : `Direct GPS navigation to ${selectedSpot.name.en}.`);
            }
          })
          .catch(err => {
            console.warn("OSRM routing failed:", err);
            setSimCoords([]);
            setActiveManeuvers([]);
            setSimDistance(getDistanceKm(gpsLat, gpsLng, selectedSpot.lat, selectedSpot.lng));
          });

        // Step 3: Start real-time GPS tracking (like Google Maps)
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const newLat = pos.coords.latitude;
            const newLng = pos.coords.longitude;
            const newPos = { lat: newLat, lng: newLng };
            const now = Date.now();

            setUserLocation(newPos);

            // Real speed from GPS (m/s → km/h) with drift filter
            if (pos.coords.speed !== null && pos.coords.speed !== undefined && pos.coords.speed >= 0) {
              setUserSpeed(Math.round(pos.coords.speed * 3.6));
            } else if (prevGpsPosRef.current && prevGpsTimeRef.current) {
              const dt = (now - prevGpsTimeRef.current) / 1000;
              if (dt > 0.5) {
                const dKm = getDistanceKm(prevGpsPosRef.current.lat, prevGpsPosRef.current.lng, newLat, newLng);
                // Filter out small jitter movements (< 3 meters) to keep speed at 0 when stationary
                if (dKm > 0.003) {
                  setUserSpeed(Math.min(Math.round((dKm / dt) * 3600), 200));
                } else {
                  setUserSpeed(0);
                }
              }
            } else {
              setUserSpeed(0);
            }

            // 2. Real road distance and duration calculation via OSRM with Throttled live-rerouting (every 15m or 8 seconds)
            const metersMoved = lastRouteFetchPosRef.current
              ? getDistanceKm(lastRouteFetchPosRef.current.lat, lastRouteFetchPosRef.current.lng, newLat, newLng) * 1000
              : 999;
            const timeElapsedMs = now - lastRouteFetchTimeRef.current;

            if (metersMoved > 15 || timeElapsedMs > 8000) {
              lastRouteFetchPosRef.current = newPos;
              lastRouteFetchTimeRef.current = now;

              const osrmProfile = 'driving';

              const liveRoutingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${newLng},${newLat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

              fetch(liveRoutingUrl)
                .then(res => res.json())
                .then(data => {
                  if (data.routes && data.routes.length > 0) {
                    setAlternativeRoutes(data.routes);
                    const primaryRoute = data.routes[selectedRouteIndex] || data.routes[0];
                    const coords = primaryRoute.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
                    setSimCoords(coords);

                    // Update real-time road distance and duration based on transport mode
                    const liveDist = parseFloat((primaryRoute.distance / 1000).toFixed(1));
                    let liveDur = Math.max(1, Math.round(primaryRoute.duration / 60));

                    if (transportMode === 'motorbike') {
                      liveDur = Math.max(1, Math.round((primaryRoute.duration * 0.8) / 60));
                    } else if (transportMode === 'car') {
                      liveDur = Math.max(1, Math.round((primaryRoute.duration * 1.25) / 60));
                    } else if (transportMode === 'bike') {
                      liveDur = Math.max(1, Math.round((liveDist / 12) * 60));
                    } else if (transportMode === 'foot') {
                      liveDur = Math.max(1, Math.round((liveDist / 4) * 60));
                    }

                    setSimDistance(liveDist);
                    setSimDuration(liveDur);

                    const steps = primaryRoute.legs?.[0]?.steps || [];
                    setActiveManeuvers(steps);

                    // Find closest upcoming step index
                    let nextStepIdx = 0;
                    let minStepDist = 999999;
                    steps.forEach((step, idx) => {
                      if (step.location && step.location.length >= 2) {
                        const distToStep = getDistanceKm(newLat, newLng, step.location[1], step.location[0]) * 1000;
                        if (distToStep < minStepDist) {
                          minStepDist = distToStep;
                          nextStepIdx = idx;
                        }
                      }
                    });

                    if (minStepDist < 40 && nextStepIdx < steps.length - 1) {
                      nextStepIdx += 1;
                    }
                    setActiveStepIndex(nextStepIdx);

                    if (steps[nextStepIdx] && steps[nextStepIdx].name) {
                      setSimActiveStreet(steps[nextStepIdx].name);
                    }

                    // Dynamic Chevron Arrow angle pointing precisely towards the next OSRM waypoint coordinate
                    const nextStep = steps[nextStepIdx];
                    if (nextStep && nextStep.location && nextStep.location.length >= 2) {
                      const targetHeading = calculateHeading(newLat, newLng, nextStep.location[1], nextStep.location[0]);
                      setUserHeading(targetHeading);
                    }
                  }
                })
                .catch(err => console.warn("Live OSRM rerouting failed:", err));
            } else {
              // Static fallbacks for chevron arrow heading if we haven't moved far enough to reroute
              const nextStep = activeManeuvers?.[activeStepIndex];
              if (nextStep && nextStep.location && nextStep.location.length >= 2) {
                const targetHeading = calculateHeading(newLat, newLng, nextStep.location[1], nextStep.location[0]);
                setUserHeading(targetHeading);
              }
            }

            // 3. WS sync counter
            if (wsConnected) {
              setWsSyncedCount(prev => prev + 1);
            }

            // 4. Arrival check (within 30m)
            const finalDirectDist = getDistanceKm(newLat, newLng, selectedSpot.lat, selectedSpot.lng);
            if (finalDirectDist < 0.03) {
              handleStopNavigation();
              setTimeout(() => {
                alert(language === 'vi' ? "🎉 Bạn đã đến địa điểm an toàn!" : "🎉 You have arrived at your destination!");
              }, 100);
            }

            prevGpsPosRef.current = newPos;
            prevGpsTimeRef.current = now;
          },
          (err) => console.warn("GPS watch error:", err),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
      },
      (err) => {
        console.warn("GPS initial position error:", err);
        alert(language === 'vi' ? "Không thể lấy vị trí GPS. Vui lòng bật định vị!" : "Unable to get GPS. Please enable location!");
        setIsNavigating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
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
    setMapRotationActive(false); // Automatically disable map rotation when stopping navigation
    setIsMapMaximized(false); // Leave the enlarged map overlay when exiting navigation
    // Clear the currently selected spot when stopping navigation so the map
    // doesn't fallback to drawing a straight-line route between the user
    // and the previously selected destination.
    setSelectedSpot(null);
    setActiveModalView('map');
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

  // Real-time GPS navigation: track turn maneuvers and street names based on actual position
  useEffect(() => {
    if (!isNavigating || !userLocation || activeManeuvers.length === 0) return;

    // Find closest upcoming maneuver step based on real GPS position
    if (activeStepIndex < activeManeuvers.length) {
      const step = activeManeuvers[activeStepIndex];
      if (step && step.location && Array.isArray(step.location) && step.location.length >= 2) {
        const distToTurn = getDistanceKm(userLocation.lat, userLocation.lng, step.location[1], step.location[0]) * 1000;

        // Update current street name from the active step
        if (step.name) {
          setSimActiveStreet(step.name);
        }

        // Trigger turn alert when within 80 meters of next maneuver
        if (distToTurn < 80) {
          const modifier = step.maneuver?.modifier || '';
          let turnLabel = '';

          if (language === 'vi') {
            const dir = modifier.includes('left') ? 'rẽ trái' : modifier.includes('right') ? 'rẽ phải' : modifier.includes('uturn') ? 'quay đầu' : 'đi thẳng';
            turnLabel = `Chuẩn bị ${dir} vào ${step.name || 'đường mới'} trong ${Math.round(distToTurn)} mét!`;
          } else {
            const dir = modifier.includes('left') ? 'turn left' : modifier.includes('right') ? 'turn right' : modifier.includes('uturn') ? 'make a U-turn' : 'go straight';
            turnLabel = `Prepare to ${dir} onto ${step.name || 'new road'} in ${Math.round(distToTurn)} meters!`;
          }

          setTurnAlert(turnLabel);
          speakInstruction(turnLabel);
          setActiveStepIndex(prev => prev + 1);
          setTimeout(() => setTurnAlert(''), 4500);
        }
      }
    }

    // Speed limit warning
    const limit = transportMode === 'foot' ? 10 : transportMode === 'bike' ? 25 : transportMode === 'car' ? 60 : 50;
    if (userSpeed > limit && Date.now() - lastSpeedAlertRef.current > 8000) {
      speakInstruction(language === 'vi' ? "Cảnh báo! Bạn đang vượt quá tốc độ giới hạn!" : "Warning! Exceeding speed limit!");
      lastSpeedAlertRef.current = Date.now();
    }

  }, [isNavigating, userLocation, activeManeuvers, activeStepIndex, transportMode, language, userSpeed]);

  // Handle transport mode changes during active navigation
  useEffect(() => {
    if (!isNavigating || !selectedSpot || !userLocation) return;

    const osrmProfile = 'driving';

    const routingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${userLocation.lng},${userLocation.lat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

    fetch(routingUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          setAlternativeRoutes(data.routes);
          setSelectedRouteIndex(0);

          const primaryRoute = data.routes[0];
          const coords = primaryRoute.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
          setSimCoords(coords);

          const liveDist = parseFloat((primaryRoute.distance / 1000).toFixed(1));
          let totalDur = Math.max(1, Math.round(primaryRoute.duration / 60));
          if (transportMode === 'motorbike') {
            totalDur = Math.max(1, Math.round((primaryRoute.duration * 0.8) / 60));
          } else if (transportMode === 'car') {
            totalDur = Math.max(1, Math.round((primaryRoute.duration * 1.25) / 60));
          } else if (transportMode === 'bike') {
            totalDur = Math.max(1, Math.round((liveDist / 12) * 60));
          } else if (transportMode === 'foot') {
            totalDur = Math.max(1, Math.round((liveDist / 4) * 60));
          }

          setSimDistance(liveDist);
          setSimDuration(totalDur);

          const steps = primaryRoute.legs?.[0]?.steps || [];
          setActiveManeuvers(steps);
          setActiveStepIndex(0);

          if (steps.length > 0 && steps[0].name) {
            setSimActiveStreet(steps[0].name);
          }
        }
      })
      .catch(err => console.warn("Failed to update route on transport mode change:", err));
  }, [transportMode, isNavigating, selectedSpot]);

  // Handle alternative route selection changes
  useEffect(() => {
    if (alternativeRoutes && alternativeRoutes[selectedRouteIndex]) {
      const activeRoute = alternativeRoutes[selectedRouteIndex];
      const liveDist = parseFloat((activeRoute.distance / 1000).toFixed(1));
      let liveDur = Math.max(1, Math.round(activeRoute.duration / 60));
      if (transportMode === 'motorbike') {
        liveDur = Math.max(1, Math.round((activeRoute.duration * 0.8) / 60));
      } else if (transportMode === 'car') {
        liveDur = Math.max(1, Math.round((activeRoute.duration * 1.25) / 60));
      } else if (transportMode === 'bike') {
        liveDur = Math.max(1, Math.round((liveDist / 12) * 60));
      } else if (transportMode === 'foot') {
        liveDur = Math.max(1, Math.round((liveDist / 4) * 60));
      }
      setSimDistance(liveDist);
      setSimDuration(liveDur);

      const coords = activeRoute.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
      setSimCoords(coords);

      const steps = activeRoute.legs?.[0]?.steps || [];
      setActiveManeuvers(steps);
      setActiveStepIndex(0);
      if (steps.length > 0 && steps[0].name) {
        setSimActiveStreet(steps[0].name);
      }
    }
  }, [selectedRouteIndex, alternativeRoutes, transportMode]);

  // Background fetch of OSRM route when a spot is selected (even when not navigating)
  // to ensure distance/duration are always actual road metrics and never jump or differ!
  useEffect(() => {
    if (!selectedSpot) return;

    const originLat = userLocation.lat;
    const originLng = userLocation.lng;

    const osrmProfile = 'driving';

    const routingUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${originLng},${originLat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

    fetch(routingUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          setAlternativeRoutes(data.routes);
          setSelectedRouteIndex(0);

          const primaryRoute = data.routes[0];
          const coords = primaryRoute.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
          setSimCoords(coords);

          const liveDist = parseFloat((primaryRoute.distance / 1000).toFixed(1));
          let totalDur = Math.max(1, Math.round(primaryRoute.duration / 60));
          if (transportMode === 'motorbike') {
            totalDur = Math.max(1, Math.round((primaryRoute.duration * 0.8) / 60));
          } else if (transportMode === 'car') {
            totalDur = Math.max(1, Math.round((primaryRoute.duration * 1.25) / 60));
          } else if (transportMode === 'bike') {
            totalDur = Math.max(1, Math.round((liveDist / 12) * 60));
          } else if (transportMode === 'foot') {
            totalDur = Math.max(1, Math.round((liveDist / 4) * 60));
          }

          setSimDistance(liveDist);
          setSimDuration(totalDur);

          const steps = primaryRoute.legs?.[0]?.steps || [];
          setActiveManeuvers(steps);
          setActiveStepIndex(0);

          if (steps.length > 0 && steps[0].name) {
            setSimActiveStreet(steps[0].name);
          }
        }
      })
      .catch(err => {
        console.warn("Background OSRM route fetch failed:", err);
        setAlternativeRoutes([]);
      });
  }, [selectedSpot, userLocation, isFarAway, transportMode, itinerary, activeDay]);

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
      if (prefill.directionSpot) {
        setSelectedSpot(prefill.directionSpot);
        setActivePlannerTab('viewer');
      }
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
    // Extract first image from images array or use fallback
    let imageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80";
    if (backendSpot.images && Array.isArray(backendSpot.images) && backendSpot.images.length > 0) {
      imageUrl = backendSpot.images[0].imageUrl || imageUrl;
    } else if (backendSpot.imageUrl) {
      imageUrl = backendSpot.imageUrl;
    }

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
      img: imageUrl,
      images: backendSpot.images || [], // Keep original images array for potential future use
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
    if (!currentUser) {
      alert(language === 'vi' ? "Vui lòng đăng nhập để sinh lịch trình!" : "Please login to generate your itinerary!");
      window.dispatchEvent(new Event('auth-required'));
      return;
    }
    setLoading(true);
    setHasOptimized(false);
    setIsSavedItinerary(false);

    try {
      const response = await tripService.generateTrip({
        days: days,
        budget: budget,
        style: style,
        people: adults + children,
        groupType: 'couple',
        interests: [interests],
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
        setSlotPage(1);
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

    if (slotKey.toUpperCase() === 'STAY') {
      targetSpot = nextItinerary[dayIndex].accommodation;
    } else {
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
    }

    if (!targetSpot) return;

    let categoryToFind = 'cafe';
    const upperSlot = slotName.toUpperCase();
    if (upperSlot === 'STAY') {
      categoryToFind = 'stay';
    } else if (upperSlot.includes('LUNCH') || upperSlot.includes('FOOD') || upperSlot.includes('EVENING') || upperSlot.includes('DINNER')) {
      categoryToFind = 'food';
    } else if (upperSlot.includes('MORNING') || upperSlot.includes('AFTERNOON') || upperSlot.includes('SIGHTSEEING')) {
      categoryToFind = 'sightseeing';
    }

    let candidates = [];
    if (allDbSpots && allDbSpots.length > 0) {
      candidates = allDbSpots.filter(s =>
        (s.category?.toLowerCase() === categoryToFind ||
          (categoryToFind === 'stay' && (s.category?.toLowerCase() === 'stay' || s.category?.toLowerCase() === 'hotel' || s.category?.toLowerCase() === 'homestay'))) &&
        s.name[language] !== targetSpot.name[language]
      );

      if (candidates.length === 0) {
        if (categoryToFind === 'stay') {
          candidates = allDbSpots.filter(s =>
            (s.category?.toLowerCase() === 'stay' || s.category?.toLowerCase() === 'hotel' || s.category?.toLowerCase() === 'homestay')
          );
        } else {
          candidates = allDbSpots.filter(s =>
            s.category?.toLowerCase() !== 'stay' &&
            s.category?.toLowerCase() !== 'hotel' &&
            s.category?.toLowerCase() !== 'homestay' &&
            s.name[language] !== targetSpot.name[language]
          );
        }
      }
    }

    setSwapDropdown({
      dayIndex,
      slotKey,
      isDynamic,
      currentSpot: targetSpot,
      candidates: candidates.slice(0, 10)
    });
  };

  const executeSwapSpot = (newSpot) => {
    if (!swapDropdown || !itinerary) return;
    const { dayIndex, slotKey, isDynamic, currentSpot } = swapDropdown;

    const nextItinerary = [...itinerary];
    const swaped = { ...newSpot };

    if (slotKey.toUpperCase() === 'STAY') {
      nextItinerary[dayIndex].accommodation = swaped;
      if (nextItinerary[dayIndex].slots) {
        nextItinerary[dayIndex].slots = nextItinerary[dayIndex].slots.map(s => {
          if (s.slot === 'STAY') {
            return { ...s, spot: swaped };
          }
          return s;
        });
      }
    } else {
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
    }

    setItinerary(nextItinerary);

    if (selectedSpot && selectedSpot.lat === currentSpot.lat && selectedSpot.lng === currentSpot.lng) {
      setSelectedSpot(swaped);
    }

    setSwapDropdown(null);
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

  const activeDaySpots = itinerary ? getActiveDaySpots() : (selectedSpot ? [selectedSpot] : []);

  const handleOptimizeBudget = () => {
    setOptimizing(true);
    setTimeout(() => {
      if (!itinerary) return;

      const ecoHomestay = SPOTS_DATABASE.Homestay.Healing;
      const ecoMorning = SPOTS_DATABASE.Cafe[0];
      const ecoAfternoon = SPOTS_DATABASE.Activity[0];
      const ecoEvening = SPOTS_DATABASE.Food[1];

      const optimizedItinerary = itinerary.map((d) => ({
        ...d,
        accommodation: { ...ecoHomestay },
        morning: { ...ecoMorning },
        afternoon: { ...ecoAfternoon },
        evening: { ...ecoEvening }
      }));

      setItinerary(optimizedItinerary);
      setOptimizing(false);
      setHasOptimized(true);
      setSelectedSpot(ecoHomestay);
    }, 2500);
  };

  const getRouteMetrics = () => {
    if (!itinerary || !selectedSpot) return { distance: 0, duration: 0 };

    const originLat = userLocation.lat;
    const originLng = userLocation.lng;

    const distance = getDistanceKm(originLat, originLng, selectedSpot.lat, selectedSpot.lng);

    let speed = 35; // Default for motorbike in urban areas
    if (transportMode === 'foot') speed = 5;
    else if (transportMode === 'bike') speed = 12;
    else if (transportMode === 'motorbike') speed = 35;
    else if (transportMode === 'car') speed = 45;

    const rawHours = distance / speed;
    const rawMinutes = Math.round(rawHours * 60);

    return {
      distance,
      duration: Math.max(1, rawMinutes)
    };
  };

  const routeMetrics = getRouteMetrics();

  // Dynamic stats synced with simulation or multi-route alternatives
  const activeDistance = (alternativeRoutes && alternativeRoutes[selectedRouteIndex])
    ? parseFloat((alternativeRoutes[selectedRouteIndex].distance / 1000).toFixed(1))
    : (isNavigating ? simDistance : routeMetrics.distance);

  const activeDuration = (alternativeRoutes && alternativeRoutes[selectedRouteIndex])
    ? (() => {
      const activeRoute = alternativeRoutes[selectedRouteIndex];
      const distKm = parseFloat((activeRoute.distance / 1000).toFixed(1));
      let dur = Math.max(1, Math.round(activeRoute.duration / 60));
      if (transportMode === 'motorbike') {
        dur = Math.max(1, Math.round((activeRoute.duration * 0.8) / 60));
      } else if (transportMode === 'car') {
        dur = Math.max(1, Math.round((activeRoute.duration * 1.25) / 60));
      } else if (transportMode === 'bike') {
        dur = Math.max(1, Math.round((distKm / 12) * 60));
      } else if (transportMode === 'foot') {
        dur = Math.max(1, Math.round((distKm / 4) * 60));
      }
      return dur;
    })()
    : (isNavigating ? simDuration : routeMetrics.duration);

  const renderItineraryContent = () => {
    if (!itinerary) {
      if (selectedSpot) {
        return (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            {/* Simple banner explaining stand-alone spot map directions */}
            <div className="w-full p-4 bg-blue-50 text-blue-700 rounded-xl text-xs flex items-center justify-between border border-blue-200 shadow-sm animate-scale-up">
              <span className="font-semibold">
                📍 {language === 'vi' ? `Chỉ đường tới: ${selectedSpot.name[language]}` : `Directions to: ${selectedSpot.name[language]}`}
              </span>
              <button
                onClick={() => {
                  setSelectedSpot(null);
                  setActivePlannerTab('studio');
                }}
                className="text-[10px] text-blue-700 hover:text-blue-900 bg-transparent border-none font-bold cursor-pointer underline"
              >
                {language === 'vi' ? 'Quay lại Studio' : 'Back to Studio'}
              </button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Map Column */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner relative bg-gray-50 z-10">
                  <LeafletMap
                    spots={[selectedSpot]}
                    selectedSpot={selectedSpot}
                    showTravelRoute={true}
                    language={language}
                    isNavigating={isNavigating}
                    isMobile={isMobileDevice}
                    userLocation={userLocation}
                    transportMode={transportMode}
                    userHeading={userHeading}
                    activeStreetName={isNavigating ? simActiveStreet : ''}
                    isDarkMode={isDarkMode}
                    alternativeRoutes={alternativeRoutes}
                    selectedRouteIndex={selectedRouteIndex}
                    onSelectRoute={setSelectedRouteIndex}
                    mapRotationActive={mapRotationActive}
                  />
                </div>
              </div>

              {/* Directions details Sidebar Column */}
              <div className="md:col-span-5 flex flex-col gap-4 animate-fade-in-up">
                {/* Distance and Estimated Duration Card */}
                <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <h3 className="font-outfit text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
                    <Navigation className="w-4 h-4 text-heritage-amber" />
                    {language === 'vi' ? 'Thông tin tuyến đường' : 'Route Details'}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-150 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{language === 'vi' ? 'Quãng đường' : 'Distance'}</span>
                      <span className="text-xs font-black text-gray-800 mt-1">{simDistance} km</span>
                    </div>
                    <div className="flex flex-col border-l border-gray-200">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{language === 'vi' ? 'Thời gian di chuyển' : 'Travel Duration'}</span>
                      <span className="text-xs font-black text-heritage-amber mt-1">~{simDuration} phút</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <span className="font-semibold">{language === 'vi' ? 'Tuyến đường chính:' : 'Primary Corridor:'}</span>
                    <span className="font-extrabold text-gray-800 flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-ricefield-green animate-pulse" />
                      {simActiveStreet || (language === 'vi' ? 'Đang cập nhật...' : 'Updating...')}
                    </span>
                  </div>

                  {/* Travel Mode Selector pills */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'vi' ? 'Phương tiện:' : 'Mode:'}</span>
                    <div className="flex gap-1.5">
                      {[
                        { mode: 'foot', icon: Footprints, label: 'Bộ' },
                        { mode: 'bike', icon: Bike, label: 'Xe đạp' },
                        { mode: 'motorbike', icon: Compass, label: 'Xe máy' },
                        { mode: 'car', icon: Car, label: 'Ô tô' }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = transportMode === item.mode;
                        return (
                          <button
                            key={item.mode}
                            type="button"
                            onClick={() => setTransportMode(item.mode)}
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer ${isSelected
                              ? 'bg-heritage-amber/15 border-heritage-amber text-heritage-amber scale-[1.05]'
                              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            title={item.label}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={isNavigating ? handleStopNavigation : handleStartNavigation}
                    className={`w-full mt-1.5 py-3 bg-gradient-to-tr from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] border-none ${isNavigating ? 'bg-red-500 hover:bg-red-650 animate-pulse' : ''}`}
                  >
                    <Navigation className={`w-4 h-4 ${isNavigating ? 'animate-spin' : ''}`} />
                    {isNavigating ? t('mapStopNav') : t('mapStartNav')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    }
    return (
      <div className="w-full flex flex-col gap-6 animate-fade-in">

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
                  setSlotPage(1);
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

          <div className="flex gap-2">
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

            {isSavedItinerary && activeItineraryId && (
              <button
                type="button"
                disabled={activeItineraryStatus === 'COMPLETED'}
                onClick={handleCompleteItinerary}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 border shadow-sm ${activeItineraryStatus === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-tr from-ricefield-green to-emerald-600 text-white border-transparent hover:scale-[1.02] shadow-md cursor-pointer'
                  }`}
              >
                <Check className="w-3.5 h-3.5" />
                {activeItineraryStatus === 'COMPLETED'
                  ? (language === 'vi' ? 'ĐÃ HOÀN THÀNH LỘ TRÌNH' : 'COMPLETED')
                  : (language === 'vi' ? 'HOÀN THÀNH LỘ TRÌNH' : 'COMPLETE ROUTE')}
              </button>
            )}
          </div>
        </div>

        {/* Layout for Timeline vs Cost Breakdown & Dynamic GPS Maps */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Timeline Column */}
          <div className={`md:col-span-7 flex flex-col gap-4 order-2 md:order-1 ${isMobileDevice && mobileViewMode !== 'list' ? 'hidden md:flex' : ''}`}>
            {itinerary[activeDay - 1].accommodation ? (
              <div
                onClick={() => selectSpotAndScroll(itinerary[activeDay - 1].accommodation)}
                className={`w-full bg-white border p-4 rounded-2xl flex flex-col gap-3 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md shimmer-trigger animate-fade-in-up [animation-delay:100ms] ${selectedSpot && selectedSpot.lat === itinerary[activeDay - 1].accommodation.lat
                  ? 'border-heritage-amber ring-2 ring-heritage-amber/20 scale-[1.01]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    <img
                      src={itinerary[activeDay - 1].accommodation.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                      alt="Homestay"
                      className="w-full sm:w-28 h-40 sm:h-28 rounded-xl object-cover bg-gray-50 border border-gray-100 relative z-10"
                    />
                    {showTravelRoute && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 z-25">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-row justify-between w-full sm:w-auto sm:flex-grow gap-2">
                    <div className="flex-grow relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 font-bold px-1.5 py-0.5 rounded-md uppercase leading-none">{t('restPlace')}</span>
                      </div>
                      <h4 className="font-outfit text-sm font-bold text-gray-900 mt-1">{itinerary[activeDay - 1].accommodation.name?.[language] || 'Homestay / Khách sạn'}</h4>
                      <p className="text-[10.5px] text-gray-500 leading-normal mt-0.5">{itinerary[activeDay - 1].accommodation.reason?.[language] || 'Nơi lưu trú thư giãn lý tưởng.'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 relative z-10">
                      <span className="text-[10px] text-gray-400 block">{t('estimatedNight')}</span>
                      <span className="text-xs font-extrabold text-heritage-amber">
                        {formatPriceRange(
                          itinerary[activeDay - 1].accommodation.minCost || 0,
                          itinerary[activeDay - 1].accommodation.maxCost || 0,
                          language === 'vi' ? 'Miễn phí' : 'Free'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Standard bottom quick action bar */}
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 relative z-10">
                  <span className="text-[10px] text-gray-400 font-semibold">{t('quickActions')}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwapSpot(activeDay - 1, 'STAY');
                    }}
                    className="text-[10px] hover:text-heritage-amber text-gray-500 flex items-center gap-1 transition-colors cursor-pointer font-bold border-none bg-transparent"
                  >
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    {language === 'vi' ? 'Đổi địa điểm' : 'Swap Place'}
                  </button>
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
                if (key.includes('BREAKFAST')) {
                  return { label: language === 'vi' ? '🥞 Ăn sáng' : '🥞 Breakfast', icon: Sunrise, color: 'text-amber-600 bg-amber-50 border-amber-200' };
                }
                if (key.includes('MORNING')) {
                  return { label: language === 'vi' ? '☀️ Tham quan Sáng' : '☀️ Morning Sightseeing', icon: Compass, color: 'text-blue-500 bg-blue-50 border-blue-200' };
                }
                if (key.includes('LUNCH')) {
                  return { label: language === 'vi' ? '🍲 Ăn trưa' : '🍲 Lunch', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' };
                }
                if (key.includes('AFTERNOON_TEA') || key.includes('CAFE')) {
                  return { label: language === 'vi' ? '☕ Ăn chiều & Cà phê' : '☕ Afternoon Tea & Cafe', icon: Compass, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
                }
                if (key.includes('AFTERNOON')) {
                  return { label: language === 'vi' ? '🌇 Tham quan Chiều' : '🌇 Afternoon Sightseeing', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' };
                }
                if (key.includes('DINNER')) {
                  return { label: language === 'vi' ? '🏮 Ăn tối' : '🏮 Dinner', icon: Moon, color: 'text-rose-600 bg-rose-50 border-rose-200' };
                }
                if (key.includes('EVENING')) {
                  return { label: language === 'vi' ? '🌃 Vui chơi Tối' : '🌃 Evening Experience', icon: Moon, color: 'text-indigo-650 bg-indigo-50 border-indigo-200' };
                }
                return { label: language === 'vi' ? '📌 Trải nghiệm' : '📌 Activity', icon: Compass, color: 'text-gray-500 bg-gray-50 border-gray-200' };
              };

              const itemsPerPage = 3;
              const totalPages = Math.ceil(displaySlots.length / itemsPerPage);
              const safePage = Math.min(slotPage, Math.max(1, totalPages));
              const startIndex = (safePage - 1) * itemsPerPage;
              const paginatedSlots = displaySlots.slice(startIndex, startIndex + itemsPerPage);

              return (
                <>
                  {paginatedSlots.map((s, idx) => {
                    const item = s.spot;
                    if (!item) return null;
                    const { label, icon: Icon, color } = getSlotInfo(s.slot);
                    const isFocus = selectedSpot && selectedSpot.lat === item.lat && selectedSpot.lng === item.lng;
                    const delay = `[animation-delay:${200 + idx * 100}ms]`;
                    const timeStr = s.time ? s.time : (language === 'vi' ? 'Lịch trình dự kiến' : 'Estimated schedule');

                    return (
                      <div
                        key={`${s.slot}-${idx}`}
                        onClick={() => selectSpotAndScroll(item)}
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

                        {/* Content using accommodation layout style */}
                        <div className="flex-grow relative z-10 flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                            {item.img && (
                              <div className="relative flex-shrink-0 w-full sm:w-auto">
                                <img
                                  src={item.img}
                                  alt={item.name?.[language] || 'Spot'}
                                  className="w-full sm:w-28 h-40 sm:h-28 rounded-xl object-cover bg-gray-50 border border-gray-100 relative z-10"
                                />
                                {item.images && item.images.length > 0 && (
                                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-md font-semibold z-20">📸 {item.images.length}</span>
                                )}
                              </div>
                            )}
                            <div className="flex flex-row justify-between w-full sm:w-auto sm:flex-grow gap-2">
                              <div className="flex-grow relative z-10">
                                <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                  <span>{label}</span>
                                  <span className="text-[10px] text-gray-500 font-semibold">{timeStr}</span>
                                </div>
                                <h4 className={`font-outfit text-sm font-bold transition-colors mt-1 ${isFocus ? 'text-heritage-amber font-extrabold' : 'text-gray-900 group-hover:text-heritage-amber'
                                  }`}>
                                  {item.name?.[language] || 'Địa điểm tham quan'}
                                </h4>
                                <p className="text-[10.5px] text-gray-500 leading-normal mt-1 flex items-start gap-1">
                                  <Info className="w-3.5 h-3.5 text-ricefield-green flex-shrink-0 mt-0.5" />
                                  <span>{item.reason?.[language] || 'Điểm check-in độc đáo thú vị.'}</span>
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 relative z-10">
                                <span className="text-[10px] text-gray-400 block">{language === 'vi' ? 'Chi phí dự kiến' : 'Est. cost'}</span>
                                <span className="text-xs font-extrabold text-heritage-amber">
                                  {formatPriceRange(item.minCost || 0, item.maxCost || 0, t('free'))}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interchange actions */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
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
                  })}

                  {/* Beautiful & Premium Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-3 p-3 bg-white border border-gray-150 rounded-2xl shadow-sm animate-fade-in-up">
                      <button
                        type="button"
                        disabled={safePage === 1}
                        onClick={() => setSlotPage(p => Math.max(1, p - 1))}
                        className={`p-2 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${safePage === 1
                          ? 'bg-transparent text-gray-300 border-gray-100 cursor-not-allowed'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-heritage-amber hover:border-heritage-amber hover:bg-amber-50/20 active:scale-95'
                          }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }).map((_, pageIdx) => {
                          const pageNum = pageIdx + 1;
                          const isActive = pageNum === safePage;
                          return (
                            <button
                              key={pageNum}
                              type="button; cursor-pointer"
                              onClick={() => setSlotPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all duration-200 border cursor-pointer ${isActive
                                ? 'bg-heritage-amber text-white border-transparent shadow-md shadow-heritage-amber/15 scale-[1.05]'
                                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-350 hover:bg-gray-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={safePage === totalPages}
                        onClick={() => setSlotPage(p => Math.min(totalPages, p + 1))}
                        className={`p-2 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${safePage === totalPages
                          ? 'bg-transparent text-gray-300 border-gray-100 cursor-not-allowed'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-heritage-amber hover:border-heritage-amber hover:bg-amber-50/20 active:scale-95'
                          }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Costs Breakdown & Dynamic Google Maps Sidebar Column */}
          <div className={`md:col-span-5 flex flex-col gap-4 animate-fade-in-up [animation-delay:250ms] order-1 md:order-2 ${isMobileDevice && mobileViewMode !== 'map' ? 'hidden md:flex' : ''}`}>

            {/* Sidebar Segmented Control / Tabs */}
            <div id="trip-planner-map-section" className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 shadow-sm relative z-10">
              <button
                type="button"
                onClick={() => setSidebarPage(1)}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer border-none flex items-center justify-center gap-1.5 ${sidebarPage === 1
                  ? 'bg-white text-heritage-amber shadow-md shadow-gray-250/20 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
              >
                <span>🗺️</span>
                <span>{language === 'vi' ? 'Bản đồ' : 'Map'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarPage(2)}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer border-none flex items-center justify-center gap-1.5 ${sidebarPage === 2
                  ? 'bg-white text-heritage-amber shadow-md shadow-gray-250/20 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
              >
                <span>📊</span>
                <span>{language === 'vi' ? 'Chi phí' : 'Budget'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarPage(3)}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer border-none flex items-center justify-center gap-1.5 ${sidebarPage === 3
                  ? 'bg-white text-heritage-amber shadow-md shadow-gray-250/20 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
              >
                <span>💡</span>
                <span>{language === 'vi' ? 'Gợi ý' : 'Offers'}</span>
              </button>
            </div>

            {/* Dynamic Google Map Routing Card - Apple Shimmer */}
            {sidebarPage === 1 && (
              <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 relative z-10">
                  <h3 className="font-outfit text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-heritage-amber animate-float" />
                    {t('mapTitle')}
                  </h3>
                  <div className="flex items-center gap-1.5">
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
                    isMobile={isMobileDevice}
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
                    {/* Spot Image */}
                    {selectedSpot.img && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          src={selectedSpot.img}
                          alt={selectedSpot.name[language]}
                          className="w-full h-60 object-contain"
                        />
                        {selectedSpot.images && selectedSpot.images.length > 0 && (
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-md font-semibold">📸 {selectedSpot.images.length}</span>
                        )}
                      </div>
                    )}

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
                    {/* Conditional Button based on Itinerary Save Status */}
                    {isSavedItinerary ? (
                      /* Live Navigation Button */
                      <button
                        onClick={isNavigating ? handleStopNavigation : handleStartNavigation}
                        className={`w-full mt-1.5 py-3 bg-gradient-to-tr from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] border-none ${isNavigating ? 'bg-red-500 hover:bg-red-650 animate-pulse' : ''
                          }`}
                      >
                        <Navigation className={`w-4 h-4 ${isNavigating ? 'animate-spin' : ''}`} />
                        {isNavigating ? t('mapStopNav') : t('mapStartNav')}
                      </button>
                    ) : (
                      /* Save Itinerary Button for newly generated unsaved trips */
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
                        className="w-full mt-1.5 py-3 bg-ricefield-green hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 text-center cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] border-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        {language === 'vi' ? 'LƯU LỊCH TRÌNH' : 'SAVE ITINERARY'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Financial analysis - Apple Shimmer */}
            {sidebarPage === 2 && (
              <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-5 h-fit shadow-sm shimmer-trigger animate-fade-in-up">
                <h3 className="font-outfit text-base font-bold text-gray-900 border-b border-gray-100 pb-2 relative z-10">
                  {t('financialAnalysis')}
                </h3>

                {(() => {
                  const total = costs.totalMax || 1;
                  const pAccom = (costs.accommodationMax / total) * 100;
                  const pFood = (costs.foodMax / total) * 100;
                  const pAct = (costs.activitiesMax / total) * 100;
                  const pTrans = (costs.transport / total) * 100;

                  return (
                    <div className="flex flex-col gap-5 relative z-10">
                      {/* Donut Pie Chart & Legend Row */}
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Circular Donut Chart */}
                        <div
                          className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                          style={{
                            background: `conic-gradient(
                              #4f46e5 0% ${pAccom}%,
                              #d97706 ${pAccom}% ${pAccom + pFood}%,
                              #15803d ${pAccom + pFood}% ${pAccom + pFood + pAct}%,
                              #9ca3af ${pAccom + pFood + pAct}% 100%
                            )`
                          }}
                        >
                          {/* Inner white cutout for donut chart */}
                          <div className="absolute w-24 h-24 bg-white rounded-full shadow-inner flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">
                              {language === 'vi' ? 'Ước tính' : 'Estimated'}
                            </span>
                            <span className="text-[11px] font-black text-gray-900 mt-0.5 truncate max-w-full">
                              {(costs.totalMax).toLocaleString()}đ
                            </span>
                          </div>
                        </div>

                        {/* Legend List */}
                        <div className="flex flex-col gap-2.5 w-full">
                          {[
                            { name: t('costsAccommodation'), pct: pAccom, color: 'bg-indigo-600', val: costs.accommodationMax },
                            { name: t('costsFood'), pct: pFood, color: 'bg-heritage-amber', val: costs.foodMax },
                            { name: t('costsActivities'), pct: pAct, color: 'bg-ricefield-green', val: costs.activitiesMax },
                            { name: t('costsTransport'), pct: pTrans, color: 'bg-gray-400', val: costs.transport }
                          ].map((cat) => (
                            <div key={cat.name} className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${cat.color} flex-shrink-0`} />
                                <span className="truncate max-w-[120px]">{cat.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-right font-black">
                                <span className="text-gray-900">{cat.pct.toFixed(0)}%</span>
                                <span className="text-gray-400 font-semibold text-[9.5px]">({(cat.val / 1000).toFixed(0)}k)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Budget Status Badge */}
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-150 p-3.5 rounded-xl text-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase">{language === 'vi' ? 'Ngân sách đề ra' : 'Target Budget'}</span>
                          <span className="font-black text-gray-800 mt-0.5">{(budget).toLocaleString()}đ</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                          isOverBudget
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-green-50 text-green-600 border-green-200'
                        }`}>
                          {isOverBudget
                            ? (language === 'vi' ? '⚠️ Vượt ngân sách' : '⚠️ Over Budget')
                            : (language === 'vi' ? '✅ Đạt yêu cầu' : '✅ Within Budget')
                          }
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
            )}

            {/* Premium Local Service Suggestions Frame */}
            {sidebarPage === 3 && (
              <div className="bg-gradient-to-tr from-white to-orange-50/20 border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm animate-fade-in-up">
                <h3 className="font-outfit text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Sparkles className="w-4 h-4 text-heritage-amber animate-spin-slow" />
                  {language === 'vi' ? 'Gợi Ý Dịch Vụ Bản Địa' : 'Local Service Suggestions'}
                </h3>

                <div className="flex flex-col gap-3">
                  {(() => {
                    const dbRentals = allDbSpots.filter(s =>
                      s.category === 'rental' ||
                      (s.tags && s.tags.toLowerCase().includes('rental')) ||
                      (s.tags && s.tags.toLowerCase().includes('thuê'))
                    );

                    const pageSize = 3;
                    const totalPages = Math.ceil(dbRentals.length / pageSize);
                    const activePage = rentalPage > totalPages ? 1 : rentalPage;
                    const startIndex = (activePage - 1) * pageSize;
                    const paginatedRentals = dbRentals.slice(startIndex, startIndex + pageSize);

                    if (dbRentals.length > 0) {
                      return (
                        <>
                          {paginatedRentals.map((rental, idx) => (
                            <div key={rental.id || idx} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                              <span className="text-xl">
                                {rental.name?.[language]?.toLowerCase().includes('đạp') || rental.name?.[language]?.toLowerCase().includes('bike') ? '🚲' :
                                  rental.name?.[language]?.toLowerCase().includes('máy') || rental.name?.[language]?.toLowerCase().includes('motor') ? '🛵' :
                                    rental.name?.[language]?.toLowerCase().includes('áo') || rental.name?.[language]?.toLowerCase().includes('dài') || rental.name?.[language]?.toLowerCase().includes('phục') ? '👘' :
                                      rental.name?.[language]?.toLowerCase().includes('ảnh') || rental.name?.[language]?.toLowerCase().includes('camera') ? '📸' : '📦'}
                              </span>
                              <div className="flex flex-col flex-grow">
                                <strong className="text-xs text-gray-800">{rental.name?.[language] || rental.name?.vi}</strong>
                                <span className="text-[10px] text-gray-400">
                                  {rental.cost ? `Từ ${rental.cost.toLocaleString('vi-VN')}đ` : 'Giá ưu đãi'} • {rental.reason?.[language] || rental.reason?.vi || (language === 'vi' ? 'Tiệm thuê uy tín gần bạn' : 'Highly-rated shop near you')}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedSpot(rental)}
                                className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer hover:bg-heritage-amber/20 transition-all whitespace-nowrap"
                              >
                                {language === 'vi' ? 'Xem bản đồ' : 'View on map'}
                              </button>
                            </div>
                          ))}

                          {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 w-full">
                              <span className="text-[10px] text-gray-400 font-bold tracking-wider">
                                {language === 'vi' ? `Trang ${activePage} / ${totalPages}` : `Page ${activePage} of ${totalPages}`}
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  disabled={activePage === 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRentalPage(prev => Math.max(1, prev - 1));
                                  }}
                                  className={`px-2 py-1 rounded text-[9.5px] font-extrabold tracking-wider transition-all border border-none cursor-pointer ${activePage === 1
                                    ? 'bg-gray-100 text-gray-400 opacity-55 cursor-not-allowed'
                                    : 'bg-heritage-amber/10 text-heritage-amber hover:bg-heritage-amber/20 hover:scale-105'
                                    }`}
                                >
                                  {language === 'vi' ? 'TRƯỚC' : 'PREV'}
                                </button>
                                <button
                                  disabled={activePage === totalPages}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRentalPage(prev => Math.min(totalPages, prev + 1));
                                  }}
                                  className={`px-2 py-1 rounded text-[9.5px] font-extrabold tracking-wider transition-all border border-none cursor-pointer ${activePage === totalPages
                                    ? 'bg-gray-100 text-gray-400 opacity-55 cursor-not-allowed'
                                    : 'bg-heritage-amber/10 text-heritage-amber hover:bg-heritage-amber/20 hover:scale-105'
                                    }`}
                                >
                                  {language === 'vi' ? 'SAU' : 'NEXT'}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    }

                    // Fallbacks if no rentals loaded from DB
                    return style === 'Chill & Thư giãn' ? (
                      <>
                        <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                          <span className="text-xl">🏡</span>
                          <div className="flex flex-col flex-grow">
                            <strong className="text-xs text-gray-800">Homestay Làng Rau Trà Quế</strong>
                            <span className="text-[10px] text-gray-400">Từ 350.000đ/đêm • 4.8★</span>
                          </div>
                          <button className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Đặt phòng</button>
                        </div>
                        <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                          <span className="text-xl">🚲</span>
                          <div className="flex flex-col flex-grow">
                            <strong className="text-xs text-gray-800">Cho thuê xe đạp sinh thái</strong>
                            <span className="text-[10px] text-gray-400">Từ 50.000đ/ngày • Thân thiện môi trường</span>
                          </div>
                          <button className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Thuê ngay</button>
                        </div>
                      </>
                    ) : style === 'Sống ảo' ? (
                      <>
                        <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                          <span className="text-xl">👘</span>
                          <div className="flex flex-col flex-grow">
                            <strong className="text-xs text-gray-800">Cho thuê Áo Dài cổ trang Hội An</strong>
                            <span className="text-[10px] text-gray-400">Từ 120.000đ/bộ • Nhiều mẫu cực đẹp</span>
                          </div>
                          <button className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Thuê ngay</button>
                        </div>
                        <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                          <span className="text-xl">📸</span>
                          <div className="flex flex-col flex-grow">
                            <strong className="text-xs text-gray-800">Thuê máy ảnh film & Thợ chụp</strong>
                            <span className="text-[10px] text-gray-400">Từ 400.000đ/buổi • Lưu giữ khoảnh khắc</span>
                          </div>
                          <button className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Liên hệ</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                          <span className="text-xl">🛵</span>
                          <div className="flex flex-col flex-grow">
                            <strong className="text-xs text-gray-800">Cho thuê xe máy Hội An Tây</strong>
                            <span className="text-[10px] text-gray-400">Từ 100.000đ/ngày • Giao xe tận nơi</span>
                          </div>
                          <button className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Thuê ngay</button>
                        </div>
                        <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-150 hover:shadow-md transition-all">
                          <span className="text-xl">🏺</span>
                          <div className="flex flex-col flex-grow">
                            <strong className="text-xs text-gray-800">Vé học làm Gốm Thanh Hà</strong>
                            <span className="text-[10px] text-gray-400">Chỉ 35.000đ/vé • Tự làm sản phẩm</span>
                          </div>
                          <button className="text-[10px] bg-ricefield-green/10 text-ricefield-green border border-ricefield-green/20 px-2.5 py-1 rounded-lg font-bold border-none cursor-pointer">Mua vé</button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Floating View Toggle for Mobile */}
        {isMobileDevice && itinerary && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={() => setMobileViewMode(mobileViewMode === 'list' ? 'map' : 'list')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-heritage-amber text-white font-extrabold text-xs shadow-lg shadow-heritage-amber/40 border-none cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {mobileViewMode === 'list' ? (
                <>
                  <span>🗺️</span>
                  <span>{language === 'vi' ? 'Xem Bản đồ' : 'Show Map'}</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>{language === 'vi' ? 'Xem Lịch trình' : 'Show List'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[95%] w-full mx-auto px-6 py-10 flex flex-col items-center gap-10">
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
          {language === 'vi' ? 'Sinh Lịch Trình' : 'Trip Planner'}
        </button>
        {(itinerary || selectedSpot) && (
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
          {language === 'vi' ? 'Lịch Trình Của Tôi' : 'My Saved Itineraries'}
        </button>
      </div>

      {activePlannerTab === 'studio' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side - Input Panel - Apple Shimmer */}
          <div className="lg:col-span-4 bg-gradient-to-tr from-white to-amber-50/10 border border-heritage-gold/20 p-6 sm:p-7 rounded-3xl flex flex-col gap-6 shadow-xl relative overflow-hidden shimmer-trigger">
            {/* Absolute decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-amber/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="font-outfit text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 relative z-10">
              <Calendar className="w-5 h-5 text-heritage-amber" />
              {t('tripParams')}
            </h3>

            {/* Destination */}
            <div className="flex flex-col gap-1.5 relative z-10">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('destination')}</label>
              <input
                type="text"
                value={language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam'}
                disabled
                className="bg-gray-50/80 border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl text-sm font-bold shadow-inner"
              />
            </div>

            {/* Days & Style */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('daysCount')}</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="bg-white border border-gray-200 text-gray-800 px-3 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                >
                  <option value={1}>{language === 'vi' ? '1 Ngày' : '1 Day'}</option>
                  <option value={2}>{language === 'vi' ? '2 Ngày' : '2 Days'}</option>
                  <option value={3}>{language === 'vi' ? '3 Ngày' : '3 Days'}</option>
                  <option value={4}>{language === 'vi' ? '4 Ngày' : '4 Days'}</option>
                  <option value={5}>{language === 'vi' ? '5 Ngày' : '5 Days'}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('travelStyle')}</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-800 px-3 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                >
                  <option value="Chill & Thư giãn">{language === 'vi' ? 'Chill & Thư giãn' : 'Chill & Relax'}</option>
                  <option value="Sống ảo">{language === 'vi' ? 'Sống ảo' : 'Instagrammable / Aesthetic'}</option>
                  <option value="Trải nghiệm">{language === 'vi' ? 'Trải nghiệm local' : 'Experience'}</option>
                </select>
              </div>
            </div>

            {/* Budget Setting */}
            <div className="flex flex-col gap-2.5 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('budgetLabel')}</label>
                <span className="text-heritage-amber font-black text-sm">{(budget / 1000000).toFixed(1)} {language === 'vi' ? 'triệu VND' : 'M VND'}</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={25000000}
                step={500000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-amber"
              />
            </div>

            {/* Group size */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 relative z-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('adults')}</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                  className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 text-center font-black shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('children')}</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                  className="bg-white border border-gray-200 text-gray-800 px-3 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 text-center font-black shadow-sm"
                />
              </div>
            </div>

            {/* Interests Custom Text Input */}
            <div className="flex flex-col gap-2 relative z-10 border-t border-gray-150 pt-5">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('interests')}</label>
              <textarea
                rows={4}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={language === 'vi'
                  ? 'Hãy viết sở thích cá nhân của bạn (Ví dụ: Muốn ăn cao lầu Bà Bé, uống cà phê sữa đá ven sông, đi dạo ngắm đèn lồng Phố Cổ và ngắm hoàng hôn biển An Bàng...)'
                  : 'Write your personalized travel preferences...'}
                className="w-full bg-white border border-gray-200 text-gray-850 px-4 py-3.5 rounded-2xl text-xs focus:outline-none focus:border-heritage-amber resize-none font-bold leading-relaxed hover:border-gray-300 focus:ring-4 focus:ring-heritage-amber/10 transition-all duration-300 shadow-sm"
              />
            </div>

            {/* CTA Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-tr from-heritage-amber to-heritage-gold hover:from-heritage-gold hover:to-heritage-amber disabled:bg-gray-300 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-heritage-amber/25 hover:shadow-heritage-amber/35 cursor-pointer border-none z-10 uppercase"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              {loading ? t('generating') : t('generateButton')}
            </button>
          </div>

          {/* Right Side - Output Timeline & Map Analysis */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Loading Animation */}
            {loading && (
              <div className="w-full h-[550px] bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 gap-6 shadow-xl animate-scale-up">
                <div className="relative w-16 h-16 border-4 border-heritage-amber/20 border-t-heritage-amber rounded-full animate-spin flex items-center justify-center" />
                <div className="text-center flex flex-col gap-2 max-w-sm">
                  <span className="text-heritage-amber font-outfit text-sm font-black tracking-widest uppercase">{t('generating')}</span>
                  <p className="text-xs text-gray-550 font-semibold italic leading-relaxed">
                    "{t('loadingFact')} {facts[loadingFactIndex]}"
                  </p>
                </div>
              </div>
            )}

            {/* Placeholder state */}
            {!loading && !itinerary && (
              <div className="w-full h-[550px] border border-dashed border-gray-250 bg-gradient-to-br from-white to-gray-50/30 rounded-3xl flex flex-col items-center justify-center text-center p-8 gap-5 animate-fade-in relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="bg-white border border-gray-250/60 p-4.5 rounded-full text-heritage-amber shadow-md animate-float relative z-10">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-outfit text-lg font-black text-gray-800 mb-1.5">{t('noItinerary')}</h3>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-bold">
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
        <div className="w-full">
          {renderItineraryContent()}
        </div>
      )}

      {activePlannerTab === 'saved' && (
        <div className="w-full bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
          <h3 className="font-outfit text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
            {language === 'vi' ? 'Lịch trình bạn đã lưu' : 'Your Saved Itineraries'}
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
                  {language === 'vi' ? 'Hãy dùng tính năng Sinh Lịch Trình và bấm Lưu để lưu giữ kỷ niệm.' : 'Generate a trip and save it to cloud.'}
                </p>
              </div>
              <button
                onClick={() => setActivePlannerTab('studio')}
                className="mt-2 px-4 py-2 bg-heritage-amber text-white rounded-xl text-xs font-bold border-none hover:bg-heritage-gold cursor-pointer transition-colors"
              >
                {language === 'vi' ? 'Trải nghiệm sinh ngay' : 'Try Planner'}
              </button>
            </div>
          )}

          {currentUser && savedItineraries.length > 0 && (
            <div className="flex bg-gray-50 border border-gray-250/50 p-1 rounded-xl w-fit self-start gap-1 select-none mb-2">
              {[
                { filter: 'ALL', label: language === 'vi' ? 'Tất cả' : 'All' },
                { filter: 'NOT_STARTED', label: language === 'vi' ? 'Chưa bắt đầu' : 'Not Started' },
                { filter: 'IN_PROGRESS', label: language === 'vi' ? 'Đang thực hiện' : 'In Progress' },
                { filter: 'COMPLETED', label: language === 'vi' ? 'Đã hoàn thành' : 'Completed' }
              ].map((btn) => (
                <button
                  key={btn.filter}
                  onClick={() => setSavedFilter(btn.filter)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all border-none cursor-pointer ${savedFilter === btn.filter
                    ? 'bg-white text-heritage-amber shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 bg-transparent'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {currentUser && savedItineraries.length > 0 && (
            (() => {
              const filtered = savedItineraries.filter(saved =>
                savedFilter === 'ALL' || (saved.status || 'NOT_STARTED') === savedFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 flex flex-col items-center gap-3 border-2 border-dashed border-gray-205 rounded-2xl w-full">
                    <Calendar className="w-8 h-8 text-gray-300 animate-float" />
                    <p className="text-xs font-bold text-gray-550 leading-relaxed">
                      {language === 'vi' ? 'Không tìm thấy lịch trình nào ở trạng thái này!' : 'No itineraries found in this status!'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {filtered.map((saved) => (
                    <div
                      key={saved.id}
                      onClick={() => handleLoadSaved(saved)}
                      className="group border border-gray-200 hover:border-heritage-amber hover:shadow-md bg-white p-5 rounded-2xl flex flex-col gap-4 transition-all duration-300 cursor-pointer relative animate-scale-up"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-outfit font-extrabold text-base text-gray-900 group-hover:text-heritage-gold transition-colors">
                              {saved.title}
                            </h4>
                            {(() => {
                              const status = saved.status || 'NOT_STARTED';
                              if (status === 'COMPLETED') {
                                return (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wide leading-none whitespace-nowrap">
                                    {language === 'vi' ? 'Hoàn thành' : 'Completed'}
                                  </span>
                                );
                              }
                              if (status === 'IN_PROGRESS') {
                                return (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 animate-pulse uppercase tracking-wide leading-none whitespace-nowrap">
                                    {language === 'vi' ? 'Đang thực hiện' : 'In Progress'}
                                  </span>
                                );
                              }
                              return (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-50 text-gray-500 border border-gray-200 uppercase tracking-wide leading-none whitespace-nowrap">
                                  {language === 'vi' ? 'Chưa bắt đầu' : 'Not Started'}
                                </span>
                              );
                            })()}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold block mt-1">
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

                      <div className="flex items-center justify-end mt-1 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-heritage-amber uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          <span>{language === 'vi' ? 'Mở chi tiết' : 'Open Details'}</span>
                          <span>➔</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4 sm:p-6 animate-fade-in">
          <div className={`border w-full h-full md:w-full md:max-w-5xl md:h-[85vh] md:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-900 shadow-slate-950/80' : 'bg-white border-gray-200'}`}>

            {/* Modal Header - Hidden if navigating to maximize immersive dashboard view */}
            {!isNavigating && (
              <div className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-b border-slate-800 text-slate-100' : 'bg-heritage-amber text-white'}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl animate-float ${isDarkMode ? 'bg-slate-800 text-heritage-gold' : 'bg-white/25 text-white'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-outfit text-sm sm:text-base font-extrabold tracking-tight">
                      {language === 'vi' ? 'Bản Đồ Chỉ Dẫn Chi Tiết' : 'Navigation Studio'}
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
                  isMobile={isMobileDevice}
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

                {/* --- FLOATING NAVIGATION HUD OVERLAYS (Visible during active navigation) --- */}
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
                            <span className="text-[11px] font-bold text-emerald-100">{simActiveStreet || (language === 'vi' ? 'Đang xác định...' : 'Determining...')}</span>
                          </div>
                        </div>

                        {/* Distance to turn count */}
                        <div className="text-right flex-shrink-0 pl-2 border-l border-white/10">
                          <span className="text-[9px] text-emerald-200 block font-extrabold uppercase tracking-wider">Trong</span>
                          <span className="text-sm font-black font-outfit text-white leading-none">
                            {(() => {
                              const step = activeManeuvers?.[activeStepIndex];
                              if (step && step.location && Array.isArray(step.location) && step.location.length >= 2 && userLocation) {
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

                    {/* Floating Digital Speedometer - Click to recenter map to current location */}
                    <div className="absolute left-4 bottom-28 md:bottom-4 z-[40] select-none">
                      {/* Speedometer card button */}
                      <button
                        onClick={() => {
                          const centerEvent = new CustomEvent('recenter-map');
                          window.dispatchEvent(centerEvent);
                        }}
                        className="bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex flex-col items-center text-center cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 hover:border-cyan-500/30 text-white"
                        title={language === 'vi' ? 'Định vị lại vị trí hiện tại' : 'Recenter Map'}
                      >
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                          {language === 'vi' ? 'TỐC ĐỘ' : 'SPEED'}
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-3xl font-black font-outfit text-white tracking-tighter leading-none animate-pulse">{userSpeed}</span>
                          <span className="text-[9px] font-bold text-slate-400 font-outfit leading-none">km/h</span>
                        </div>
                      </button>
                    </div>

                    {/* Bottom Charcoal Navigation Pull-Up HUD Sheet */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-xl animate-slide-in-up">
                      <div className="bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-between gap-3 sm:gap-6 shadow-slate-950/60">
                        <div className="flex items-center gap-3 sm:gap-5">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-0.5 sm:gap-1">
                              <span className="text-2xl sm:text-3xl font-black font-outfit text-emerald-500 leading-none">{simDuration}</span>
                              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase leading-none">{language === 'vi' ? 'phút' : 'min'}</span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">
                              {language === 'vi'
                                ? `Đến: ${(() => {
                                  const date = new Date();
                                  date.setMinutes(date.getMinutes() + simDuration);
                                  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                })()}`
                                : `Arr: ${(() => {
                                  const date = new Date();
                                  date.setMinutes(date.getMinutes() + simDuration);
                                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                                })()}`}
                            </span>
                          </div>

                          <div className="w-[1px] h-8 sm:h-10 bg-slate-800" />

                          <div className="flex flex-col">
                            <span className="text-sm sm:text-lg font-extrabold text-slate-200 font-outfit leading-none">{simDistance} km</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">
                              {language === 'vi' ? 'THỐT' : 'STOP'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleStopNavigation}
                          className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] sm:text-xs tracking-wider rounded-xl sm:rounded-2xl shadow-lg shadow-red-650/20 border-none cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 animate-pulse"
                        >
                          <X className="w-3.5 h-3.5" />
                          {language === 'vi' ? 'THOÁT' : 'STOP'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Alternative Routes Picker removed by user request */}



              </div>

              {/* Details Side Navigation panel - Shown on mobile if 'details' is active, always shown on md+ (Hidden when actively navigating) */}
              {!isNavigating && (
                <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-850 flex flex-col bg-white dark:bg-slate-950 overflow-y-auto p-5 gap-5 animate-slide-in-right ${activeModalView === 'details' ? 'flex' : 'hidden md:flex'}`}>
                  <div className="flex flex-col gap-1 pb-3 border-b border-gray-100 dark:border-slate-850">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{t('mapRouteTo')}:</span>
                    <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-slate-100">{selectedSpot ? selectedSpot.name[language] : ''}</h3>
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
                      {language === 'vi' ? 'BẮT ĐẦU DẪN ĐƯỜNG' : 'START NAVIGATION'}
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

      {/* Premium Dynamic Spot Swapper Dropdown Dialog */}
      {swapDropdown && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999] flex items-center justify-center animate-fade-in" onClick={() => setSwapDropdown(null)}>
          <div
            className="bg-white/95 border border-gray-200 p-5 rounded-2xl w-[90%] max-w-[380px] shadow-2xl flex flex-col gap-4 animate-scale-up backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Thay thế địa điểm</span>
                <strong className="text-xs text-gray-800">
                  {swapDropdown.currentSpot.name?.[language] || swapDropdown.currentSpot.name?.vi}
                </strong>
              </div>
              <button
                onClick={() => setSwapDropdown(null)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm font-extrabold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
              {swapDropdown.candidates.length > 0 ? (
                swapDropdown.candidates.map((candidate, idx) => (
                  <div
                    key={candidate.id || idx}
                    onClick={() => executeSwapSpot(candidate)}
                    className="flex gap-3 items-center bg-white hover:bg-heritage-amber/5 hover:border-heritage-amber/30 p-2.5 rounded-xl border border-gray-150 transition-all cursor-pointer group"
                  >
                    <img
                      src={candidate.img || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80'}
                      alt="Candidate"
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col flex-grow min-w-0">
                      <strong className="text-xs text-gray-800 truncate group-hover:text-heritage-amber transition-colors">
                        {candidate.name?.[language] || candidate.name?.vi}
                      </strong>
                      <span className="text-[9px] text-gray-400 truncate">
                        {candidate.cost ? `${candidate.cost.toLocaleString()}đ` : 'Giá tham khảo'} • {candidate.reason?.[language] || candidate.reason?.vi || 'Điểm thay thế hấp dẫn'}
                      </span>
                    </div>
                    <span className="text-xs text-heritage-amber opacity-0 group-hover:opacity-100 transition-opacity font-bold"> Chọn </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">Không tìm thấy địa điểm thay thế tương tự.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
