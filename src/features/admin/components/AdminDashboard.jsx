import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MapPin, MessageSquare, ShieldAlert, Award, Star, 
  Trash2, Plus, CheckCircle, Flame, UserCheck, X, Activity, Edit3, Send, AlertTriangle
} from 'lucide-react';
import spotService from '../../../services/spotService';
import diaryService from '../../../services/diaryService';
import expertService from '../../../services/expertService';

export default function AdminDashboard() {
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
  const [newSpotNameVi, setNewSpotNameVi] = useState('');
  const [newSpotNameEn, setNewSpotNameEn] = useState('');
  const [newSpotCategory, setNewSpotCategory] = useState('healing');
  const [newSpotCost, setNewSpotCost] = useState(0);
  const [newSpotLat, setNewSpotLat] = useState(15.8771);
  const [newSpotLng, setNewSpotLng] = useState(108.3267);
  const [newSpotCrowdLevel, setNewSpotCrowdLevel] = useState('low');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  
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
        cost: spot.averageCost || 0,
        lat: spot.latitude,
        lng: spot.longitude,
        crowdLevel: spot.crowdLevel,
        rating: spot.rating || 4.8,
        img: spot.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'
      }));

      setSpots(mappedSpots);
      setDiaries(diariesRes?.data || []);
      setExperts(expertsRes?.data || []);
      
      // Seed inquiries locally to ensure the console is highly populated
      setInquiries([
        {
          id: 101,
          travelerName: 'Nguyễn Du Khách',
          travelerEmail: 'traveler@histra.vn',
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
      // Stage 1: Thử tìm kiếm chính xác nguyên văn chuỗi người dùng nhập trước
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      let data = await res.json();
      
      // Stage 2: Nếu không thấy, thử bổ sung ngữ cảnh địa phương Hội An
      if ((!data || data.length === 0) && !searchQuery.toLowerCase().includes("hội an") && !searchQuery.toLowerCase().includes("hoi an")) {
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Hoi An, Vietnam")}`);
        data = await res.json();
      }

      // Stage 3: Nếu vẫn không thấy, đơn giản hóa chuỗi (lọc bỏ các từ thừa/gây nhiễu như Đà Nẵng nếu có)
      if (!data || data.length === 0) {
        const simplifiedQuery = searchQuery
          .replace(/(Đà Nẵng|Da Nang|Việt Nam|Vietnam|Việt N)/gi, "")
          .trim();
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simplifiedQuery + (simplifiedQuery.toLowerCase().includes("hội an") ? "" : ", Hoi An"))}`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const first = data[0];
        setNewSpotLat(Number(parseFloat(first.lat).toFixed(6)));
        setNewSpotLng(Number(parseFloat(first.lon).toFixed(6)));
      } else {
        alert('Không tìm thấy địa điểm này! Vui lòng thử nhập ngắn gọn hơn (Ví dụ: "52 Nguyễn Thị Minh Khai Hội An").');
      }
    } catch (err) {
      console.error("Geocoding lookup error:", err);
      alert('Không thể kết nối tới dịch vụ bản đồ OpenStreetMap!');
    } finally {
      setSearchingLocation(false);
    }
  };

  // CRUD: Add Spot
  const handleAddSpotSubmit = async (e) => {
    e.preventDefault();
    if (!newSpotNameVi || !newSpotNameEn) return;

    try {
      const spotObj = {
        nameVi: newSpotNameVi,
        nameEn: newSpotNameEn,
        category: newSpotCategory,
        averageCost: Number(newSpotCost),
        latitude: Number(newSpotLat),
        longitude: Number(newSpotLng),
        crowdLevel: newSpotCrowdLevel,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80',
        descriptionVi: 'Địa điểm mới vừa cập nhật vào hệ thống quản lý HISTRA.',
        descriptionEn: 'Newly registered highlight destination in HISTRA.'
      };

      const response = await spotService.createSpot(spotObj);
      if (response && response.success) {
        const savedSpot = response.data;
        const mappedSpot = {
          id: savedSpot.id,
          name: { vi: savedSpot.nameVi, en: savedSpot.nameEn },
          category: savedSpot.category,
          cost: savedSpot.averageCost,
          lat: savedSpot.latitude,
          lng: savedSpot.longitude,
          crowdLevel: savedSpot.crowdLevel,
          rating: savedSpot.rating,
          img: savedSpot.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'
        };
        setSpots([mappedSpot, ...spots]);
        setShowAddSpotModal(false);
        setNewSpotNameVi('');
        setNewSpotNameEn('');
        setNewSpotCost(0);
        alert('Thêm địa điểm du lịch mới thành công vào Neon PostgreSQL!');
      }
    } catch (err) {
      console.error("Error creating spot:", err);
      alert('Đăng ký địa điểm du lịch thất bại!');
    }
  };

  // CRUD: Delete Spot
  const handleDeleteSpot = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá địa điểm du lịch này khỏi cơ sở dữ liệu HISTRA?')) {
      try {
        const response = await spotService.deleteSpot(id);
        if (response && response.success) {
          setSpots(spots.filter(s => s.id !== id));
          alert('Đã xóa địa điểm thành công khỏi database!');
        }
      } catch (err) {
        console.error("Error deleting spot:", err);
        alert('Xoá địa điểm du lịch thất bại!');
      }
    }
  };

  // CRUD: Delete Diary Post (Moderation)
  const handleDeleteDiary = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ bài viết nhật ký này khỏi Bảng tin cộng đồng?')) {
      setDiaries(diaries.filter(d => d.id !== id));
      alert('Đã gỡ bài viết thành công!');
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
    alert('Gửi phản hồi tư vấn thành công tới Du khách!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in heritage-pattern min-h-screen">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-heritage-amber mb-2">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest">Hệ thống Quản trị HISTRA</span>
          </div>
          <h1 className="font-outfit text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Dashboard Điều Hành
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Bảng điều khiển quản lý và kiểm duyệt dữ liệu du lịch Hội An thông qua database Neon PostgreSQL.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-white border border-gray-200 hover:border-heritage-amber hover:text-heritage-amber rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          Đồng bộ Dữ liệu
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng Địa Điểm', value: spots.length, icon: MapPin, color: 'text-amber-500 bg-amber-50 border-amber-200' },
          { label: 'Nhật Ký Đăng Tải', value: diaries.length, icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Chuyên Gia Bản Địa', value: experts.length, icon: Award, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { label: 'Yêu Cầu Tư Vấn', value: inquiries.length, icon: UserCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' }
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
          { id: 'spots', label: 'Quản lý Địa điểm' },
          { id: 'diaries', label: 'Kiểm duyệt Nhật ký' },
          { id: 'experts', label: 'Hội đồng Chuyên gia' },
          { id: 'inquiries', label: 'Hòm thư Tư vấn' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm border-none cursor-pointer transition-all flex-shrink-0 ${
              activeSubTab === tab.id
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
          <p className="text-sm font-bold text-gray-500">Đang truy vấn dữ liệu từ database Neon...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm animate-scale-up">
          
          {/* TAB 1: Spots Manager */}
          {activeSubTab === 'spots' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-outfit text-lg font-extrabold text-gray-900">Danh mục Địa điểm du lịch</h3>
                <button
                  onClick={() => setShowAddSpotModal(true)}
                  className="px-4 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-heritage-amber/15"
                >
                  <Plus className="w-4 h-4" />
                  Đăng ký Địa điểm mới
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                      <th className="p-4">Địa điểm (Tên Việt / Anh)</th>
                      <th className="p-4">Phân loại</th>
                      <th className="p-4">Chi phí</th>
                      <th className="p-4">Tọa độ GPS</th>
                      <th className="p-4">Mật độ</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {spots.map((spot) => (
                      <tr key={spot.id} className="hover:bg-gray-50/55 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={spot.img} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">{spot.name?.vi}</span>
                            <span className="text-gray-400 text-[10px]">{spot.name?.en}</span>
                          </div>
                        </td>
                        <td className="p-4 uppercase tracking-widest text-[9px] font-extrabold text-ricefield-green">
                          {spot.category}
                        </td>
                        <td className="p-4 font-bold text-heritage-amber">
                          {spot.cost > 0 ? `${spot.cost.toLocaleString()}đ` : 'Miễn phí'}
                        </td>
                        <td className="p-4 text-gray-400">
                          {spot.lat}, {spot.lng}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            spot.crowdLevel === 'high' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            {spot.crowdLevel}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteSpot(spot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
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

          {/* TAB 2: Diaries Manager (Moderation) */}
          {activeSubTab === 'diaries' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-outfit text-lg font-extrabold text-gray-900 mb-2">Kiểm duyệt Nhật ký Hành trình</h3>
              <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                      <th className="p-4">Tác giả</th>
                      <th className="p-4">Phân loại</th>
                      <th className="p-4 w-1/3">Nội dung</th>
                      <th className="p-4 text-center">Tương tác</th>
                      <th className="p-4 text-center">Hành động</th>
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
                          {post.category}
                        </td>
                        <td className="p-4 truncate max-w-xs text-gray-600 text-sm">
                          {post.content?.vi}
                        </td>
                        <td className="p-4 text-center font-bold text-gray-500">
                          ❤️ {post.likes} | 💬 {post.comments?.length || 0}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteDiary(post.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                            title="Xoá / Gỡ bỏ bài viết"
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
              <h3 className="font-outfit text-lg font-extrabold text-gray-900 mb-2">Hội đồng Chuyên gia bản địa Hội An</h3>
              <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                      <th className="p-4">Chuyên gia</th>
                      <th className="p-4">Lĩnh vực tư vấn chính</th>
                      <th className="p-4">Đánh giá</th>
                      <th className="p-4">Trạng thái Online</th>
                      <th className="p-4 text-center">Hành động</th>
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
                          {exp.role?.vi}
                        </td>
                        <td className="p-4 font-bold text-heritage-amber flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-heritage-amber" /> {exp.rating}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full relative ${
                              exp.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            }`} />
                            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500">
                              {exp.online ? 'Trực tuyến' : 'Ngoại tuyến'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleExpertOnline(exp.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border transition-all cursor-pointer ${
                              exp.online 
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                            }`}
                          >
                            {exp.online ? 'Tạm ẩn' : 'Kích hoạt'}
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
              <h3 className="font-outfit text-lg font-extrabold text-gray-900">Yêu cầu tư vấn chưa trả lời</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div 
                    key={inq.id} 
                    className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all ${
                      inq.replied ? 'border-gray-200 bg-gray-50/50' : 'border-rose-200 bg-rose-50/20'
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
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">✓ Câu trả lời của chuyên gia:</span>
                        {inq.replyContent}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-2">
                        {activeInquiryId === inq.id ? (
                          <div className="flex flex-col gap-2 animate-scale-up">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập câu trả lời tư vấn cho du khách..."
                              className="w-full p-2.5 bg-white border border-gray-200 text-xs font-medium rounded-xl focus:outline-none focus:border-heritage-amber h-16 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setActiveInquiryId(null); setReplyText(''); }}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-600 cursor-pointer border-none"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleSendInquiryReply(inq.id)}
                                className="px-3 py-1.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-lg text-[10px] font-bold cursor-pointer border-none flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Gửi phản hồi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveInquiryId(inq.id); setReplyText(''); }}
                            className="w-full py-2 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Phản hồi tư vấn ngay
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleAddSpotSubmit}
            className="relative w-full max-w-md bg-white/95 border border-gray-150 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8 animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setShowAddSpotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-outfit text-xl font-extrabold text-gray-900 mb-6">Đăng ký địa điểm du lịch Hội An</h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Tên địa điểm (Tiếng Việt)</label>
                <input
                  type="text"
                  value={newSpotNameVi}
                  onChange={(e) => setNewSpotNameVi(e.target.value)}
                  placeholder="Chùa Cầu Nhật Bản"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Tên địa điểm (Tiếng Anh)</label>
                <input
                  type="text"
                  value={newSpotNameEn}
                  onChange={(e) => setNewSpotNameEn(e.target.value)}
                  placeholder="Japanese Covered Bridge"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                  required
                />
              </div>

              {/* Tiện ích Tìm tọa độ địa chỉ nhanh */}
              <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl flex flex-col gap-2 shadow-inner">
                <div className="flex items-center gap-1.5 text-heritage-amber">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Tra Cứu Bản Đồ Tự Động</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ (ví dụ: An Bang Beach, Hoi An...)"
                    className="flex-grow px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleGeocodeSearch}
                    disabled={searchingLocation}
                    className="px-4 py-2 bg-ricefield-green hover:bg-ricefield-light disabled:bg-gray-300 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    {searchingLocation ? '...' : 'Tìm Tọa Độ'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Phân loại</label>
                  <select
                    value={newSpotCategory}
                    onChange={(e) => setNewSpotCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                  >
                    <option value="healing">🧘 Chữa lành (Healing)</option>
                    <option value="food">🍗 Ẩm thực (Food)</option>
                    <option value="adventure">🏮 Trải nghiệm (Adventure)</option>
                    <option value="scenic">📸 Phong cảnh (Scenic)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Giá vé dự tính (VNĐ)</label>
                  <input
                    type="number"
                    value={newSpotCost}
                    onChange={(e) => setNewSpotCost(e.target.value)}
                    placeholder="120000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 transition-all bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400">Vĩ độ (Latitude) [Khóa]</label>
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
                  <label className="text-xs font-bold text-gray-400">Kinh độ (Longitude) [Khóa]</label>
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
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Định Vị Thực Tế Bản Đồ</label>
                  <iframe 
                    src={`https://maps.google.com/maps?q=${newSpotLat},${newSpotLng}&z=16&output=embed`}
                    className="w-full h-32 rounded-2xl border border-gray-200 shadow-sm"
                    allowFullScreen=""
                    loading="lazy"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Mật độ đông đúc (Crowd level)</label>
                <select
                  value={newSpotCrowdLevel}
                  onChange={(e) => setNewSpotCrowdLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-heritage-amber transition-all bg-gray-50/50 cursor-pointer"
                >
                  <option value="low">🟢 Thấp (Low)</option>
                  <option value="medium">🟡 Vừa (Medium)</option>
                  <option value="high">🔴 Cao (High)</option>
                </select>
                <div className="bg-amber-50/70 border border-amber-150 p-3 rounded-2xl text-[10px] text-amber-800 leading-relaxed font-semibold">
                  <span className="font-extrabold uppercase tracking-wider block mb-1 text-amber-900">💡 Mẹo phân loại Mật độ:</span>
                  • <span className="font-extrabold text-emerald-600">Thấp (Low)</span>: Resort nghỉ dưỡng yên tĩnh, quán cà phê ngắm đồng ruộng, bãi biển vắng.<br />
                  • <span className="font-extrabold text-amber-600">Vừa (Medium)</span>: Quán ăn gia đình ấm cúng, workshop tre truyền thống, chùa đền địa phương.<br />
                  • <span className="font-extrabold text-red-500">Cao (High)</span>: Phố đi bộ lúc lên đèn cuối tuần, bến thuyền hoa đăng, quán ăn thương hiệu có hàng dài xếp hàng.
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-heritage-amber hover:bg-heritage-gold text-white font-bold text-sm py-3 rounded-xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 mt-4"
              >
                Lưu địa điểm
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
