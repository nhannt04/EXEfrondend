import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, MessageSquare, ShieldAlert, Award, Star,
  Trash2, Plus, CheckCircle, Flame, UserCheck, X, Activity, Edit3, Send, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import spotService from '../../../services/spotService.js';
import diaryService from '../../../services/diaryService.js';
import expertService from '../../../services/expertService.js';
import dishService from '../../../services/dishService.js';
import cafeService from '../../../services/cafeService.js';
import stayService from '../../../services/stayService.js';
import entertainmentService from '../../../services/entertainmentService.js';
import EntertainmentForm from '../../entertainment/components/EntertainmentForm';
import rentalService from '../../../services/rentalService.js';
import AddressDropdown from '../../../components/AddressDropdown';



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

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('dishes'); // 'dishes' | 'diaries' | 'experts' | 'inquiries'

  // Data lists
  const [spots, setSpots] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [experts, setExperts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [stays, setStays] = useState([]);
  const [entertainments, setEntertainments] = useState([]);
  const [rentals, setRentals] = useState([]);

  // Address lists for dropdowns
  const [cafeAddresses, setCafeAddresses] = useState([]);
  const [entertainmentAddresses, setEntertainmentAddresses] = useState([]);
  const [rentalAddresses, setRentalAddresses] = useState([]);



  // Loading states
  const [loading, setLoading] = useState(true);

  // Spots CRUD States
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [newSpotNameVi, setNewSpotNameVi] = useState('');
  const [newSpotNameEn, setNewSpotNameEn] = useState('');
  const [newSpotCategory, setNewSpotCategory] = useState('healing');
  const [newSpotMinCost, setNewSpotMinCost] = useState(0);
  const [newSpotMaxCost, setNewSpotMaxCost] = useState(0);
  const [newSpotLat, setNewSpotLat] = useState(15.8771);
  const [newSpotLng, setNewSpotLng] = useState(108.3267);
  const [newSpotCrowdLevel, setNewSpotCrowdLevel] = useState('low');
  const [newSpotAddress, setNewSpotAddress] = useState('');
  const [newSpotTags, setNewSpotTags] = useState('');
  const [newSpotOpeningTime, setNewSpotOpeningTime] = useState('08:00');
  const [newSpotClosingTime, setNewSpotClosingTime] = useState('22:00');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dishes CRUD States
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [isDishEditMode, setIsDishEditMode] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [newDishName, setNewDishName] = useState('');
  const [newDishRestaurant, setNewDishRestaurant] = useState('');
  const [newDishAddress, setNewDishAddress] = useState('');
  const [newDishLat, setNewDishLat] = useState(15.8771);
  const [newDishLng, setNewDishLng] = useState(108.3267);
  const [newDishMinPrice, setNewDishMinPrice] = useState(0);
  const [newDishMaxPrice, setNewDishMaxPrice] = useState(0);
  const [newDishOpeningTime, setNewDishOpeningTime] = useState('08:00');
  const [newDishClosingTime, setNewDishClosingTime] = useState('22:00');
  const [newDishImageUrl, setNewDishImageUrl] = useState('');
  const [dishSearchTerm, setDishSearchTerm] = useState('');

  // Cafes CRUD States
  const [showAddCafeModal, setShowAddCafeModal] = useState(false);
  const [isCafeEditMode, setIsCafeEditMode] = useState(false);
  const [editingCafeId, setEditingCafeId] = useState(null);
  const [newCafeName, setNewCafeName] = useState('');
  const [newCafeStyle, setNewCafeStyle] = useState('');
  const [newCafeAddress, setNewCafeAddress] = useState('');
  const [newCafeLat, setNewCafeLat] = useState(15.8771);
  const [newCafeLng, setNewCafeLng] = useState(108.3267);
  const [newCafeMinPrice, setNewCafeMinPrice] = useState(0);
  const [newCafeMaxPrice, setNewCafeMaxPrice] = useState(0);
  const [newCafeOpeningTime, setNewCafeOpeningTime] = useState('08:00');
  const [newCafeClosingTime, setNewCafeClosingTime] = useState('22:00');
  const [newCafeImageUrl, setNewCafeImageUrl] = useState('');
  const [cafeSearchTerm, setCafeSearchTerm] = useState('');

  // Stays CRUD States
  const [showAddStayModal, setShowAddStayModal] = useState(false);
  const [isStayEditMode, setIsStayEditMode] = useState(false);
  const [editingStayId, setEditingStayId] = useState(null);
  const [newStayType, setNewStayType] = useState('Hotel');
  const [newStayName, setNewStayName] = useState('');
  const [newStayAddress, setNewStayAddress] = useState('');
  const [newStayLat, setNewStayLat] = useState(15.8771);
  const [newStayLng, setNewStayLng] = useState(108.3267);
  const [newStayCapacity, setNewStayCapacity] = useState('');
  const [newStayMinPrice, setNewStayMinPrice] = useState(0);
  const [newStayMaxPrice, setNewStayMaxPrice] = useState(0);
  const [newStayNotes, setNewStayNotes] = useState('');
  const [newStayImageUrl, setNewStayImageUrl] = useState('');
  const [staySearchTerm, setStaySearchTerm] = useState('');

  // Entertainments CRUD States
  const [showAddEntertainmentModal, setShowAddEntertainmentModal] = useState(false);
  const [isEntertainmentEditMode, setIsEntertainmentEditMode] = useState(false);
  const [editingEntertainmentId, setEditingEntertainmentId] = useState(null);
  const [newEntertainmentType, setNewEntertainmentType] = useState('Biển');
  const [newEntertainmentInterests, setNewEntertainmentInterests] = useState('');
  const [newEntertainmentName, setNewEntertainmentName] = useState('');
  const [newEntertainmentAddress, setNewEntertainmentAddress] = useState('');
  const [newEntertainmentLat, setNewEntertainmentLat] = useState(15.8771);
  const [newEntertainmentLng, setNewEntertainmentLng] = useState(108.3267);
  const [newEntertainmentMinPrice, setNewEntertainmentMinPrice] = useState(0);
  const [newEntertainmentMaxPrice, setNewEntertainmentMaxPrice] = useState(0);
  const [newEntertainmentImageUrl, setNewEntertainmentImageUrl] = useState('');
  const [newEntertainmentOpeningTime, setNewEntertainmentOpeningTime] = useState('08:00');
  const [newEntertainmentClosingTime, setNewEntertainmentClosingTime] = useState('21:00');
  const [entertainmentSearchTerm, setEntertainmentSearchTerm] = useState('');

  // Rentals CRUD States
  const [showAddRentalModal, setShowAddRentalModal] = useState(false);
  const [isRentalEditMode, setIsRentalEditMode] = useState(false);
  const [editingRentalId, setEditingRentalId] = useState(null);
  const [newRentalType, setNewRentalType] = useState('Thuê máy ảnh');
  const [newRentalName, setNewRentalName] = useState('');
  const [newRentalAddress, setNewRentalAddress] = useState('');
  const [newRentalLat, setNewRentalLat] = useState(15.8771);
  const [newRentalLng, setNewRentalLng] = useState(108.3267);
  const [newRentalMinPrice, setNewRentalMinPrice] = useState(0);
  const [newRentalMaxPrice, setNewRentalMaxPrice] = useState(0);
  const [newRentalOpeningTime, setNewRentalOpeningTime] = useState('08:00');
  const [newRentalClosingTime, setNewRentalClosingTime] = useState('21:00');
  const [newRentalImageUrl, setNewRentalImageUrl] = useState('');
  const [rentalSearchTerm, setRentalSearchTerm] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDishPage, setCurrentDishPage] = useState(1);
  const [currentCafePage, setCurrentCafePage] = useState(1);
  const [currentStayPage, setCurrentStayPage] = useState(1);
  const [currentEntertainmentPage, setCurrentEntertainmentPage] = useState(1);
  const [currentRentalPage, setCurrentRentalPage] = useState(1);


  const itemsPerPage = 10;

  // Image Upload States
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState('');
  const [savedImageKey, setSavedImageKey] = useState('');

  // Inquiries Reply States
  const [replyText, setReplyText] = useState('');
  const [activeInquiryId, setActiveInquiryId] = useState(null);

  // Fetch all management data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [spotsRes, diariesRes, expertsRes, dishesRes, cafesRes, staysRes, entertainmentsRes, rentalsRes] = await Promise.all([
        spotService.getSpots(),
        diaryService.getDiaries(),
        expertService.getExperts(),
        dishService.getDishes(),
        cafeService.getCafes(),
        stayService.getStays(),
        entertainmentService.getEntertainments(),
        rentalService.getRentals()
      ]);

      // Remap spot properties from backend (nameVi, averageCost, etc) to match UI keys
      const mappedSpots = (spotsRes?.data || []).map(spot => ({
        id: spot.id,
        name: { vi: spot.nameVi, en: spot.nameEn },
        category: spot.category,
        address: spot.address || '',
        tags: spot.tags || '',
        openingTime: spot.openingTime || '08:00:00',
        closingTime: spot.closingTime || '22:00:00',
        minCost: spot.minCost || 0,
        maxCost: spot.maxCost || 0,
        cost: spot.averageCost || 0,
        lat: spot.latitude,
        lng: spot.longitude,
        crowdLevel: spot.crowdLevel,
        rating: spot.rating || 4.8,
        img: (spot.images && spot.images.length > 0)
          ? spot.images[0].imageUrl
          : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'
      }));

      setSpots(mappedSpots);
      setDiaries(diariesRes?.data || []);
      setExperts(expertsRes?.data || []);
      setDishes(dishesRes?.data || []);
      setCafes(cafesRes?.data || []);
      setStays(staysRes?.data || []);
      setEntertainments(entertainmentsRes?.data || []);
      setRentals(rentalsRes?.data || []);

      // Extract unique addresses for dropdowns
      const uniqueCafeAddresses = [...new Set(cafesRes?.data?.map(c => c.address).filter(Boolean) || [])];
      const uniqueEntertainmentAddresses = [...new Set(entertainmentsRes?.data?.map(e => e.address).filter(Boolean) || [])];
      const uniqueRentalAddresses = [...new Set(rentalsRes?.data?.map(r => r.address).filter(Boolean) || [])];

      setCafeAddresses(uniqueCafeAddresses);
      setEntertainmentAddresses(uniqueEntertainmentAddresses);
      setRentalAddresses(uniqueRentalAddresses);



      // Seed inquiries locally to ensure the console is highly populated
      setInquiries([
        {
          id: 101,
          travelerName: 'Nguyen Van A',
          travelerEmail: 'traveler@travelist.vn',
          question: 'Tôi muốn tìm quán cơm gà Hội An ngon, không quá đông đúc vào giờ trưa?',
          date: '26/05/2026 18:40',
          replied: false,
          replyContent: ''
        },
        {
          id: 102,
          travelerName: 'Lê Thuỳ Trang',
          travelerEmail: 'trang.le@outlook.com',
          question: 'Lớp học tự làm lồng đèn tre diễn ra trong bao lâu? Có cần đặt lịch trước không chuyên gia?',
          date: '25/05/2026 14:15',
          replied: true,
          replyContent: 'Workshop diễn ra tầm 1-2 tiếng bạn nhé. Bạn nên đặt trước 1 ngày để nghệ nhân chuẩn bị nguyên liệu tốt nhất!'
        }
      ]);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);




  // Handle direct client-side upload to Cloudflare R2 via presigned PUT url
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(language === 'vi' ? 'Chỉ hỗ trợ ảnh dạng JPG, PNG, WEBP!' : 'Only JPG, PNG, WEBP images are supported!');
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      // 1. Gửi request sinh Presigned URL từ backend
      const response = await spotService.getPresignedUrl(file.name, file.type, 'SPOT_IMAGE');

      if (response && response.success) {
        const { uploadUrl, fileUrl, fileKey } = response.data;

        // 2. Thực hiện tải tệp trực tiếp lên Cloudflare R2 qua PUT
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type
          },
          body: file
        });

        if (!uploadRes.ok) {
          throw new Error("HTTP upload error status: " + uploadRes.status);
        }

        // 3. Lưu thông tin public URL và key để gửi cùng payload Spot
        setSavedImageUrl(fileUrl);
        setSavedImageKey(fileKey);

        alert(language === 'vi'
          ? 'Tải ảnh lên Cloudflare R2 thành công!'
          : 'Successfully uploaded image to Cloudflare R2!');
      } else {
        throw new Error(response?.message || "Failed to generate presigned URL");
      }
    } catch (err) {
      console.error("Direct R2 upload failed:", err);
      alert(language === 'vi'
        ? 'Không thể tải ảnh lên Cloudflare R2. Vui lòng kiểm tra cấu hình!'
        : 'Failed to upload image to Cloudflare R2. Please check your config!');
      setImagePreview(null);
      setSavedImageUrl('');
      setSavedImageKey('');
    } finally {
      setUploadingImage(false);
    }
  };

  // CRUD: Reset form for new spot
  const handleAddSpotClick = () => {
    setIsEditMode(false);
    setEditingSpotId(null);
    setNewSpotNameVi('');
    setNewSpotNameEn('');
    setNewSpotCategory('healing');
    setNewSpotMinCost(0);
    setNewSpotMaxCost(0);
    setNewSpotLat(15.8771);
    setNewSpotLng(108.3267);
    setNewSpotCrowdLevel('low');
    setNewSpotAddress('');
    setNewSpotTags('');
    setNewSpotOpeningTime('08:00');
    setNewSpotClosingTime('22:00');
 
    // Reset image upload states
    setImagePreview(null);
    setSavedImageUrl('');
    setSavedImageKey('');
 
    setShowAddSpotModal(true);
  };
 
  // CRUD: Edit Spot - Prefill states
  const handleEditSpotClick = (spot) => {
    setIsEditMode(true);
    setEditingSpotId(spot.id);
    setNewSpotNameVi(spot.name?.vi || '');
    setNewSpotNameEn(spot.name?.en || '');
    setNewSpotCategory(spot.category || 'healing');
    setNewSpotMinCost(spot.minCost || 0);
    setNewSpotMaxCost(spot.maxCost || 0);
    setNewSpotLat(spot.lat || 15.8771);
    setNewSpotLng(spot.lng || 108.3267);
    setNewSpotCrowdLevel(spot.crowdLevel || 'low');
    setNewSpotAddress(spot.address || '');
    setNewSpotTags(spot.tags || '');
    setNewSpotOpeningTime(spot.openingTime ? spot.openingTime.substring(0, 5) : '08:00');
    setNewSpotClosingTime(spot.closingTime ? spot.closingTime.substring(0, 5) : '22:00');
 
    // Prefill image upload states from current spot image
    setImagePreview(spot.img || null);
    setSavedImageUrl(spot.img || '');
    setSavedImageKey('');
 
    setShowAddSpotModal(true);
  };

  // CRUD: Handle Unified Spot Form Submission (Add or Update)
  const handleSpotFormSubmit = async (e) => {
    e.preventDefault();
    if (!newSpotNameVi) return;
    const finalNameEn = newSpotNameEn || newSpotNameVi;

    if (Number(newSpotMinCost) < 0 || Number(newSpotMaxCost) < 0) {
      alert(language === 'vi'
        ? 'Giá vé không được là số âm!'
        : 'Prices cannot be negative!');
      return;
    }

    if (Number(newSpotMaxCost) < Number(newSpotMinCost)) {
      alert(language === 'vi'
        ? 'Giá kết thúc (Giá đến) không được nhỏ hơn Giá khởi điểm (Giá từ)!'
        : 'Price To cannot be lower than Price From!');
      return;
    }

    try {
      const spotObj = {
        nameVi: newSpotNameVi,
        nameEn: finalNameEn,
        category: newSpotCategory,
        address: newSpotAddress,
        tags: newSpotTags || (newSpotCategory === 'food' ? 'Food' : 'Local'),
        minCost: Number(newSpotMinCost),
        maxCost: Number(newSpotMaxCost),
        latitude: Number(newSpotLat),
        longitude: Number(newSpotLng),
        crowdLevel: newSpotCrowdLevel,
        openingTime: newSpotOpeningTime ? (newSpotOpeningTime.length === 5 ? newSpotOpeningTime + ':00' : newSpotOpeningTime) : '08:00:00',
        closingTime: newSpotClosingTime ? (newSpotClosingTime.length === 5 ? newSpotClosingTime + ':00' : newSpotClosingTime) : '22:00:00',
        rating: 4.8,
        descriptionVi: newSpotCategory === 'food' ? `Món ăn: ${newSpotTags}. Địa chỉ: ${newSpotAddress}.` : 'Địa điểm vừa cập nhật vào hệ thống quản lý Travelist.',
        descriptionEn: newSpotCategory === 'food' ? `Dish: ${newSpotTags}. Address: ${newSpotAddress}.` : 'Newly registered/updated highlight destination in Travelist.',
        images: savedImageUrl ? [
          {
            imageUrl: savedImageUrl,
            imageCfId: savedImageKey || 'r2-spot-image'
          }
        ] : []
      };

      if (isEditMode && editingSpotId) {
        const response = await spotService.updateSpot(editingSpotId, spotObj);
        if (response && response.success) {
          const savedSpot = response.data;
          const mappedSpot = {
            id: savedSpot.id,
            name: { vi: savedSpot.nameVi, en: savedSpot.nameEn },
            category: savedSpot.category,
            address: savedSpot.address,
            tags: savedSpot.tags,
            openingTime: savedSpot.openingTime,
            closingTime: savedSpot.closingTime,
            minCost: savedSpot.minCost,
            maxCost: savedSpot.maxCost,
            cost: savedSpot.averageCost,
            lat: savedSpot.latitude,
            lng: savedSpot.longitude,
            crowdLevel: savedSpot.crowdLevel,
            rating: savedSpot.rating,
            img: (savedSpot.images && savedSpot.images.length > 0)
              ? savedSpot.images[0].imageUrl
              : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'
          };

          setSpots(spots.map(s => s.id === editingSpotId ? mappedSpot : s));
          setShowAddSpotModal(false);
          setIsEditMode(false);
          setEditingSpotId(null);

          alert(language === 'vi'
            ? 'Cập nhật địa điểm du lịch thành công vào Neon PostgreSQL!'
            : 'Successfully updated travel spot in Neon PostgreSQL!');
        }
      } else {
        const response = await spotService.createSpot(spotObj);
        if (response && response.success) {
          const savedSpot = response.data;
          const mappedSpot = {
            id: savedSpot.id,
            name: { vi: savedSpot.nameVi, en: savedSpot.nameEn },
            category: savedSpot.category,
            address: savedSpot.address,
            tags: savedSpot.tags,
            openingTime: savedSpot.openingTime,
            closingTime: savedSpot.closingTime,
            minCost: savedSpot.minCost,
            maxCost: savedSpot.maxCost,
            cost: savedSpot.averageCost,
            lat: savedSpot.latitude,
            lng: savedSpot.longitude,
            crowdLevel: savedSpot.crowdLevel,
            rating: savedSpot.rating,
            img: (savedSpot.images && savedSpot.images.length > 0)
              ? savedSpot.images[0].imageUrl
              : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'
          };

          setSpots([mappedSpot, ...spots]);
          setShowAddSpotModal(false);
          setNewSpotNameVi('');
          setNewSpotNameEn('');
          setNewSpotMinCost(0);
          setNewSpotMaxCost(0);
          setNewSpotAddress('');
          setNewSpotTags('');

          alert(language === 'vi'
            ? 'Thêm địa điểm du lịch mới thành công vào Neon PostgreSQL!'
            : 'Successfully registered new local spot in Neon PostgreSQL!');
        }
      }
    } catch (err) {
      console.error("Error saving spot:", err);
      alert(language === 'vi'
        ? (isEditMode ? 'Cập nhật địa điểm du lịch thất bại!' : 'Đăng ký địa điểm du lịch thất bại!')
        : (isEditMode ? 'Failed to update travel spot!' : 'Failed to register travel spot!'));
    }
  };

  // CRUD: Delete Spot
  const handleDeleteSpot = async (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn xoá địa điểm du lịch này khỏi cơ sở dữ liệu Travelist?'
      : 'Are you sure you want to delete this travel spot from Travelist database?')) {
      try {
        const response = await spotService.deleteSpot(id);
        if (response && response.success) {
          setSpots(spots.filter(s => s.id !== id));
          alert(language === 'vi'
            ? 'Đã xóa địa điểm thành công khỏi database!'
            : 'Successfully deleted destination from database!');
        }
      } catch (err) {
        console.error("Error deleting spot:", err);
        alert(language === 'vi'
          ? 'Xoá địa điểm du lịch thất bại!'
          : 'Failed to delete travel spot!');
      }
    }
  };

  // Dishes CRUD Operations
  const handleAddDishClick = () => {
    setIsDishEditMode(false);
    setEditingDishId(null);
    setNewDishName('');
    setNewDishRestaurant('');
    setNewDishAddress('');
    setNewDishLat(15.8771);
    setNewDishLng(108.3267);
    setNewDishMinPrice(0);
    setNewDishMaxPrice(0);
    setNewDishOpeningTime('08:00');
    setNewDishClosingTime('22:00');
    setNewDishImageUrl('');
    setShowAddDishModal(true);
  };

  const handleEditDishClick = (dish) => {
    setIsDishEditMode(true);
    setEditingDishId(dish.id);
    setNewDishName(dish.dishName || '');
    setNewDishRestaurant(dish.restaurantName || '');
    setNewDishAddress(dish.address || '');
    setNewDishLat(dish.latitude || 15.8771);
    setNewDishLng(dish.longitude || 108.3267);
    setNewDishMinPrice(dish.minPrice || 0);
    setNewDishMaxPrice(dish.maxPrice || 0);
    setNewDishOpeningTime(dish.openingTime ? dish.openingTime.substring(0, 5) : '08:00');
    setNewDishClosingTime(dish.closingTime ? dish.closingTime.substring(0, 5) : '22:00');
    setNewDishImageUrl(dish.imageUrl || '');
    setShowAddDishModal(true);
  };

  const handleDishFormSubmit = async (e) => {
    e.preventDefault();
    if (!newDishName || !newDishRestaurant) return;

    if (Number(newDishMinPrice) < 0 || Number(newDishMaxPrice) < 0) {
      alert(language === 'vi' ? 'Giá bán không được là số âm!' : 'Price cannot be negative!');
      return;
    }

    if (Number(newDishMaxPrice) < Number(newDishMinPrice)) {
      alert(language === 'vi' ? 'Giá đến không được nhỏ hơn Giá từ!' : 'Price To cannot be lower than Price From!');
      return;
    }

    const dishObj = {
      dishName: newDishName,
      restaurantName: newDishRestaurant,
      address: newDishAddress,
      latitude: Number(newDishLat),
      longitude: Number(newDishLng),
      minPrice: Number(newDishMinPrice),
      maxPrice: Number(newDishMaxPrice),
      openingTime: newDishOpeningTime ? (newDishOpeningTime.length === 5 ? newDishOpeningTime + ':00' : newDishOpeningTime) : '08:00:00',
      closingTime: newDishClosingTime ? (newDishClosingTime.length === 5 ? newDishClosingTime + ':00' : newDishClosingTime) : '22:00:00',
      imageUrl: newDishImageUrl || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80'
    };

    try {
      if (isDishEditMode && editingDishId) {
        const response = await dishService.updateDish(editingDishId, dishObj);
        if (response && response.success) {
          setDishes(dishes.map(d => d.id === editingDishId ? response.data : d));
          setShowAddDishModal(false);
          setIsDishEditMode(false);
          setEditingDishId(null);
          alert(language === 'vi' ? 'Cập nhật món ăn thành công!' : 'Successfully updated dish!');
        }
      } else {
        const response = await dishService.createDish(dishObj);
        if (response && response.success) {
          setDishes([response.data, ...dishes]);
          setShowAddDishModal(false);
          alert(language === 'vi' ? 'Đăng ký món ăn mới thành công!' : 'Successfully registered new dish!');
        }
      }
    } catch (err) {
      console.error("Error saving dish:", err);
      alert(language === 'vi' ? 'Lưu món ăn thất bại!' : 'Failed to save dish!');
    }
  };

  const handleDeleteDish = async (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn xoá món ăn này khỏi cơ sở dữ liệu?'
      : 'Are you sure you want to delete this dish from the database?')) {
      try {
        const response = await dishService.deleteDish(id);
        if (response && response.success) {
          setDishes(dishes.filter(d => d.id !== id));
          alert(language === 'vi' ? 'Xoá món ăn thành công!' : 'Successfully deleted dish!');
        }
      } catch (err) {
        console.error("Error deleting dish:", err);
        alert(language === 'vi' ? 'Xoá món ăn thất bại!' : 'Failed to delete dish!');
      }
    }
  };

  // Cafes CRUD Operations
  const handleAddCafeClick = () => {
    setIsCafeEditMode(false);
    setEditingCafeId(null);
    setNewCafeName('');
    setNewCafeStyle('');
    setNewCafeAddress('');
    setNewCafeLat(15.8771);
    setNewCafeLng(108.3267);
    setNewCafeMinPrice(0);
    setNewCafeMaxPrice(0);
    setNewCafeOpeningTime('07:00');
    setNewCafeClosingTime('22:00');
    setNewCafeImageUrl('');
    setShowAddCafeModal(true);
  };

  const handleEditCafeClick = (cafe) => {
    setIsCafeEditMode(true);
    setEditingCafeId(cafe.id);
    setNewCafeName(cafe.name || '');
    setNewCafeStyle(cafe.style || '');
    setNewCafeAddress(cafe.address || '');
    setNewCafeLat(cafe.latitude || 15.8771);
    setNewCafeLng(cafe.longitude || 108.3267);
    setNewCafeMinPrice(cafe.minPrice || 0);
    setNewCafeMaxPrice(cafe.maxPrice || 0);
    setNewCafeOpeningTime(cafe.openingTime ? cafe.openingTime.substring(0, 5) : '07:00');
    setNewCafeClosingTime(cafe.closingTime ? cafe.closingTime.substring(0, 5) : '22:00');
    setNewCafeImageUrl(cafe.imageUrl || '');
    setShowAddCafeModal(true);
  };

  const handleCafeFormSubmit = async (e) => {
    e.preventDefault();
    if (!newCafeName) return;

    if (Number(newCafeMinPrice) < 0 || Number(newCafeMaxPrice) < 0) {
      alert(language === 'vi' ? 'Giá bán không được là số âm!' : 'Price cannot be negative!');
      return;
    }

    if (Number(newCafeMaxPrice) < Number(newCafeMinPrice)) {
      alert(language === 'vi' ? 'Giá đến không được nhỏ hơn Giá từ!' : 'Price To cannot be lower than Price From!');
      return;
    }

    const cafeObj = {
      name: newCafeName,
      style: newCafeStyle,
      address: newCafeAddress,
      latitude: Number(newCafeLat),
      longitude: Number(newCafeLng),
      minPrice: Number(newCafeMinPrice),
      maxPrice: Number(newCafeMaxPrice),
      openingTime: newCafeOpeningTime ? (newCafeOpeningTime.length === 5 ? newCafeOpeningTime + ':00' : newCafeOpeningTime) : '07:00:00',
      closingTime: newCafeClosingTime ? (newCafeClosingTime.length === 5 ? newCafeClosingTime + ':00' : newCafeClosingTime) : '22:00:00',
      imageUrl: newCafeImageUrl || 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&q=80'
    };

    try {
      if (isCafeEditMode && editingCafeId) {
        const response = await cafeService.updateCafe(editingCafeId, cafeObj);
        if (response && response.success) {
          setCafes(cafes.map(c => c.id === editingCafeId ? response.data : c));
          setShowAddCafeModal(false);
          setIsCafeEditMode(false);
          setEditingCafeId(null);
          alert(language === 'vi' ? 'Cập nhật quán cà phê thành công!' : 'Successfully updated cafe!');
        }
      } else {
        const response = await cafeService.createCafe(cafeObj);
        if (response && response.success) {
          setCafes([response.data, ...cafes]);
          setShowAddCafeModal(false);
          alert(language === 'vi' ? 'Đăng ký quán cà phê mới thành công!' : 'Successfully registered new cafe!');
        }
      }
    } catch (err) {
      console.error("Error saving cafe:", err);
      alert(language === 'vi' ? 'Lưu quán cà phê thất bại!' : 'Failed to save cafe!');
    }
  };

  const handleDeleteCafe = async (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn xoá quán cà phê này khỏi cơ sở dữ liệu?'
      : 'Are you sure you want to delete this cafe from the database?')) {
      try {
        const response = await cafeService.deleteCafe(id);
        if (response && response.success) {
          setCafes(cafes.filter(c => c.id !== id));
          alert(language === 'vi' ? 'Xoá quán cà phê thành công!' : 'Successfully deleted cafe!');
        }
      } catch (err) {
        console.error("Error deleting cafe:", err);
        alert(language === 'vi' ? 'Xoá quán cà phê thất bại!' : 'Failed to delete cafe!');
      }
    }
  };

  // Stays CRUD Operations
  const handleAddStayClick = () => {
    setIsStayEditMode(false);
    setEditingStayId(null);
    setNewStayType('Hotel');
    setNewStayName('');
    setNewStayAddress('');
    setNewStayLat(15.8771);
    setNewStayLng(108.3267);
    setNewStayCapacity('');
    setNewStayMinPrice(0);
    setNewStayMaxPrice(0);
    setNewStayNotes('');
    setNewStayImageUrl('');
    setShowAddStayModal(true);
  };

  const handleEditStayClick = (stay) => {
    setIsStayEditMode(true);
    setEditingStayId(stay.id);
    setNewStayType(stay.type || 'Hotel');
    setNewStayName(stay.name || '');
    setNewStayAddress(stay.address || '');
    setNewStayLat(stay.latitude || 15.8771);
    setNewStayLng(stay.longitude || 108.3267);
    setNewStayCapacity(stay.capacity || '');
    setNewStayMinPrice(stay.minPrice || 0);
    setNewStayMaxPrice(stay.maxPrice || 0);
    setNewStayNotes(stay.notes || '');
    setNewStayImageUrl(stay.imageUrl || '');
    setShowAddStayModal(true);
  };

  const handleStayFormSubmit = async (e) => {
    e.preventDefault();
    if (!newStayName) return;

    if (Number(newStayMinPrice) < 0 || Number(newStayMaxPrice) < 0) {
      alert(language === 'vi' ? 'Giá bán không được là số âm!' : 'Price cannot be negative!');
      return;
    }

    if (Number(newStayMaxPrice) < Number(newStayMinPrice)) {
      alert(language === 'vi' ? 'Giá đến không được nhỏ hơn Giá từ!' : 'Price To cannot be lower than Price From!');
      return;
    }

    const stayObj = {
      type: newStayType,
      name: newStayName,
      address: newStayAddress,
      latitude: Number(newStayLat),
      longitude: Number(newStayLng),
      capacity: newStayCapacity,
      minPrice: Number(newStayMinPrice),
      maxPrice: Number(newStayMaxPrice),
      notes: newStayNotes,
      imageUrl: newStayImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80'
    };

    try {
      if (isStayEditMode && editingStayId) {
        const response = await stayService.updateStay(editingStayId, stayObj);
        if (response && response.success) {
          setStays(stays.map(s => s.id === editingStayId ? response.data : s));
          setShowAddStayModal(false);
          setIsStayEditMode(false);
          setEditingStayId(null);
          alert(language === 'vi' ? 'Cập nhật chỗ ở thành công!' : 'Successfully updated stay!');
        }
      } else {
        const response = await stayService.createStay(stayObj);
        if (response && response.success) {
          setStays([response.data, ...stays]);
          setShowAddStayModal(false);
          alert(language === 'vi' ? 'Đăng ký chỗ ở mới thành công!' : 'Successfully registered new stay!');
        }
      }
    } catch (err) {
      console.error("Error saving stay:", err);
      alert(language === 'vi' ? 'Lưu chỗ ở thất bại!' : 'Failed to save stay!');
    }
  };

  const handleDeleteStay = async (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn xoá chỗ ở này khỏi cơ sở dữ liệu?'
      : 'Are you sure you want to delete this stay from the database?')) {
      try {
        const response = await stayService.deleteStay(id);
        if (response && response.success) {
          setStays(stays.filter(s => s.id !== id));
          alert(language === 'vi' ? 'Xoá chỗ ở thành công!' : 'Successfully deleted stay!');
        }
      } catch (err) {
        console.error("Error deleting stay:", err);
        alert(language === 'vi' ? 'Xoá chỗ ở thất bại!' : 'Failed to delete stay!');
      }
    }
  };

  // Entertainments CRUD Operations
  const handleAddEntertainmentClick = () => {
    setIsEntertainmentEditMode(false);
    setEditingEntertainmentId(null);
    setNewEntertainmentType('Biển');
    setNewEntertainmentInterests('');
    setNewEntertainmentName('');
    setNewEntertainmentAddress('');
    setNewEntertainmentLat(15.8771);
    setNewEntertainmentLng(108.3267);
    setNewEntertainmentMinPrice(0);
    setNewEntertainmentMaxPrice(0);
    setNewEntertainmentImageUrl('');
    setNewEntertainmentOpeningTime('08:00');
    setNewEntertainmentClosingTime('21:00');
    setShowAddEntertainmentModal(true);
  };

  const handleEditEntertainmentClick = (ent) => {
    setIsEntertainmentEditMode(true);
    setEditingEntertainmentId(ent.id);
    setNewEntertainmentType(ent.type || 'Biển');
    setNewEntertainmentInterests(ent.interests || '');
    setNewEntertainmentName(ent.name || '');
    setNewEntertainmentAddress(ent.address || '');
    setNewEntertainmentLat(ent.latitude || 15.8771);
    setNewEntertainmentLng(ent.longitude || 108.3267);
    setNewEntertainmentMinPrice(ent.minPrice || 0);
    setNewEntertainmentMaxPrice(ent.maxPrice || 0);
    setNewEntertainmentImageUrl(ent.imageUrl || '');
    setNewEntertainmentOpeningTime(ent.openingTime ? String(ent.openingTime).substring(0, 5) : '08:00');
    setNewEntertainmentClosingTime(ent.closingTime ? String(ent.closingTime).substring(0, 5) : '21:00');
    setShowAddEntertainmentModal(true);
  };

  const formatTime = (value) => {
    if (!value) return '—';
    const v = String(value);
    return v.length >= 5 ? v.substring(0, 5) : v;
  };


  const handleEntertainmentFormSubmit = async (e) => {
    e.preventDefault();
    if (!newEntertainmentName) return;

    if (Number(newEntertainmentMinPrice) < 0 || Number(newEntertainmentMaxPrice) < 0) {
      alert(language === 'vi' ? 'Giá bán không được là số âm!' : 'Price cannot be negative!');
      return;
    }

    if (Number(newEntertainmentMaxPrice) < Number(newEntertainmentMinPrice)) {
      alert(language === 'vi' ? 'Giá đến không được nhỏ hơn Giá từ!' : 'Price To cannot be lower than Price From!');
      return;
    }

    const entObj = {
      type: newEntertainmentType,
      interests: newEntertainmentInterests,
      name: newEntertainmentName,
      address: newEntertainmentAddress,
      latitude: Number(newEntertainmentLat),
      longitude: Number(newEntertainmentLng),
      minPrice: Number(newEntertainmentMinPrice),
      maxPrice: Number(newEntertainmentMaxPrice),
      imageUrl: newEntertainmentImageUrl || 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=500&q=80'
    };

    try {
      if (isEntertainmentEditMode && editingEntertainmentId) {
        const response = await entertainmentService.updateEntertainment(editingEntertainmentId, entObj);
        if (response && response.success) {
          setEntertainments(entertainments.map(e => e.id === editingEntertainmentId ? response.data : e));
          setShowAddEntertainmentModal(false);
          setIsEntertainmentEditMode(false);
          setEditingEntertainmentId(null);
          alert(language === 'vi' ? 'Cập nhật khu vui chơi thành công!' : 'Successfully updated entertainment!');
        }
      } else {
        const response = await entertainmentService.createEntertainment(entObj);
        if (response && response.success) {
          setEntertainments([response.data, ...entertainments]);
          setShowAddEntertainmentModal(false);
          alert(language === 'vi' ? 'Đăng ký khu vui chơi mới thành công!' : 'Successfully registered new entertainment!');
        }
      }
    } catch (err) {
      console.error("Error saving entertainment:", err);
      alert(language === 'vi' ? 'Lưu khu vui chơi thất bại!' : 'Failed to save entertainment!');
    }
  };

  const handleDeleteEntertainment = async (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn xoá khu vui chơi này khỏi cơ sở dữ liệu?'
      : 'Are you sure you want to delete this entertainment spot from the database?')) {
      try {
        const response = await entertainmentService.deleteEntertainment(id);
        if (response && response.success) {
          setEntertainments(entertainments.filter(e => e.id !== id));
          alert(language === 'vi' ? 'Xoá khu vui chơi thành công!' : 'Successfully deleted entertainment!');
        }
      } catch (err) {
        console.error("Error deleting entertainment:", err);
        alert(language === 'vi' ? 'Xoá khu vui chơi thất bại!' : 'Failed to delete entertainment!');
      }
    }
  };

  // Rentals CRUD Operations
  const handleAddRentalClick = () => {
    setIsRentalEditMode(false);
    setEditingRentalId(null);
    setNewRentalType('Thuê máy ảnh');
    setNewRentalName('');
    setNewRentalAddress('');
    setNewRentalLat(15.8771);
    setNewRentalLng(108.3267);
    setNewRentalMinPrice(0);
    setNewRentalMaxPrice(0);
    setNewRentalOpeningTime('08:00');
    setNewRentalClosingTime('21:00');
    setNewRentalImageUrl('');
    setShowAddRentalModal(true);
  };

  const handleEditRentalClick = (rental) => {
    setIsRentalEditMode(true);
    setEditingRentalId(rental.id);
    setNewRentalType(rental.type || 'Thuê máy ảnh');
    setNewRentalName(rental.name || '');
    setNewRentalAddress(rental.address || '');
    setNewRentalLat(rental.latitude || 15.8771);
    setNewRentalLng(rental.longitude || 108.3267);
    setNewRentalMinPrice(rental.minPrice || 0);
    setNewRentalMaxPrice(rental.maxPrice || 0);
    setNewRentalOpeningTime(rental.openingTime?.substring(0, 5) || '08:00');
    setNewRentalClosingTime(rental.closingTime?.substring(0, 5) || '21:00');
    setNewRentalImageUrl(rental.imageUrl || '');
    setShowAddRentalModal(true);
  };

  const handleRentalFormSubmit = async (e) => {
    e.preventDefault();
    if (!newRentalName) return;

    if (Number(newRentalMinPrice) < 0 || Number(newRentalMaxPrice) < 0) {
      alert(language === 'vi' ? 'Giá bán không được là số âm!' : 'Price cannot be negative!');
      return;
    }

    if (Number(newRentalMaxPrice) < Number(newRentalMinPrice)) {
      alert(language === 'vi' ? 'Giá đến không được nhỏ hơn Giá từ!' : 'Price To cannot be lower than Price From!');
      return;
    }

    const rentalObj = {
      type: newRentalType,
      name: newRentalName,
      address: newRentalAddress,
      latitude: Number(newRentalLat),
      longitude: Number(newRentalLng),
      minPrice: Number(newRentalMinPrice),
      maxPrice: Number(newRentalMaxPrice),
      openingTime: newRentalOpeningTime ? `${newRentalOpeningTime}:00` : '08:00:00',
      closingTime: newRentalClosingTime ? `${newRentalClosingTime}:00` : '21:00:00',
      imageUrl: newRentalImageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80'
    };

    try {
      if (isRentalEditMode && editingRentalId) {
        const response = await rentalService.updateRental(editingRentalId, rentalObj);
        if (response && response.success) {
          setRentals(rentals.map(r => r.id === editingRentalId ? response.data : r));
          setShowAddRentalModal(false);
          setIsRentalEditMode(false);
          setEditingRentalId(null);
          alert(language === 'vi' ? 'Cập nhật dịch vụ cho thuê thành công!' : 'Successfully updated rental!');
        }
      } else {
        const response = await rentalService.createRental(rentalObj);
        if (response && response.success) {
          setRentals([response.data, ...rentals]);
          setShowAddRentalModal(false);
          alert(language === 'vi' ? 'Đăng ký dịch vụ cho thuê mới thành công!' : 'Successfully registered new rental!');
        }
      }
    } catch (err) {
      console.error("Error saving rental:", err);
      alert(language === 'vi' ? 'Lưu dịch vụ cho thuê thất bại!' : 'Failed to save rental!');
    }
  };

  const handleDeleteRental = async (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn xoá dịch vụ cho thuê này khỏi cơ sở dữ liệu?'
      : 'Are you sure you want to delete this rental service from the database?')) {
      try {
        const response = await rentalService.deleteRental(id);
        if (response && response.success) {
          setRentals(rentals.filter(r => r.id !== id));
          alert(language === 'vi' ? 'Xoá dịch vụ cho thuê thành công!' : 'Successfully deleted rental!');
        }
      } catch (err) {
        console.error("Error deleting rental:", err);
        alert(language === 'vi' ? 'Xoá dịch vụ cho thuê thất bại!' : 'Failed to delete rental!');
      }
    }
  };



  const getCategoryLabel = (cat) => {
    const cleanCat = cat?.toLowerCase();
    if (language === 'vi') {
      if (cleanCat === 'healing') return '🧘 Chữa lành';
      if (cleanCat === 'food') return '🍗 Ẩm thực';
      if (cleanCat === 'adventure') return '🏮 Trải nghiệm';
      if (cleanCat === 'scenic') return '📸 Phong cảnh';
      if (cleanCat === 'sightseeing') return '🏛️ Tham quan';
      if (cleanCat === 'cafe') return '☕ Cà phê';
      if (cleanCat === 'stay') return '🏨 Nghỉ dưỡng';
      return cat;
    } else {
      if (cleanCat === 'healing') return '🧘 Healing';
      if (cleanCat === 'food') return '🍗 Food & Taste';
      if (cleanCat === 'adventure') return '🏮 Adventure';
      if (cleanCat === 'scenic') return '📸 Scenic';
      if (cleanCat === 'sightseeing') return '🏛️ Sightseeing';
      if (cleanCat === 'cafe') return '☕ Cafe';
      if (cleanCat === 'stay') return '🏨 Stay';
      return cat;
    }
  };

  const getCrowdLevelLabel = (level) => {
    const cleanLevel = level?.toLowerCase();
    if (language === 'vi') {
      if (cleanLevel === 'low') return 'Thấp';
      if (cleanLevel === 'medium') return 'Vừa';
      if (cleanLevel === 'high') return 'Cao';
      return level;
    } else {
      if (cleanLevel === 'low') return 'Low';
      if (cleanLevel === 'medium') return 'Medium';
      if (cleanLevel === 'high') return 'High';
      return level;
    }
  };

  // CRUD: Delete Diary Post (Moderation)
  const handleDeleteDiary = (id) => {
    if (window.confirm(language === 'vi'
      ? 'Bạn có chắc chắn muốn gỡ bỏ bài viết nhật ký này khỏi Bảng tin cộng đồng?'
      : 'Are you sure you want to remove this diary post from the community feed?')) {
      setDiaries(diaries.filter(d => d.id !== id));
      alert(language === 'vi' ? 'Đã gỡ bài viết thành công!' : 'Successfully removed post!');
    }
  };

  // CRUD: Toggle Expert Online Status
  const handleToggleExpertOnline = (id) => {
    setExperts(experts.map(exp => {
      if (exp.id === id) {
        return { ...exp, online: !exp.online };
      }
      return exp;
    }));
  };

  // CRUD: Reply to Inquiry
  const handleSendInquiryReply = (inqId) => {
    if (!replyText.trim()) return;

    setInquiries(inquiries.map(inq => {
      if (inq.id === inqId) {
        return {
          ...inq,
          replied: true,
          replyContent: replyText
        };
      }
      return inq;
    }));

    setReplyText('');
    setActiveInquiryId(null);
    alert(language === 'vi'
      ? 'Gửi phản hồi tư vấn thành công tới Du khách!'
      : 'Successfully sent consulting reply to traveler!');
  };

  // Filter spots based on search query and selected category
  const filteredSpots = spots.filter(spot => {
    const matchesSearch = 
      (spot.name?.vi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (spot.name?.en || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      (spot.category || '').toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Pagination Calculations
  const indexOfLastSpot = currentPage * itemsPerPage;
  const indexOfFirstSpot = indexOfLastSpot - itemsPerPage;
  const currentSpots = filteredSpots.slice(indexOfFirstSpot, indexOfLastSpot);
  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);

  // Dishes Pagination Calculations
  const filteredDishes = dishes.filter(d =>
    (d.dishName || '').toLowerCase().includes(dishSearchTerm.toLowerCase()) ||
    (d.restaurantName || '').toLowerCase().includes(dishSearchTerm.toLowerCase())
  );
  const indexOfLastDish = currentDishPage * itemsPerPage;
  const indexOfFirstDish = indexOfLastDish - itemsPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstDish, indexOfLastDish);
  const totalDishPages = Math.ceil(filteredDishes.length / itemsPerPage);

  // Cafes Pagination Calculations
  const filteredCafes = cafes.filter(c =>
    (c.name || '').toLowerCase().includes(cafeSearchTerm.toLowerCase()) ||
    (c.style || '').toLowerCase().includes(cafeSearchTerm.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(cafeSearchTerm.toLowerCase())
  );
  const indexOfLastCafe = currentCafePage * itemsPerPage;
  const indexOfFirstCafe = indexOfLastCafe - itemsPerPage;
  const currentCafes = filteredCafes.slice(indexOfFirstCafe, indexOfLastCafe);
  const totalCafePages = Math.ceil(filteredCafes.length / itemsPerPage);

  // Stays Pagination Calculations
  const filteredStays = stays.filter(s =>
    (s.name || '').toLowerCase().includes(staySearchTerm.toLowerCase()) ||
    (s.type || '').toLowerCase().includes(staySearchTerm.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(staySearchTerm.toLowerCase()) ||
    (s.notes || '').toLowerCase().includes(staySearchTerm.toLowerCase())
  );
  const indexOfLastStay = currentStayPage * itemsPerPage;
  const indexOfFirstStay = indexOfLastStay - itemsPerPage;
  const currentStays = filteredStays.slice(indexOfFirstStay, indexOfLastStay);
  const totalStayPages = Math.ceil(filteredStays.length / itemsPerPage);

  // Entertainments Pagination Calculations
  const filteredEntertainments = entertainments.filter(e =>
    (e.name || '').toLowerCase().includes(entertainmentSearchTerm.toLowerCase()) ||
    (e.type || '').toLowerCase().includes(entertainmentSearchTerm.toLowerCase()) ||
    (e.address || '').toLowerCase().includes(entertainmentSearchTerm.toLowerCase()) ||
    (e.interests || '').toLowerCase().includes(entertainmentSearchTerm.toLowerCase())
  );
  const indexOfLastEntertainment = currentEntertainmentPage * itemsPerPage;
  const indexOfFirstEntertainment = indexOfLastEntertainment - itemsPerPage;
  const currentEntertainments = filteredEntertainments.slice(indexOfFirstEntertainment, indexOfLastEntertainment);
  const totalEntertainmentPages = Math.ceil(filteredEntertainments.length / itemsPerPage);

  // Rentals Pagination Calculations
  const filteredRentals = rentals.filter(r =>
    (r.name || '').toLowerCase().includes(rentalSearchTerm.toLowerCase()) ||
    (r.type || '').toLowerCase().includes(rentalSearchTerm.toLowerCase()) ||
    (r.address || '').toLowerCase().includes(rentalSearchTerm.toLowerCase())
  );
  const indexOfLastRental = currentRentalPage * itemsPerPage;
  const indexOfFirstRental = indexOfLastRental - itemsPerPage;
  const currentRentals = filteredRentals.slice(indexOfFirstRental, indexOfLastRental);
  const totalRentalPages = Math.ceil(filteredRentals.length / itemsPerPage);



  return (
    <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 py-8 animate-fade-in heritage-pattern min-h-screen">

      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-heritage-amber mb-2">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest">
              {language === 'vi' ? 'Hệ thống Quản trị Travelist' : 'Travelist Administration System'}
            </span>
          </div>
          <h1 className="font-outfit text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            {language === 'vi' ? 'Dashboard Điều Hành' : 'Operations Dashboard'}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {language === 'vi'
              ? 'Bảng điều khiển quản lý và kiểm duyệt dữ liệu du lịch Hội An thông qua database Neon PostgreSQL.'
              : 'Control panel for managing and moderating Hoi An travel data via Neon PostgreSQL database.'}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white border border-gray-200 hover:border-heritage-amber hover:text-heritage-amber rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          {language === 'vi' ? 'Đồng bộ Dữ liệu' : 'Sync Data'}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: language === 'vi' ? 'Tổng Địa Điểm' : 'Total Spots', value: spots.length, icon: MapPin, color: 'text-amber-500 bg-amber-50 border-amber-200' },
          { label: language === 'vi' ? 'Nhật Ký Đăng Tải' : 'Diaries Published', value: diaries.length, icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: language === 'vi' ? 'Chuyên Gia Bản Địa' : 'Local Experts', value: experts.length, icon: Award, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { label: language === 'vi' ? 'Yêu Cầu Tư Vấn' : 'Inquiry Requests', value: inquiries.length, icon: UserCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold block uppercase tracking-wide">{card.label}</span>
                <span className="font-outfit text-2xl font-extrabold text-gray-900 stat-number">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto pb-0.5 gap-2">
        {[
          { id: 'dishes', label: language === 'vi' ? 'Quản lý Món ăn' : 'Manage Dishes' },
          { id: 'cafes', label: language === 'vi' ? 'Quản lý Cà phê' : 'Manage Cafes' },
          { id: 'stays', label: language === 'vi' ? 'Quản lý Chỗ ở' : 'Manage Stays' },
          { id: 'entertainments', label: language === 'vi' ? 'Quản lý Khu vui chơi' : 'Manage Entertainments' },
          { id: 'rentals', label: language === 'vi' ? 'Quản lý Cho thuê' : 'Manage Rentals' },
          { id: 'diaries', label: language === 'vi' ? 'Kiểm duyệt Nhật ký' : 'Moderate Diaries' },


          { id: 'experts', label: language === 'vi' ? 'Hội đồng Chuyên gia' : 'Expert Council' },
          { id: 'inquiries', label: language === 'vi' ? 'Hòm thư Tư vấn' : 'Consulting Inbox' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id); setCurrentPage(1); }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm border-none cursor-pointer transition-all flex-shrink-0 ${activeSubTab === tab.id
                ? 'bg-heritage-amber text-white shadow-md shadow-heritage-amber/15'
                : 'text-gray-500 hover:text-gray-800 bg-transparent hover:bg-gray-100/50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading overlay */}
      {loading ? (
        <div className="bg-white border border-gray-150 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-4 border-heritage-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500">
            {language === 'vi' ? 'Đang truy vấn dữ liệu từ database Neon...' : 'Querying data from Neon database...'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm animate-scale-up">


          {/* TAB: Dishes Manager */}
          {activeSubTab === 'dishes' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Quản lý Món ăn đặc sản' : 'Specialty Dishes Directory'}
                </h3>
                <button
                  onClick={handleAddDishClick}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng ký Món ăn mới' : 'Register New Dish'}
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={dishSearchTerm}
                    onChange={(e) => { setDishSearchTerm(e.target.value); setCurrentDishPage(1); }}
                    placeholder={language === 'vi' ? '🔍 Tìm món ăn hoặc quán...' : '🔍 Search dish or restaurant...'}
                    className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
                  />
                </div>
                <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  {language === 'vi' ? `Tìm thấy: ${filteredDishes.length} / ${dishes.length} món ăn` : `Found: ${filteredDishes.length} / ${dishes.length} dishes`}
                </div>
              </div>

              {filteredDishes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <span className="text-3xl block mb-2">🍗</span>
                  <p className="text-gray-500 font-bold text-xs">
                    {language === 'vi' ? 'Không có dữ liệu món ăn nào phù hợp!' : 'No matching dish data available!'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                          <th className="p-4">{language === 'vi' ? 'Tên món ăn' : 'Dish Name'}</th>
                          <th className="p-4">{language === 'vi' ? 'Tên quán ăn' : 'Restaurant Name'}</th>
                          <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                          <th className="p-4">{language === 'vi' ? 'Khoảng giá' : 'Price Range'}</th>
                          <th className="p-4">{language === 'vi' ? 'Giờ hoạt động' : 'Hours'}</th>
                          <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {currentDishes.map((dish) => (
                          <tr key={dish.id} className="hover:bg-gray-50/55 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <img src={dish.imageUrl} alt={dish.dishName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              <span className="font-bold text-gray-900 text-sm">{dish.dishName}</span>
                            </td>
                            <td className="p-4 font-bold text-gray-700">{dish.restaurantName}</td>
                            <td className="p-4 text-gray-500 truncate max-w-xs" title={dish.address}>{dish.address}</td>
                            <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                              {dish.minPrice > 0 || dish.maxPrice > 0 ? (
                                `${dish.minPrice.toLocaleString()}đ - ${dish.maxPrice.toLocaleString()}đ`
                              ) : (language === 'vi' ? 'Miễn phí' : 'Free')}
                            </td>
                            <td className="p-4 text-gray-400 whitespace-nowrap">
                              🕒 {dish.openingTime?.substring(0, 5) || '08:00'} - {dish.closingTime?.substring(0, 5) || '22:00'}
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleEditDishClick(dish)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                                title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDish(dish.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                                title={language === 'vi' ? 'Xoá' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {totalDishPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                      <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                        {language === 'vi'
                          ? `Hiển thị món ${indexOfFirstDish + 1} - ${Math.min(indexOfLastDish, filteredDishes.length)} trong tổng số ${filteredDishes.length} món`
                          : `Showing ${indexOfFirstDish + 1} - ${Math.min(indexOfLastDish, filteredDishes.length)} of ${filteredDishes.length} dishes`}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => setCurrentDishPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentDishPage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Trước' : 'Prev'}
                        </button>
                        {Array.from({ length: totalDishPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentDishPage(p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                              currentDishPage === p
                                ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentDishPage(prev => Math.min(prev + 1, totalDishPages))}
                          disabled={currentDishPage === totalDishPages}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Sau' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Cafes Manager */}
          {activeSubTab === 'cafes' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Quản lý Cà phê Hội An' : 'Hoi An Cafes Directory'}
                </h3>
                <button
                  type="button"
                  onClick={handleAddCafeClick}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng ký Quán mới' : 'Register New Cafe'}
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={cafeSearchTerm}
                    onChange={(e) => { setCafeSearchTerm(e.target.value); setCurrentCafePage(1); }}
                    placeholder={language === 'vi' ? '🔍 Tìm quán cà phê, phong cách...' : '🔍 Search cafe by name, style...'}
                    className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
                  />
                </div>
                <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  {language === 'vi' ? `Tìm thấy: ${filteredCafes.length} / ${cafes.length} quán` : `Found: ${filteredCafes.length} / ${cafes.length} cafes`}
                </div>
              </div>

              {filteredCafes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <span className="text-3xl block mb-2">☕</span>
                  <p className="text-gray-500 font-bold text-xs">
                    {language === 'vi' ? 'Không có quán cà phê nào phù hợp!' : 'No matching cafe data available!'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                          <th className="p-4">{language === 'vi' ? 'Tên quán' : 'Cafe Name'}</th>
                          <th className="p-4">{language === 'vi' ? 'Phong cách' : 'Style'}</th>
                          <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                          <th className="p-4">{language === 'vi' ? 'Khoảng giá' : 'Price Range'}</th>
                          <th className="p-4">{language === 'vi' ? 'Giờ hoạt động' : 'Hours'}</th>
                          <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {currentCafes.map((cafe) => (
                          <tr key={cafe.id} className="hover:bg-gray-50/55 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <img src={cafe.imageUrl} alt={cafe.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              <span className="font-bold text-gray-900 text-sm">{cafe.name}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-amber-50 text-heritage-amber rounded-lg font-bold text-[10px] border border-amber-100">
                                {cafe.style || '—'}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 truncate max-w-xs" title={cafe.address}>{cafe.address}</td>
                            <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                              {cafe.minPrice > 0 || cafe.maxPrice > 0 ? (
                                `${cafe.minPrice.toLocaleString()}đ - ${cafe.maxPrice.toLocaleString()}đ`
                              ) : (language === 'vi' ? 'Liên hệ' : 'Contact')}
                            </td>
                            <td className="p-4 text-gray-400 whitespace-nowrap">
                              🕒 {cafe.openingTime?.substring(0, 5) || '07:00'} - {cafe.closingTime?.substring(0, 5) || '22:00'}
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleEditCafeClick(cafe)} // Edit
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                                title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCafe(cafe.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                                title={language === 'vi' ? 'Xoá' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {totalCafePages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                      <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                        {language === 'vi'
                          ? `Hiển thị quán ${indexOfFirstCafe + 1} - ${Math.min(indexOfLastCafe, filteredCafes.length)} trong tổng số ${filteredCafes.length} quán`
                          : `Showing ${indexOfFirstCafe + 1} - ${Math.min(indexOfLastCafe, filteredCafes.length)} of ${filteredCafes.length} cafes`}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => setCurrentCafePage(prev => Math.max(prev - 1, 1))}
                          disabled={currentCafePage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Trước' : 'Prev'}
                        </button>
                        {Array.from({ length: totalCafePages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentCafePage(p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                              currentCafePage === p
                                ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentCafePage(prev => Math.min(prev + 1, totalCafePages))}
                          disabled={currentCafePage === totalCafePages}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Sau' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Stays Manager */}
          {activeSubTab === 'stays' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Quản lý Chỗ ở Hội An' : 'Hoi An Accommodations Directory'}
                </h3>
                <button
                  type="button"
                  onClick={handleAddStayClick}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng ký Chỗ ở mới' : 'Register New Accommodation'}
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={staySearchTerm}
                    onChange={(e) => { setStaySearchTerm(e.target.value); setCurrentStayPage(1); }}
                    placeholder={language === 'vi' ? '🔍 Tìm chỗ ở theo tên, loại...' : '🔍 Search stays by name, type...'}
                    className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
                  />
                </div>
                <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  {language === 'vi' ? `Tìm thấy: ${filteredStays.length} / ${stays.length} căn` : `Found: ${filteredStays.length} / ${stays.length} stays`}
                </div>
              </div>

              {filteredStays.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <span className="text-3xl block mb-2">🏨</span>
                  <p className="text-gray-500 font-bold text-xs">
                    {language === 'vi' ? 'Không có chỗ ở nào phù hợp!' : 'No matching stays data available!'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                          <th className="p-4">{language === 'vi' ? 'Tên chỗ ở' : 'Accommodation Name'}</th>
                          <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Type'}</th>
                          <th className="p-4">{language === 'vi' ? 'Sức chứa' : 'Capacity'}</th>
                          <th className="p-4">{language === 'vi' ? 'Giá tham khảo' : 'Price Range'}</th>
                          <th className="p-4">{language === 'vi' ? 'Địa chỉ & Ghi chú' : 'Address & Notes'}</th>
                          <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {currentStays.map((stay) => (
                          <tr key={stay.id} className="hover:bg-gray-50/55 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <img src={stay.imageUrl} alt={stay.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                              <span className="font-bold text-gray-900 text-sm">{stay.name}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                                stay.type === 'Hotel' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                stay.type === 'Villa' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                {stay.type}
                              </span>
                            </td>
                            <td className="p-4 text-gray-700 font-semibold">{stay.capacity || '—'}</td>
                            <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                              {stay.minPrice > 0 || stay.maxPrice > 0 ? (
                                `${stay.minPrice.toLocaleString()}đ - ${stay.maxPrice.toLocaleString()}đ`
                              ) : (language === 'vi' ? 'Liên hệ' : 'Contact')}
                            </td>
                            <td className="p-4 text-gray-500 max-w-xs">
                              <div className="truncate font-semibold text-gray-700 mb-0.5" title={stay.address}>{stay.address}</div>
                              <div className="truncate text-[10px] text-gray-400 font-medium" title={stay.notes}>{stay.notes}</div>
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleEditStayClick(stay)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                                title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStay(stay.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                                title={language === 'vi' ? 'Xoá' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {totalStayPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                      <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                        {language === 'vi'
                          ? `Hiển thị căn ${indexOfFirstStay + 1} - ${Math.min(indexOfLastStay, filteredStays.length)} trong tổng số ${filteredStays.length} căn`
                          : `Showing ${indexOfFirstStay + 1} - ${Math.min(indexOfLastStay, filteredStays.length)} of ${filteredStays.length} stays`}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => setCurrentStayPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentStayPage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Trước' : 'Prev'}
                        </button>
                        {Array.from({ length: totalStayPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentStayPage(p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                              currentStayPage === p
                                ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentStayPage(prev => Math.min(prev + 1, totalStayPages))}
                          disabled={currentStayPage === totalStayPages}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Sau' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Entertainments Manager */}
          {activeSubTab === 'entertainments' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Quản lý Khu vui chơi Hội An' : 'Hoi An Entertainments Directory'}
                </h3>
                <button
                  type="button"
                  onClick={handleAddEntertainmentClick}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng ký Khu vui chơi mới' : 'Register New Entertainment'}
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={entertainmentSearchTerm}
                    onChange={(e) => { setEntertainmentSearchTerm(e.target.value); setCurrentEntertainmentPage(1); }}
                    placeholder={language === 'vi' ? '🔍 Tìm kiếm khu vui chơi...' : '🔍 Search entertainments...'}
                    className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
                  />
                </div>
                <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  {language === 'vi' ? `Tìm thấy: ${filteredEntertainments.length} / ${entertainments.length} địa điểm` : `Found: ${filteredEntertainments.length} / ${entertainments.length} spots`}
                </div>
              </div>

              {filteredEntertainments.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <span className="text-3xl block mb-2">🎡</span>
                  <p className="text-gray-500 font-bold text-xs">
                    {language === 'vi' ? 'Không có khu vui chơi nào phù hợp!' : 'No matching entertainment data available!'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                        <th className="p-4">{language === 'vi' ? 'Tên khu vui chơi' : 'Name'}</th>
                        <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Type'}</th>
                        <th className="p-4">{language === 'vi' ? 'Sở thích' : 'Interests'}</th>
                        <th className="p-4">{language === 'vi' ? 'Giờ hoạt động' : 'Hours'}</th>
                        <th className="p-4">{language === 'vi' ? 'Giá vé' : 'Price Range'}</th>
                        <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                        <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                      {currentEntertainments.map((ent) => (
                        <tr key={ent.id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={ent.imageUrl} alt={ent.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                            <span className="font-bold text-gray-900 text-sm">{ent.name}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                              ent.type === 'Biển' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                ent.type === 'Vui chơi' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                  'bg-teal-50 text-teal-600 border-teal-100'
                            }`}>
                              {ent.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(ent.interests || '').split(',').map((interest, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  {interest.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-gray-500 whitespace-nowrap font-semibold">
                            🕒 {formatTime(ent.openingTime)} - {formatTime(ent.closingTime)}
                          </td>
                          <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                            {ent.minPrice > 0 || ent.maxPrice > 0 ? (
                              `${ent.minPrice.toLocaleString()}đ - ${ent.maxPrice.toLocaleString()}đ`
                            ) : (language === 'vi' ? 'Miễn phí / Liên hệ' : 'Free / Contact')}
                          </td>
                          <td className="p-4 text-gray-500 max-w-xs truncate font-semibold" title={ent.address}>
                            {ent.address}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleEditEntertainmentClick(ent)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                              title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntertainment(ent.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                              title={language === 'vi' ? 'Xoá' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {totalEntertainmentPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                      <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                        {language === 'vi'
                          ? `Hiển thị địa điểm ${indexOfFirstEntertainment + 1} - ${Math.min(indexOfLastEntertainment, filteredEntertainments.length)} trong tổng số ${filteredEntertainments.length} địa điểm`
                          : `Showing ${indexOfFirstEntertainment + 1} - ${Math.min(indexOfLastEntertainment, filteredEntertainments.length)} of ${filteredEntertainments.length} spots`}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => setCurrentEntertainmentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentEntertainmentPage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Trước' : 'Prev'}
                        </button>
                        {Array.from({ length: totalEntertainmentPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentEntertainmentPage(p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                              currentEntertainmentPage === p
                                ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentEntertainmentPage(prev => Math.min(prev + 1, totalEntertainmentPages))}
                          disabled={currentEntertainmentPage === totalEntertainmentPages}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Sau' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Rentals Manager */}
          {activeSubTab === 'rentals' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Quản lý Dịch vụ cho thuê Hội An' : 'Hoi An Rental Services Directory'}
                </h3>
                <button
                  type="button"
                  onClick={handleAddRentalClick}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng ký Dịch vụ cho thuê mới' : 'Register New Rental Service'}
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-inner">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={rentalSearchTerm}
                    onChange={(e) => { setRentalSearchTerm(e.target.value); setCurrentRentalPage(1); }}
                    placeholder={language === 'vi' ? '🔍 Tìm dịch vụ cho thuê...' : '🔍 Search rentals...'}
                    className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-xs font-semibold rounded-xl transition-all"
                  />
                </div>
                <div className="text-[11px] font-extrabold uppercase text-gray-400 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  {language === 'vi' ? `Tìm thấy: ${filteredRentals.length} / ${rentals.length} dịch vụ` : `Found: ${filteredRentals.length} / ${rentals.length} rentals`}
                </div>
              </div>

              {filteredRentals.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <span className="text-3xl block mb-2">🛵</span>
                  <p className="text-gray-500 font-bold text-xs">
                    {language === 'vi' ? 'Không có dịch vụ nào phù hợp!' : 'No matching rentals available!'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                        <th className="p-4">{language === 'vi' ? 'Tên dịch vụ' : 'Name'}</th>
                        <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Type'}</th>
                        <th className="p-4">{language === 'vi' ? 'Giờ mở cửa' : 'Operating Hours'}</th>
                        <th className="p-4">{language === 'vi' ? 'Giá tham khảo' : 'Price Range'}</th>
                        <th className="p-4">{language === 'vi' ? 'Địa chỉ' : 'Address'}</th>
                        <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                      {currentRentals.map((rental) => (
                        <tr key={rental.id} className="hover:bg-gray-50/55 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={rental.imageUrl} alt={rental.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                            <span className="font-bold text-gray-900 text-sm">{rental.name}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg font-bold text-[10px] border ${
                              rental.type === 'Thuê máy ảnh' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                rental.type === 'Thuê đồ' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  rental.type === 'Thuê xe' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-cyan-50 text-cyan-600 border-cyan-100'
                            }`}>
                              {rental.type}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 font-semibold">
                            🕒 {rental.openingTime?.substring(0, 5) || '08:00'} - {rental.closingTime?.substring(0, 5) || '21:00'}
                          </td>
                          <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                            {rental.minPrice > 0 || rental.maxPrice > 0 ? (
                              `${rental.minPrice.toLocaleString()}đ - ${rental.maxPrice.toLocaleString()}đ`
                            ) : (language === 'vi' ? 'Liên hệ' : 'Contact')}
                          </td>
                          <td className="p-4 text-gray-500 max-w-xs truncate font-semibold" title={rental.address}>
                            {rental.address}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleEditRentalClick(rental)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                              title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRental(rental.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                              title={language === 'vi' ? 'Xoá' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {totalRentalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex-wrap gap-3">
                      <div className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                        {language === 'vi'
                          ? `Hiển thị dịch vụ ${indexOfFirstRental + 1} - ${Math.min(indexOfLastRental, filteredRentals.length)} trong tổng số ${filteredRentals.length} dịch vụ`
                          : `Showing ${indexOfFirstRental + 1} - ${Math.min(indexOfLastRental, filteredRentals.length)} of ${filteredRentals.length} rentals`}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => setCurrentRentalPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentRentalPage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Trước' : 'Prev'}
                        </button>
                        {Array.from({ length: totalRentalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentRentalPage(p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer select-none border border-transparent ${
                              currentRentalPage === p
                                ? 'bg-heritage-amber text-white shadow-sm shadow-heritage-amber/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentRentalPage(prev => Math.min(prev + 1, totalRentalPages))}
                          disabled={currentRentalPage === totalRentalPages}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-heritage-amber/50 hover:text-heritage-amber rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        >
                          {language === 'vi' ? 'Sau' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Diaries Manager (Moderation) */}

          {activeSubTab === 'diaries' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-outfit text-lg font-extrabold text-gray-900 mb-2">
                {language === 'vi' ? 'Kiểm duyệt Nhật ký Hành trình' : 'Moderate Travel Diaries'}
              </h3>
              <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                      <th className="p-4">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
                      <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Category'}</th>
                      <th className="p-4 w-1/3">{language === 'vi' ? 'Nội dung' : 'Content'}</th>
                      <th className="p-4 text-center">{language === 'vi' ? 'Tương tác' : 'Interactions'}</th>
                      <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {diaries.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50/55 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={post.user?.avatar} alt={post.user?.name || 'user avatar'} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          <span className="font-bold text-gray-900">{post.user?.name}</span>
                        </td>
                        <td className="p-4 uppercase tracking-widest text-[9px] font-extrabold text-ricefield-green">
                          {getCategoryLabel(post.category)}
                        </td>
                        <td className="p-4 truncate max-w-xs text-gray-600 text-sm">
                          {language === 'vi' ? post.content?.vi : post.content?.en}
                        </td>
                        <td className="p-4 text-center font-bold text-gray-500">
                          ❤️ {post.likes} | 💬 {post.comments?.length || 0}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteDiary(post.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                            title={language === 'vi' ? 'Xoá / Gỡ bỏ bài viết' : 'Delete / Remove post'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Experts Coordinator */}
          {activeSubTab === 'experts' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-outfit text-lg font-extrabold text-gray-900 mb-2">
                {language === 'vi' ? 'Hội đồng Chuyên gia bản địa Hội An' : 'Hoi An Local Experts Council'}
              </h3>
              <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                      <th className="p-4">{language === 'vi' ? 'Chuyên gia' : 'Expert'}</th>
                      <th className="p-4">{language === 'vi' ? 'Lĩnh vực tư vấn chính' : 'Consulting Specialty'}</th>
                      <th className="p-4">{language === 'vi' ? 'Đánh giá' : 'Rating'}</th>
                      <th className="p-4">{language === 'vi' ? 'Trạng thái Online' : 'Online Status'}</th>
                      <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {experts.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/55 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={exp.avatar} alt={exp.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          <span className="font-bold text-gray-900">{exp.name}</span>
                        </td>
                        <td className="p-4 text-gray-600 font-semibold">
                          {language === 'vi' ? exp.role?.vi : exp.role?.en}
                        </td>
                        <td className="p-4 font-bold text-heritage-amber flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-heritage-amber" /> {exp.rating}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={"w-2 h-2 rounded-full relative " + (exp.online ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
                            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500">
                              {exp.online
                                ? (language === 'vi' ? 'Trực tuyến' : 'Online')
                                : (language === 'vi' ? 'Ngoại tuyến' : 'Offline')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleExpertOnline(exp.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border transition-all cursor-pointer ${exp.online
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                              }`}
                          >
                            {exp.online
                              ? (language === 'vi' ? 'Tạm ẩn' : 'Deactivate')
                              : (language === 'vi' ? 'Kích hoạt' : 'Activate')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Inquiries Mailbox */}
          {activeSubTab === 'inquiries' && (
            <div className="flex flex-col gap-6">
              <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                {language === 'vi' ? 'Yêu cầu tư vấn chưa trả lời' : 'Pending Inquiry Requests'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all ${inq.replied ? 'border-gray-200 bg-gray-50/50' : 'border-rose-200 bg-rose-50/20'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{inq.travelerName}</span>
                        <span className="text-[10px] text-gray-400">{inq.travelerEmail}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{inq.date}</span>
                    </div>

                    <p className="text-gray-700 text-xs leading-relaxed font-semibold bg-white/70 p-3 rounded-xl border border-gray-150">
                      {inq.question}
                    </p>

                    {inq.replied ? (
                      <div className="bg-emerald-50/50 border border-emerald-100/60 p-3 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">
                          {language === 'vi' ? '✓ Câu trả lời của chuyên gia:' : '✓ Expert Answer:'}
                        </span>
                        {inq.replyContent}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-2">
                        {activeInquiryId === inq.id ? (
                          <div className="flex flex-col gap-2 animate-scale-up">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={language === 'vi' ? "Nhập câu trả lời tư vấn cho du khách..." : "Type response to traveler..."}
                              className="w-full p-2.5 bg-white border border-gray-200 text-xs font-medium rounded-xl focus:outline-none focus:border-heritage-amber h-16 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setActiveInquiryId(null); setReplyText(''); }}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-600 cursor-pointer border-none"
                              >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                              </button>
                              <button
                                onClick={() => handleSendInquiryReply(inq.id)}
                                className="px-3 py-1.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-lg text-[10px] font-bold cursor-pointer border-none flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                {language === 'vi' ? 'Gửi phản hồi' : 'Send response'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveInquiryId(inq.id); setReplyText(''); }}
                            className="w-full py-2 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {language === 'vi' ? 'Phản hồi tư vấn ngay' : 'Respond to inquiry'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Spots CRUD Modal */}
      {showAddSpotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleSpotFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddSpotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {isEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa địa điểm du lịch Hội An' : '📝 Edit Hoi An Travel Spot')
                : (language === 'vi' ? '✨ Đăng ký địa điểm du lịch Hội An' : '✨ Register Hoi An Travel Spot')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {newSpotCategory === 'food' ? (
                <>
                  {/* FOOD MODE - LEFT COLUMN: Food Info */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                      {language === 'vi' ? 'Thông tin Món ăn & Quán' : 'Food & Restaurant Info'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Phân loại' : 'Category'}
                        </label>
                        <select
                          value={newSpotCategory}
                          onChange={(e) => setNewSpotCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                        >
                          <option value="healing">{language === 'vi' ? '🧘 Chữa lành' : '🧘 Healing'}</option>
                          <option value="food">{language === 'vi' ? '🍗 Ẩm thực' : '🍗 Food'}</option>
                          <option value="adventure">{language === 'vi' ? '🏮 Trải nghiệm' : '🏮 Adventure'}</option>
                          <option value="scenic">{language === 'vi' ? '📸 Phong cảnh' : '📸 Scenic'}</option>
                          <option value="sightseeing">{language === 'vi' ? '🏛️ Tham quan' : '🏛️ Sightseeing'}</option>
                          <option value="cafe">{language === 'vi' ? '☕ Cà phê' : '☕ Cafe'}</option>
                          <option value="stay">{language === 'vi' ? '🏨 Nghỉ dưỡng' : '🏨 Stay'}</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Tên món ăn (Món ăn)' : 'Dish Name (Món ăn)'}
                        </label>
                        <input
                          type="text"
                          value={newSpotTags}
                          onChange={(e) => setNewSpotTags(e.target.value)}
                          placeholder={language === 'vi' ? "Cao lầu, Cơm gà Hội An..." : "Cao Lau, Chicken Rice..."}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        {language === 'vi' ? 'Tên quán ăn' : 'Restaurant Name'}
                      </label>
                      <input
                        type="text"
                        value={newSpotNameVi}
                        onChange={(e) => setNewSpotNameVi(e.target.value)}
                        placeholder={language === 'vi' ? "Quán Cao lầu Bá Lễ" : "Ba Le Cao Lau"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        {language === 'vi' ? 'Địa chỉ chi tiết' : 'Detailed Address'}
                      </label>
                      <input
                        type="text"
                        value={newSpotAddress}
                        onChange={(e) => setNewSpotAddress(e.target.value)}
                        placeholder={language === 'vi' ? "49/3 Trần Hưng Đạo, Hội An" : "49/3 Tran Hung Dao, Hoi An"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Giá bán từ (VNĐ)' : 'Price From (VND)'}
                        </label>
                        <input
                          type="number"
                          value={newSpotMinCost}
                          onChange={(e) => setNewSpotMinCost(e.target.value)}
                          placeholder="40000"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Giá bán đến (VNĐ)' : 'Price To (VND)'}
                        </label>
                        <input
                          type="number"
                          value={newSpotMaxCost}
                          onChange={(e) => setNewSpotMaxCost(e.target.value)}
                          placeholder="40000"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Giờ mở cửa' : 'Opening Time'}
                        </label>
                        <input
                          type="time"
                          value={newSpotOpeningTime}
                          onChange={(e) => setNewSpotOpeningTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Giờ đóng cửa' : 'Closing Time'}
                        </label>
                        <input
                          type="time"
                          value={newSpotClosingTime}
                          onChange={(e) => setNewSpotClosingTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* FOOD MODE - RIGHT COLUMN: Image & Location */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                      {language === 'vi' ? 'Hình ảnh & Định vị địa lý' : 'Image & Geolocation'}
                    </h4>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        {language === 'vi' ? 'Đường dẫn ảnh trực tiếp (Link ảnh)' : 'Direct Image Link'}
                      </label>
                      <input
                        type="url"
                        value={savedImageUrl}
                        onChange={(e) => { setSavedImageUrl(e.target.value); setImagePreview(e.target.value); }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400">
                        {language === 'vi' ? 'Hoặc Tải ảnh lên Cloudflare R2' : 'Or Upload to Cloudflare R2'}
                      </label>
                      <div className="relative border border-dashed border-gray-200 hover:border-heritage-amber/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all bg-gray-50/30 hover:bg-amber-50/5 min-h-[90px] overflow-hidden group">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <span className="text-[9px] text-white font-extrabold uppercase tracking-wider">
                                {language === 'vi' ? 'Tải ảnh khác' : 'Upload other'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <Plus className="w-5 h-5 stroke-1.5 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Tải lên R2</span>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                            <div className="w-4 h-4 border-2 border-heritage-amber border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newSpotLat}
                          onChange={(e) => setNewSpotLat(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newSpotLng}
                          onChange={(e) => setNewSpotLng(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {newSpotLat && newSpotLng && (
                      <div className="w-full h-32 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative mt-1">
                        <LeafletMap
                          lat={Number(newSpotLat)}
                          lng={Number(newSpotLng)}
                          name={newSpotNameVi}
                          language={language}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* DEFAULT MODE - LEFT COLUMN: Basic Information */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                      {language === 'vi' ? 'Thông tin chung' : 'General Info'}
                    </h4>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        {language === 'vi' ? 'Hình ảnh địa điểm (Cloudflare R2)' : 'Spot Image (Cloudflare R2)'}
                      </label>

                      {/* Styled upload zone */}
                      <div className="relative border-2 border-dashed border-gray-200 hover:border-heritage-amber/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 transition-all bg-gray-50/50 hover:bg-amber-50/10 min-h-[140px] overflow-hidden group">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">
                                {language === 'vi' ? 'Thay đổi ảnh' : 'Change Image'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <Plus className="w-6 h-6 stroke-1.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {language === 'vi' ? 'Chọn ảnh của quán' : 'Select Spot Image'}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {language === 'vi' ? 'Hỗ trợ JPG, PNG, WEBP' : 'Supports JPG, PNG, WEBP'}
                            </span>
                          </div>
                        )}

                        {uploadingImage && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-heritage-amber border-t-transparent rounded-full animate-spin" />
                            <span className="text-[9.5px] font-bold text-heritage-amber uppercase tracking-wider">
                              {language === 'vi' ? 'Đang tải lên R2...' : 'Uploading to R2...'}
                            </span>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={uploadingImage}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        {language === 'vi' ? 'Tên địa điểm (Tiếng Việt)' : 'Spot Name (Vietnamese)'}
                      </label>
                      <input
                        type="text"
                        value={newSpotNameVi}
                        onChange={(e) => setNewSpotNameVi(e.target.value)}
                        placeholder={language === 'vi' ? "Chùa Cầu Nhật Bản" : "Japanese Covered Bridge"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        {language === 'vi' ? 'Tên địa điểm (Tiếng Anh)' : 'Spot Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={newSpotNameEn}
                        onChange={(e) => setNewSpotNameEn(e.target.value)}
                        placeholder={language === 'vi' ? "Japanese Covered Bridge" : "Japanese Covered Bridge"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Phân loại' : 'Category'}
                        </label>
                        <select
                          value={newSpotCategory}
                          onChange={(e) => setNewSpotCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                        >
                          <option value="healing">{language === 'vi' ? '🧘 Chữa lành' : '🧘 Healing'}</option>
                          <option value="food">{language === 'vi' ? '🍗 Ẩm thực' : '🍗 Food'}</option>
                          <option value="adventure">{language === 'vi' ? '🏮 Trải nghiệm' : '🏮 Adventure'}</option>
                          <option value="scenic">{language === 'vi' ? '📸 Phong cảnh' : '📸 Scenic'}</option>
                          <option value="sightseeing">{language === 'vi' ? '🏛️ Tham quan' : '🏛️ Sightseeing'}</option>
                          <option value="cafe">{language === 'vi' ? '☕ Cà phê' : '☕ Cafe'}</option>
                          <option value="stay">{language === 'vi' ? '🏨 Nghỉ dưỡng' : '🏨 Stay'}</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Mật độ đông đúc' : 'Crowd Level'}
                        </label>
                        <select
                          value={newSpotCrowdLevel}
                          onChange={(e) => setNewSpotCrowdLevel(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                        >
                          <option value="low">🟢 {language === 'vi' ? 'Thấp (Low)' : 'Low'}</option>
                          <option value="medium">🟡 {language === 'vi' ? 'Vừa (Medium)' : 'Medium'}</option>
                          <option value="high">🔴 {language === 'vi' ? 'Cao (High)' : 'High'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                        </label>
                        <input
                          type="number"
                          value={newSpotMinCost}
                          onChange={(e) => setNewSpotMinCost(e.target.value)}
                          placeholder="50000"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Giá đến (VNĐ)' : 'Price To (VND)'}
                        </label>
                        <input
                          type="number"
                          value={newSpotMaxCost}
                          onChange={(e) => setNewSpotMaxCost(e.target.value)}
                          placeholder="150000"
                          min="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-150 p-3 rounded-2xl text-[10px] text-amber-800 leading-relaxed font-semibold">
                      <span className="font-extrabold uppercase tracking-wider block mb-1 text-amber-900">
                        {language === 'vi' ? '💡 Mẹo phân loại Mật độ:' : '💡 Crowd Level Guidelines:'}
                      </span>
                      {language === 'vi' ? (
                        <>
                          • <span className="font-extrabold text-emerald-600">Thấp</span>: Resort yên tĩnh, cafe ngắm đồng lúa, bãi biển vắng.<br />
                          • <span className="font-extrabold text-amber-600">Vừa</span>: Quán ăn gia đình, workshop tre, chùa đền cổ kính.<br />
                          • <span className="font-extrabold text-red-500">Cao</span>: Phố cổ đi bộ tối cuối tuần, bến thả đèn hoa đăng.
                        </>
                      ) : (
                        <>
                          • <span className="font-extrabold text-emerald-600">Low</span>: Quiet resorts, green field cafes, quiet beaches.<br />
                          • <span className="font-extrabold text-amber-600">Medium</span>: Local diners, bamboo workshops, local temples.<br />
                          • <span className="font-extrabold text-red-500">High</span>: Old town streets during weekend, candle release docks.
                        </>
                      )}
                    </div>
                  </div>

                  {/* DEFAULT MODE - RIGHT COLUMN: Map & Geolocation */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                      {language === 'vi' ? 'Định vị địa lý' : 'Geolocation'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newSpotLat}
                          onChange={(e) => setNewSpotLat(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500">
                          {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newSpotLng}
                          onChange={(e) => setNewSpotLng(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Bản đồ định vị Google Maps xem trước thời gian thực */}
                    {newSpotLat && newSpotLng && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                          {language === 'vi' ? '📍 Định Vị Thực Tế Bản Đồ' : '📍 Live Map Preview'}
                        </label>
                        <div className="w-full h-44 rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-gray-50 relative">
                          <LeafletMap
                            lat={Number(newSpotLat)}
                            lng={Number(newSpotLng)}
                            name={language === 'vi' ? newSpotNameVi : newSpotNameEn}
                            language={language}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddSpotModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu địa điểm' : 'Save Spot')}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Dishes CRUD Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleDishFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddDishModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {isDishEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Món ăn đặc sản' : '📝 Edit Specialty Dish')
                : (language === 'vi' ? '✨ Đăng ký Món ăn đặc sản mới' : '✨ Register New Specialty Dish')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Dish Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin Món ăn' : 'Dish Information'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên món ăn' : 'Dish Name'}
                    </label>
                    <input
                      type="text"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      placeholder={language === 'vi' ? "Cao lầu, Cơm gà..." : "Cao Lau, Chicken Rice..."}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên quán ăn' : 'Restaurant Name'}
                    </label>
                    <input
                      type="text"
                      value={newDishRestaurant}
                      onChange={(e) => setNewDishRestaurant(e.target.value)}
                      placeholder={language === 'vi' ? "Quán Cao lầu Bá Lễ" : "Ba Le Restaurant"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Địa chỉ' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={newDishAddress}
                    onChange={(e) => setNewDishAddress(e.target.value)}
                    placeholder={language === 'vi' ? "49/3 Trần Hưng Đạo, Hội An" : "49/3 Tran Hung Dao, Hoi An"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá bán từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newDishMinPrice}
                      onChange={(e) => setNewDishMinPrice(e.target.value)}
                      placeholder="40000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá bán đến (VNĐ)' : 'Price To (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newDishMaxPrice}
                      onChange={(e) => setNewDishMaxPrice(e.target.value)}
                      placeholder="40000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ mở cửa' : 'Opening Time'}
                    </label>
                    <input
                      type="time"
                      value={newDishOpeningTime}
                      onChange={(e) => setNewDishOpeningTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ đóng cửa' : 'Closing Time'}
                    </label>
                    <input
                      type="time"
                      value={newDishClosingTime}
                      onChange={(e) => setNewDishClosingTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Dish Image & Location */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Hình ảnh & Định vị địa lý' : 'Image & Geolocation'}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Đường dẫn ảnh trực tiếp (Link ảnh)' : 'Direct Image Link'}
                  </label>
                  <input
                    type="url"
                    value={newDishImageUrl}
                    onChange={(e) => setNewDishImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newDishLat}
                      onChange={(e) => setNewDishLat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newDishLng}
                      onChange={(e) => setNewDishLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newDishLat && newDishLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newDishLat)}
                      lng={Number(newDishLng)}
                      name={newDishName}
                      language={language}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddDishModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isDishEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu món ăn' : 'Save Dish')}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Cafes CRUD Modal */}
      {showAddCafeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleCafeFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddCafeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {isCafeEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa quán Cà phê' : '📝 Edit Specialty Cafe')
                : (language === 'vi' ? '✨ Đăng ký quán Cà phê mới' : '✨ Register New Specialty Cafe')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Cafe Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin Quán' : 'Cafe Information'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên quán' : 'Cafe Name'}
                    </label>
                    <input
                      type="text"
                      value={newCafeName}
                      onChange={(e) => setNewCafeName(e.target.value)}
                      placeholder={language === 'vi' ? "FeFe Coffee" : "FeFe Coffee"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Phong cách' : 'Style'}
                    </label>
                    <input
                      type="text"
                      value={newCafeStyle}
                      onChange={(e) => setNewCafeStyle(e.target.value)}
                      placeholder={language === 'vi' ? "Chill & Thư giãn" : "Chill & Relax"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                <AddressDropdown
                  value={newCafeAddress}
                  onChange={setNewCafeAddress}
                  addresses={cafeAddresses}
                  filterByOperating={false}
                  placeholder={language === 'vi' ? "Chọn hoặc nhập địa chỉ..." : "Select or enter address..."}
                  label={language === 'vi' ? 'Địa chỉ' : 'Address'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newCafeMinPrice}
                      onChange={(e) => setNewCafeMinPrice(e.target.value)}
                      placeholder="45000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá đến (VNĐ)' : 'Price To (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newCafeMaxPrice}
                      onChange={(e) => setNewCafeMaxPrice(e.target.value)}
                      placeholder="45000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ mở cửa' : 'Opening Time'}
                    </label>
                    <input
                      type="time"
                      value={newCafeOpeningTime}
                      onChange={(e) => setNewCafeOpeningTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ đóng cửa' : 'Closing Time'}
                    </label>
                    <input
                      type="time"
                      value={newCafeClosingTime}
                      onChange={(e) => setNewCafeClosingTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Cafe Image & Location */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Hình ảnh & Định vị địa lý' : 'Image & Geolocation'}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Đường dẫn ảnh trực tiếp (Link ảnh)' : 'Direct Image Link'}
                  </label>
                  <input
                    type="url"
                    value={newCafeImageUrl}
                    onChange={(e) => setNewCafeImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newCafeLat}
                      onChange={(e) => setNewCafeLat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newCafeLng}
                      onChange={(e) => setNewCafeLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newCafeLat && newCafeLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newCafeLat)}
                      lng={Number(newCafeLng)}
                      name={newCafeName}
                      language={language}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddCafeModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isCafeEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu quán cà phê' : 'Save Cafe')}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Stays CRUD Modal */}
      {showAddStayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleStayFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddStayModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {isStayEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Chỗ ở' : '📝 Edit Accommodation')
                : (language === 'vi' ? '✨ Đăng ký Chỗ ở mới' : '✨ Register New Accommodation')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Stay Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin Chỗ ở' : 'Accommodation Info'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Phân loại' : 'Type'}
                    </label>
                    <select
                      value={newStayType}
                      onChange={(e) => setNewStayType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                    >
                      <option value="Hotel">Hotel</option>
                      <option value="Villa">Villa</option>
                      <option value="Homestay">Homestay</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên chỗ ở' : 'Accommodation Name'}
                    </label>
                    <input
                      type="text"
                      value={newStayName}
                      onChange={(e) => setNewStayName(e.target.value)}
                      placeholder={language === 'vi' ? "Little Pie Hội An" : "Little Pie Hoi An"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Sức chứa' : 'Capacity'}
                    </label>
                    <input
                      type="text"
                      value={newStayCapacity}
                      onChange={(e) => setNewStayCapacity(e.target.value)}
                      placeholder={language === 'vi' ? "2 lớn, 1 trẻ em" : "2 adults, 1 child"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Ghi chú' : 'Notes'}
                    </label>
                    <input
                      type="text"
                      value={newStayNotes}
                      onChange={(e) => setNewStayNotes(e.target.value)}
                      placeholder={language === 'vi' ? "Đặt sớm giá rẻ hơn..." : "Book early for better rate..."}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Địa chỉ' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={newStayAddress}
                    onChange={(e) => setNewStayAddress(e.target.value)}
                    placeholder={language === 'vi' ? "Trà Quế, Hội An Tây" : "Tra Que, Hoi An"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newStayMinPrice}
                      onChange={(e) => setNewStayMinPrice(e.target.value)}
                      placeholder="1400000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá đến (VNĐ)' : 'Price To (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newStayMaxPrice}
                      onChange={(e) => setNewStayMaxPrice(e.target.value)}
                      placeholder="1400000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Stay Image & Location */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Hình ảnh & Định vị địa lý' : 'Image & Geolocation'}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Đường dẫn ảnh trực tiếp (Link ảnh)' : 'Direct Image Link'}
                  </label>
                  <input
                    type="url"
                    value={newStayImageUrl}
                    onChange={(e) => setNewStayImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newStayLat}
                      onChange={(e) => setNewStayLat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newStayLng}
                      onChange={(e) => setNewStayLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newStayLat && newStayLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newStayLat)}
                      lng={Number(newStayLng)}
                      name={newStayName}
                      language={language}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddStayModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isStayEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu chỗ ở' : 'Save Stay')}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Entertainments CRUD Modal */}
      {showAddEntertainmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up">
            <button
              type="button"
              onClick={() => setShowAddEntertainmentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-b-gray-100">
              {isEntertainmentEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Khu vui chơi' : '📝 Edit Entertainment Spot')
                : (language === 'vi' ? '✨ Đăng ký Khu vui chơi mới' : '✨ Register New Entertainment Spot')}
            </h3>

            <EntertainmentForm
              initialData={isEntertainmentEditMode ? {
                id: editingEntertainmentId,
                type: newEntertainmentType,
                interests: newEntertainmentInterests,
                name: newEntertainmentName,
                address: newEntertainmentAddress,
                latitude: newEntertainmentLat,
                longitude: newEntertainmentLng,
                minPrice: newEntertainmentMinPrice,
                maxPrice: newEntertainmentMaxPrice,
                imageUrl: newEntertainmentImageUrl,
                openingTime: newEntertainmentOpeningTime,
                closingTime: newEntertainmentClosingTime,
                overnight: false
              } : null}
              onCancel={() => setShowAddEntertainmentModal(false)}
              onSuccess={async () => { setShowAddEntertainmentModal(false); await fetchData(); }}
            />
          </div>
        </div>
      )}

      {/* Rentals CRUD Modal */}
      {showAddRentalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <form
            onSubmit={handleRentalFormSubmit}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shrink-0 bg-white/95 border border-gray-150 shadow-2xl rounded-3xl p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddRentalModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-b-gray-100">
              {isRentalEditMode
                ? (language === 'vi' ? '📝 Chỉnh sửa Dịch vụ cho thuê' : '📝 Edit Rental Service')
                : (language === 'vi' ? '✨ Đăng ký Dịch vụ cho thuê mới' : '✨ Register New Rental Service')}
            </h3>

            {/* Two Column Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* LEFT COLUMN: Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-heritage-amber uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Thông tin cơ bản' : 'Basic Info'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Phân loại' : 'Type'}
                    </label>
                    <select
                      value={newRentalType}
                      onChange={(e) => setNewRentalType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                    >
                      <option value="Thuê máy ảnh">{language === 'vi' ? 'Thuê máy ảnh' : 'Camera Rental'}</option>
                      <option value="Thuê đồ">{language === 'vi' ? 'Thuê đồ' : 'Outfit Rental'}</option>
                      <option value="Thuê xe">{language === 'vi' ? 'Thuê xe' : 'Motorbike Rental'}</option>
                      <option value="Photobooth">Photobooth</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Tên dịch vụ' : 'Service Name'}
                    </label>
                    <input
                      type="text"
                      value={newRentalName}
                      onChange={(e) => setNewRentalName(e.target.value)}
                      placeholder="SIN E-scooter Rental"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <AddressDropdown
                  value={newRentalAddress}
                  onChange={setNewRentalAddress}
                  addresses={rentalAddresses}
                  filterByOperating={false}
                  placeholder={language === 'vi' ? "Chọn hoặc nhập địa chỉ..." : "Select or enter address..."}
                  label={language === 'vi' ? 'Địa chỉ' : 'Address'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ mở cửa' : 'Opening Time'}
                    </label>
                    <input
                      type="time"
                      value={newRentalOpeningTime}
                      onChange={(e) => setNewRentalOpeningTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giờ đóng cửa' : 'Closing Time'}
                    </label>
                    <input
                      type="time"
                      value={newRentalClosingTime}
                      onChange={(e) => setNewRentalClosingTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá từ (VNĐ)' : 'Price From (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newRentalMinPrice}
                      onChange={(e) => setNewRentalMinPrice(e.target.value)}
                      placeholder="150000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Giá đến (VNĐ)' : 'Price To (VND)'}
                    </label>
                    <input
                      type="number"
                      value={newRentalMaxPrice}
                      onChange={(e) => setNewRentalMaxPrice(e.target.value)}
                      placeholder="150000"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Image & Location */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Hình ảnh & Bản đồ định vị' : 'Image & Location'}
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">
                    {language === 'vi' ? 'Đường dẫn ảnh trực tiếp' : 'Direct Image URL'}
                  </label>
                  <input
                    type="url"
                    value={newRentalImageUrl}
                    onChange={(e) => setNewRentalImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Vĩ độ (Latitude)' : 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newRentalLat}
                      onChange={(e) => setNewRentalLat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {language === 'vi' ? 'Kinh độ (Longitude)' : 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newRentalLng}
                      onChange={(e) => setNewRentalLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50/50 text-gray-800 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {newRentalLat && newRentalLng && (
                  <div className="w-full h-44 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 relative">
                    <LeafletMap
                      lat={Number(newRentalLat)}
                      lng={Number(newRentalLng)}
                      name={newRentalName}
                      language={language}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddRentalModal(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-600 font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 flex items-center gap-1.5"
              >
                {isRentalEditMode
                  ? (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')
                  : (language === 'vi' ? 'Lưu dịch vụ' : 'Save Service')}
              </button>
            </div>

          </form>
        </div>
      )}



    </div>
  );
}
