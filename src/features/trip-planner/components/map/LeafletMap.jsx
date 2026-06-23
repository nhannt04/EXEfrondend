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
              ${activeStreetName || (language === 'vi' ? '─Éang x├íc ─æß╗ïnh...' : 'Determining...')}
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
            // 0.00045 deg Γëê 50m offset forward in heading direction
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

      {/* Tier 1: Outer perspective wrapper ΓÇö only on mobile during navigation */}
      <div className={use3DPerspective ? "leaflet-tilted-wrapper" : "w-full h-full relative"}>
        {/* Tier 2: Middle 3D tilt container ΓÇö only on mobile during navigation */}
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
