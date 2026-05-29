import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, MessageSquare, ShieldAlert, Award, Star,
  Trash2, Plus, CheckCircle, Flame, UserCheck, X, Activity, Edit3, Send, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import spotService from '../../../services/spotService';
import diaryService from '../../../services/diaryService';
import expertService from '../../../services/expertService';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('spots'); // 'spots' | 'diaries' | 'experts' | 'inquiries'

  // Data lists
  const [spots, setSpots] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [experts, setExperts] = useState([]);
  const [inquiries, setInquiries] = useState([]);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
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
      const [spotsRes, diariesRes, expertsRes] = await Promise.all([
        spotService.getSpots(),
        diaryService.getDiaries(),
        expertService.getExperts()
      ]);

      // Remap spot properties from backend (nameVi, averageCost, etc) to match UI keys
      const mappedSpots = (spotsRes?.data || []).map(spot => ({
        id: spot.id,
        name: { vi: spot.nameVi, en: spot.nameEn },
        category: spot.category,
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

      // Seed inquiries locally to ensure the console is highly populated
      setInquiries([
        {
          id: 101,
          travelerName: 'Nguyễn Du Khách',
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

  // Quick location geocoding via OpenStreetMap Nominatim with Multi-stage Fallback
  const handleGeocodeSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchingLocation(true);
    try {
      const searchQueries = [];

      // 1. Nguyên văn chuỗi người dùng nhập
      const original = searchQuery.trim();
      searchQueries.push(original);

      // 2. Thử tách theo dấu phẩy để lọc bỏ Phường/Xã (vì Nominatim thường bị lỗi ranh giới Phường/Xã tại Việt Nam)
      const commaParts = original.split(',').map(p => p.trim()).filter(Boolean);
      if (commaParts.length >= 3) {
        // Bỏ đi phần tử index 1 (thường là Phường/Xã ngay sau Số nhà/Tên đường)
        const withoutWard = [commaParts[0], ...commaParts.slice(2)].join(', ');
        searchQueries.push(withoutWard);
      }

      // 3. Đơn giản hóa chuỗi (lọc bỏ các từ gây nhiễu)
      const cleanNoise = (str) => {
        return str
          .replace(/(Số|đường|Phường|TP\.|Thành phố|Việt Nam|Vietnam)/gi, "")
          .replace(/\s+/g, " ")
          .trim();
      };

      const originalCleaned = cleanNoise(original);
      if (originalCleaned && originalCleaned !== original) {
        searchQueries.push(originalCleaned);
      }

      if (commaParts.length >= 3) {
        const withoutWardCleaned = cleanNoise([commaParts[0], ...commaParts.slice(2)].join(', '));
        if (withoutWardCleaned && withoutWardCleaned !== originalCleaned) {
          searchQueries.push(withoutWardCleaned);
        }
      }

      // 4. Nếu không chứa "Hội An"/"Hoi An", tự động thêm vào cuối
      const addHoiAnIfMissing = (str) => {
        if (!str.toLowerCase().includes("hội an") && !str.toLowerCase().includes("hoi an")) {
          return str + ", Hoi An, Vietnam";
        }
        return null;
      };

      const addedHoiAnQueries = [];
      searchQueries.forEach(q => {
        const added = addHoiAnIfMissing(q);
        if (added) {
          addedHoiAnQueries.push(added);
        }
      });
      searchQueries.push(...addedHoiAnQueries);

      // Thực hiện tìm kiếm tuần tự qua danh sách các phương án cho đến khi có kết quả
      let data = [];
      const uniqueQueries = [...new Set(searchQueries)];
      
      for (const q of uniqueQueries) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
          const json = await res.json();
          if (json && json.length > 0) {
            data = json;
            break;
          }
        } catch (e) {
          console.warn(`Query failed for "${q}":`, e);
        }
      }

      // 5. Chiến dịch cuối cùng: Nếu vẫn rỗng, thử xóa số nhà (chỉ giữ tên phố + thành phố) để tìm tâm đường
      if (data.length === 0) {
        const fallbackQueries = [];
        uniqueQueries.forEach(q => {
          const queryWithoutHouseNumber = q
            .replace(/^\d+[a-zA-Z]?\s+/g, "") // Xóa số nhà dạng "101 " hoặc "10B "
            .replace(/(Kiệt|Hẻm|Ngõ|Số)\s*\d+(\/\d+)?\s+/gi, "") // Xóa kiệt hẻm
            .trim();
          if (queryWithoutHouseNumber && queryWithoutHouseNumber !== q) {
            fallbackQueries.push(queryWithoutHouseNumber);
          }
        });

        const uniqueFallbacks = [...new Set(fallbackQueries)];
        for (const q of uniqueFallbacks) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
            const json = await res.json();
            if (json && json.length > 0) {
              data = json;
              break;
            }
          } catch (e) {
            console.warn(`Fallback query failed for "${q}":`, e);
          }
        }
      }

      if (data && data.length > 0) {
        const first = data[0];
        setNewSpotLat(Number(parseFloat(first.lat).toFixed(6)));
        setNewSpotLng(Number(parseFloat(first.lon).toFixed(6)));
      } else {
        alert(language === 'vi'
          ? 'Không tìm thấy địa điểm này! Vui lòng thử nhập ngắn gọn hơn (Ví dụ: "52 Nguyễn Thị Minh Khai Hội An").'
          : 'Location not found! Please try typing a shorter query (e.g., "52 Nguyen Thi Minh Khai Hoi An").');
      }
    } catch (err) {
      console.error("Geocoding lookup error:", err);
      alert(language === 'vi'
        ? 'Không thể kết nối tới dịch vụ bản đồ OpenStreetMap!'
        : 'Failed to connect to OpenStreetMap mapping services!');
    } finally {
      setSearchingLocation(false);
    }
  };


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
    setSearchQuery('');

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
    setSearchQuery('');

    // Prefill image upload states from current spot image
    setImagePreview(spot.img || null);
    setSavedImageUrl(spot.img || '');
    setSavedImageKey('');

    setShowAddSpotModal(true);
  };

  // CRUD: Handle Unified Spot Form Submission (Add or Update)
  const handleSpotFormSubmit = async (e) => {
    e.preventDefault();
    if (!newSpotNameVi || !newSpotNameEn) return;

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
        nameEn: newSpotNameEn,
        category: newSpotCategory,
        minCost: Number(newSpotMinCost),
        maxCost: Number(newSpotMaxCost),
        latitude: Number(newSpotLat),
        longitude: Number(newSpotLng),
        crowdLevel: newSpotCrowdLevel,
        rating: 4.8,
        descriptionVi: 'Địa điểm vừa cập nhật vào hệ thống quản lý Travelist.',
        descriptionEn: 'Newly registered/updated highlight destination in Travelist.',
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

  const getCategoryLabel = (cat) => {
    const cleanCat = cat?.toLowerCase();
    if (language === 'vi') {
      if (cleanCat === 'healing') return '🧘 Chữa lành';
      if (cleanCat === 'food') return '🍗 Ẩm thực';
      if (cleanCat === 'adventure') return '🏮 Trải nghiệm';
      if (cleanCat === 'scenic') return '📸 Phong cảnh';
      if (cleanCat === 'sightseeing') return '🏛️ Tham quan';
      if (cleanCat === 'cafe') return '☕ Cà phê';
      if (cleanCat === 'stay') return '🏨 Chỗ nghỉ';
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

  // Pagination Calculations
  const indexOfLastSpot = currentPage * itemsPerPage;
  const indexOfFirstSpot = indexOfLastSpot - itemsPerPage;
  const currentSpots = spots.slice(indexOfFirstSpot, indexOfLastSpot);
  const totalPages = Math.ceil(spots.length / itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in heritage-pattern min-h-screen">

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
          { id: 'spots', label: language === 'vi' ? 'Quản lý Địa điểm' : 'Manage Spots' },
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

          {/* TAB 1: Spots Manager */}
          {activeSubTab === 'spots' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Danh mục Địa điểm du lịch' : 'Destination Category'}
                </h3>
                <button
                  onClick={handleAddSpotClick}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Đăng ký Địa điểm mới' : 'Register New Destination'}
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                      <th className="p-4">{language === 'vi' ? 'Địa điểm (Tên Việt / Anh)' : 'Destination (Vietnamese / English)'}</th>
                      <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Category'}</th>
                      <th className="p-4">{language === 'vi' ? 'Chi phí' : 'Cost'}</th>
                      <th className="p-4">{language === 'vi' ? 'Tọa độ GPS' : 'GPS Coordinates'}</th>
                      <th className="p-4">{language === 'vi' ? 'Mật độ' : 'Crowd Level'}</th>
                      <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {currentSpots.map((spot) => (
                      <tr key={spot.id} className="hover:bg-gray-50/55 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={spot.img} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">{spot.name?.vi}</span>
                            <span className="text-gray-400 text-[10px]">{spot.name?.en}</span>
                          </div>
                        </td>
                        <td className="p-4 uppercase tracking-widest text-[9px] font-extrabold text-ricefield-green">
                          {getCategoryLabel(spot.category)}
                        </td>
                        <td className="p-4 font-bold text-heritage-amber text-[11px] whitespace-nowrap">
                          {spot.minCost > 0 || spot.maxCost > 0 ? (
                            `${spot.minCost.toLocaleString()}đ - ${spot.maxCost.toLocaleString()}đ`
                          ) : (language === 'vi' ? 'Miễn phí' : 'Free')}
                        </td>
                        <td className="p-4 text-gray-400">
                          {spot.lat}, {spot.lng}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${spot.crowdLevel === 'high' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}>
                            {getCrowdLevelLabel(spot.crowdLevel)}
                          </span>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleEditSpotClick(spot)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer inline-flex items-center justify-center mr-1"
                            title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpot(spot.id)}
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

              {/* Pagination UI Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-2 text-xs">
                  <span className="text-gray-500 font-semibold">
                    {language === 'vi'
                      ? `Hiển thị ${indexOfFirstSpot + 1} - ${Math.min(indexOfLastSpot, spots.length)} trên tổng số ${spots.length} địa điểm`
                      : `Showing ${indexOfFirstSpot + 1} - ${Math.min(indexOfLastSpot, spots.length)} of ${spots.length} destinations`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white border border-gray-200 hover:border-heritage-amber disabled:opacity-50 disabled:hover:border-gray-200 rounded-xl text-gray-600 font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                    >
                      {language === 'vi' ? '« Trước' : '« Prev'}
                    </button>

                    {/* Numbered Page Buttons */}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl font-bold transition-all border cursor-pointer select-none ${currentPage === pageNum
                            ? 'bg-heritage-amber text-white border-heritage-amber shadow-sm shadow-heritage-amber/15'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-heritage-amber hover:text-heritage-amber'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-white border border-gray-200 hover:border-heritage-amber disabled:opacity-50 disabled:hover:border-gray-200 rounded-xl text-gray-600 font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                    >
                      {language === 'vi' ? 'Sau »' : 'Next »'}
                    </button>
                  </div>
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
                          <img src={post.user?.avatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
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
                          <img src={exp.avatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
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
                            <span className={`w-2 h-2 rounded-full relative ${exp.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                              }`} />
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

              {/* LEFT COLUMN: Basic Information */}
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

              {/* RIGHT COLUMN: Map & Geolocation */}
              <div className="flex flex-col gap-4">
                <h4 className="font-outfit text-xs font-extrabold text-ricefield-green uppercase tracking-wider mb-1">
                  {language === 'vi' ? 'Định vị địa lý' : 'Geolocation'}
                </h4>

                {/* Tiện ích Tìm tọa độ địa chỉ nhanh */}
                <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl flex flex-col gap-2 shadow-inner">
                  <div className="flex items-center gap-1.5 text-heritage-amber">
                    <MapPin className="w-3.5 h-3.5 animate-bounce" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">
                      {language === 'vi' ? 'Tra Cứu Bản Đồ Tự Động' : 'Automatic Map Lookup'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={language === 'vi' ? "Nhập địa chỉ (ví dụ: An Bang Beach, Hoi An...)" : "Enter address (e.g. An Bang Beach, Hoi An...)"}
                      className="flex-grow px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleGeocodeSearch}
                      disabled={searchingLocation}
                      className="px-3.5 py-2 bg-ricefield-green hover:bg-ricefield-light disabled:bg-gray-300 text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1 shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      {searchingLocation ? '...' : (language === 'vi' ? 'Tìm Tọa Độ' : 'Find GPS')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">
                      {language === 'vi' ? 'Vĩ độ (Latitude) [Khóa]' : 'Latitude [Locked]'}
                    </label>
                    <input
                      type="number"
                      value={newSpotLat}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed select-none"
                      disabled
                      readOnly
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">
                      {language === 'vi' ? 'Kinh độ (Longitude) [Khóa]' : 'Longitude [Locked]'}
                    </label>
                    <input
                      type="number"
                      value={newSpotLng}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed select-none"
                      disabled
                      readOnly
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
                    <iframe
                      src={`https://maps.google.com/maps?q=${newSpotLat},${newSpotLng}&z=16&t=h&output=embed`}
                      className="w-full h-44 rounded-2xl border border-gray-200 shadow-sm"
                      allowFullScreen=""
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

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

    </div>
  );
}
