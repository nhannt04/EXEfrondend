import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, MessageSquare, ShieldAlert, Award, Star,
  Trash2, Plus, CheckCircle, Flame, UserCheck, X, Activity, Edit3, Send, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext.jsx';
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
import DishesTab from './tabs/DishesTab';
import CafesTab from './tabs/CafesTab';
import StaysTab from './tabs/StaysTab';
import EntertainmentsTab from './tabs/EntertainmentsTab';
import RentalsTab from './tabs/RentalsTab';
import DiariesTab from './tabs/DiariesTab';
import ExpertsTab from './tabs/ExpertsTab';
import InquiriesTab from './tabs/InquiriesTab';





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
            <DishesTab {...{ language, dishes, filteredDishes, currentDishes, currentDishPage, setCurrentDishPage, totalDishPages, indexOfFirstDish, indexOfLastDish, dishSearchTerm, setDishSearchTerm, handleAddDishClick, handleEditDishClick, handleDeleteDish, showAddDishModal, setShowAddDishModal, isDishEditMode, newDishName, setNewDishName, newDishRestaurant, setNewDishRestaurant, newDishAddress, setNewDishAddress, newDishLat, setNewDishLat, newDishLng, setNewDishLng, newDishMinPrice, setNewDishMinPrice, newDishMaxPrice, setNewDishMaxPrice, newDishOpeningTime, setNewDishOpeningTime, newDishClosingTime, setNewDishClosingTime, newDishImageUrl, setNewDishImageUrl, handleDishFormSubmit }} />
          )}

          {/* TAB: Cafes Manager */}
          {activeSubTab === 'cafes' && (
            <CafesTab {...{ language, cafes, filteredCafes, currentCafes, currentCafePage, setCurrentCafePage, totalCafePages, indexOfFirstCafe, indexOfLastCafe, cafeSearchTerm, setCafeSearchTerm, handleAddCafeClick, handleEditCafeClick, handleDeleteCafe, showAddCafeModal, setShowAddCafeModal, isCafeEditMode, newCafeName, setNewCafeName, newCafeStyle, setNewCafeStyle, newCafeAddress, setNewCafeAddress, newCafeLat, setNewCafeLat, newCafeLng, setNewCafeLng, newCafeMinPrice, setNewCafeMinPrice, newCafeMaxPrice, setNewCafeMaxPrice, newCafeOpeningTime, setNewCafeOpeningTime, newCafeClosingTime, setNewCafeClosingTime, newCafeImageUrl, setNewCafeImageUrl, handleCafeFormSubmit, cafeAddresses }} />
          )}

          {/* TAB: Stays Manager */}
          {activeSubTab === 'stays' && (
            <StaysTab {...{ language, stays, filteredStays, currentStays, currentStayPage, setCurrentStayPage, totalStayPages, indexOfFirstStay, indexOfLastStay, staySearchTerm, setStaySearchTerm, handleAddStayClick, handleEditStayClick, handleDeleteStay, showAddStayModal, setShowAddStayModal, isStayEditMode, newStayType, setNewStayType, newStayName, setNewStayName, newStayAddress, setNewStayAddress, newStayLat, setNewStayLat, newStayLng, setNewStayLng, newStayCapacity, setNewStayCapacity, newStayMinPrice, setNewStayMinPrice, newStayMaxPrice, setNewStayMaxPrice, newStayNotes, setNewStayNotes, newStayImageUrl, setNewStayImageUrl, handleStayFormSubmit }} />
          )}

          {/* TAB: Entertainments Manager */}
          {activeSubTab === 'entertainments' && (
            <EntertainmentsTab {...{ language, entertainments, filteredEntertainments, currentEntertainments, entertainmentSearchTerm, setEntertainmentSearchTerm, setCurrentEntertainmentPage, totalEntertainmentPages, indexOfFirstEntertainment, indexOfLastEntertainment, currentEntertainmentPage, handleAddEntertainmentClick, handleEditEntertainmentClick, handleDeleteEntertainment, formatTime, showAddEntertainmentModal, setShowAddEntertainmentModal, isEntertainmentEditMode, editingEntertainmentId, newEntertainmentType, newEntertainmentInterests, newEntertainmentName, newEntertainmentAddress, newEntertainmentLat, newEntertainmentLng, newEntertainmentMinPrice, newEntertainmentMaxPrice, newEntertainmentImageUrl, newEntertainmentOpeningTime, newEntertainmentClosingTime, fetchData }} />
          )}

          {/* TAB: Rentals Manager */}
          {activeSubTab === 'rentals' && (
            <RentalsTab {...{ language, rentals, filteredRentals, currentRentals, rentalSearchTerm, setRentalSearchTerm, setCurrentRentalPage, totalRentalPages, indexOfFirstRental, indexOfLastRental, currentRentalPage, handleAddRentalClick, handleEditRentalClick, handleDeleteRental, showAddRentalModal, setShowAddRentalModal, isRentalEditMode, handleRentalFormSubmit, newRentalType, setNewRentalType, newRentalName, setNewRentalName, rentalAddresses, newRentalAddress, setNewRentalAddress, newRentalLat, setNewRentalLat, newRentalLng, setNewRentalLng, newRentalMinPrice, setNewRentalMinPrice, newRentalMaxPrice, setNewRentalMaxPrice, newRentalOpeningTime, setNewRentalOpeningTime, newRentalClosingTime, setNewRentalClosingTime, newRentalImageUrl, setNewRentalImageUrl }} />
          )}

          {/* TAB 2: Diaries Manager (Moderation) */}

          {activeSubTab === 'diaries' && (
            <DiariesTab {...{ language, diaries, getCategoryLabel, handleDeleteDiary }} />
          )}

          {/* TAB 3: Experts Coordinator */}
          {activeSubTab === 'experts' && (
            <ExpertsTab {...{ language, experts, handleToggleExpertOnline }} />
          )}

          {/* TAB 4: Inquiries Mailbox */}
          {activeSubTab === 'inquiries' && (
            <InquiriesTab {...{ language, inquiries, activeInquiryId, setActiveInquiryId, replyText, setReplyText, handleSendInquiryReply }} />
          )}

        </div>
      )}



    </div>
  );
}
