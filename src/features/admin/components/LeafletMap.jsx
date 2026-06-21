import React from 'react';

const LeafletMap = ({ lat, lng, name, language }) => {
  const mapContainerId = React.useId().replace(/:/g, '');
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
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
    if (!mapLoaded || !window.L || !lat || !lng) return;

    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerId, {
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Google Satellite Hybrid tiles
      window.L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const pulseHtml = `<div class="relative flex items-center justify-center h-5 w-5"><div class="absolute h-5 w-5 rounded-full bg-red-500 animate-ping opacity-60"></div><div class="h-3.5 w-3.5 rounded-full bg-red-600 border-2 border-white shadow-md"></div></div>`;

    const customIcon = window.L.divIcon({
      html: pulseHtml,
      className: 'custom-dot-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    markerRef.current = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);

    markerRef.current.bindTooltip(name || '', {
      permanent: true,
      direction: 'top',
      className: 'leaflet-custom-tooltip font-outfit font-extrabold text-[10.5px] border-none shadow-sm rounded-lg bg-gray-900 text-white px-2 py-1'
    });

    map.setView([lat, lng], 16);

  }, [mapLoaded, lat, lng, name, language]);

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
      `}</style>
      <div id={mapContainerId} className="w-full h-full relative z-10" />
    </>
  );
};

export default LeafletMap;
