import React, { useState, useEffect } from 'react';
import entertainmentService from '../../../services/entertainmentService.js';

const LeafletMap = ({ lat, lng, name }) => {
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
  }, [mapLoaded, lat, lng, name]);

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

// A reusable form component for creating/updating an Entertainment
export default function EntertainmentForm({ initialData = null, onSuccess = () => {}, onCancel = () => {} }) {
  const [form, setForm] = useState({
    type: '',
    interests: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    minPrice: '',
    maxPrice: '',
    imageUrl: '',
    openingTime: '',
    closingTime: '',
    overnight: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Detect overnight when openingTime > closingTime (e.g., 20:00 > 02:00)
      const opening = initialData.openingTime ? initialData.openingTime.substring(0,5) : '';
      const closing = initialData.closingTime ? initialData.closingTime.substring(0,5) : '';
      const overnightFlag = opening && closing && opening > closing;
      setForm({
        type: initialData.type || '',
        interests: initialData.interests || '',
        name: initialData.name || '',
        address: initialData.address || '',
        latitude: initialData.latitude ?? '',
        longitude: initialData.longitude ?? '',
        minPrice: initialData.minPrice ?? '',
        maxPrice: initialData.maxPrice ?? '',
        imageUrl: initialData.imageUrl || '',
        openingTime: opening,
        closingTime: closing,
        overnight: overnightFlag,
      });
    }
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Tên không được để trống';
    // Allow overnight hours (e.g., mở 20:00, đóng 02:00) — no client-side rejection for opening > closing
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setForm((f) => ({ ...f, [name]: checked }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        interests: form.interests,
        name: form.name,
        address: form.address,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        minPrice: form.minPrice === '' ? null : Number(form.minPrice),
        maxPrice: form.maxPrice === '' ? null : Number(form.maxPrice),
        imageUrl: form.imageUrl,
        openingTime: form.openingTime || null,
        closingTime: form.closingTime || null,
        overnight: !!form.overnight,
      };

      if (initialData && initialData.id) {
        await entertainmentService.updateEntertainment(initialData.id, payload);
      } else {
        await entertainmentService.createEntertainment(payload);
      }

      onSuccess();
    } catch (err) {
      // err may be server response object or message
      const msg = err?.message || JSON.stringify(err);
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-4">
          <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
            Thông tin cơ bản
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Tên khu vui chơi</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                placeholder="VinWonders, Khu vui chơi biển..."
              />
              {errors.name && <div className="text-red-600 text-xs font-semibold">{errors.name}</div>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Phân loại</label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                placeholder="Biển, Vui chơi, Trải nghiệm..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Sở thích</label>
            <input
              name="interests"
              value={form.interests}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
              placeholder="Gia đình, trẻ em, thể thao..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Giờ mở cửa</label>
              <input
                name="openingTime"
                type="time"
                value={form.openingTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Giờ đóng cửa</label>
              <input
                name="closingTime"
                type="time"
                value={form.closingTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Giá từ (VNĐ)</label>
              <input
                name="minPrice"
                value={form.minPrice}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Giá đến (VNĐ)</label>
              <input
                name="maxPrice"
                value={form.maxPrice}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Hoạt động qua đêm</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3">
              <input
                id="overnight"
                name="overnight"
                type="checkbox"
                checked={!!form.overnight}
                onChange={handleCheckbox}
                className="h-4 w-4 rounded border-gray-300 text-heritage-amber focus:ring-heritage-amber"
              />
              <label htmlFor="overnight" className="text-xs font-semibold text-gray-600">
                Đóng vào ngày tiếp theo nếu giờ đóng nhỏ hơn giờ mở
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
            Hình ảnh & Định vị
          </h4>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Đường dẫn ảnh trực tiếp</label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

           <div className="flex flex-col gap-1.5">
             <label className="text-xs font-bold text-gray-500">Địa chỉ</label>
             <div className="flex gap-2">
               <input
                 name="address"
                 value={form.address}
                 onChange={handleChange}
                 className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                 placeholder="Hội An, Quảng Nam"
               />
             </div>
           </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Vĩ độ (Latitude)</label>
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                placeholder="15.8801"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Kinh độ (Longitude)</label>
              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                placeholder="108.3300"
              />
            </div>
          </div>

          {form.latitude && form.longitude && (
            <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
              <LeafletMap
                lat={Number(form.latitude)}
                lng={Number(form.longitude)}
                name={form.name}
              />
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-4 text-xs text-gray-600 leading-6">
            Nếu giờ đóng nhỏ hơn giờ mở, hệ thống sẽ hiểu là hoạt động qua đêm.
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang lưu...' : (initialData ? 'Lưu thay đổi' : 'Lưu khu vui chơi')}
        </button>
      </div>
    </form>
  );
}

