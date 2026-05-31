import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Bookmark, Share2, Send, CornerDownRight, Image as ImageIcon, Smile, MapPin, Award, Star, Compass, Hash, Sparkles, Trophy, CheckCircle, Flame, UserCheck, X } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import diaryService from '../../../services/diaryService';
import expertService from '../../../services/expertService';
import spotService from '../../../services/spotService';
import authService from '../../../services/authService';

export default function CommunityFeed() {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleSyncUser = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('auth-state-changed', handleSyncUser);
    return () => window.removeEventListener('auth-state-changed', handleSyncUser);
  }, []);

  // Danh sách chuyên gia lấy từ Backend
  const [experts, setExperts] = useState([]);

  // Custom interactive post settings
  const [postCategory, setPostCategory] = useState('healing');
  // store selected spot id (nullable)
  const [postLinkedSpot, setPostLinkedSpot] = useState(null);
  const [availableSpots, setAvailableSpots] = useState([]);
  const [activeTag, setActiveTag] = useState('all');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState(null);

  // Modals / Dialog alerts states
  const [showQuestSuccess, setShowQuestSuccess] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeExpert, setActiveExpert] = useState(null);
  const [expertMessageText, setExpertMessageText] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Ánh xạ đối tượng Nhật ký du ký từ Spring Boot sang kết cấu React Frontend
  const mapBackendDiaryToFrontend = (d) => {
    const commentsMap = {};
    const topLevelComments = [];

    if (d.comments) {
      d.comments.forEach(c => {
        commentsMap[c.id] = {
          id: c.id,
          userId: c.user ? c.user.id : null,
          userName: c.user ? c.user.fullName : 'Ẩn danh',
          userAvatar: c.user ? (c.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80') : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          content: { vi: c.content, en: c.content },
          replies: []
        };
      });

      d.comments.forEach(c => {
        if (c.parentCommentId && commentsMap[c.parentCommentId]) {
          commentsMap[c.parentCommentId].replies.push(commentsMap[c.id]);
        } else if (!c.parentCommentId && commentsMap[c.id]) {
          topLevelComments.push(commentsMap[c.id]);
        }
      });
    }

    return {
      id: d.id,
      authorId: d.user ? d.user.id : null,
      user: {
        name: d.user ? d.user.fullName : 'Traveler',
        avatar: d.user ? (d.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80') : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        badge: {
          vi: d.user && d.user.role === 'ADMIN' ? 'Chuyên Gia Bản Địa' : 'Thành viên Local',
          en: d.user && d.user.role === 'ADMIN' ? 'Local Expert' : 'Local Member'
        }
      },
      category: d.category || 'healing',
      spotName: d.spot ? (language === 'vi' ? d.spot.nameVi : d.spot.nameEn) : null,
      date: {
        vi: new Date(d.createdAt).toLocaleDateString('vi-VN') + ' (Live)',
        en: new Date(d.createdAt).toLocaleDateString('en-US') + ' (Live)'
      },
      content: {
        vi: d.contentVi,
        en: d.contentEn
      },
      images: d.imageUrl ? [d.imageUrl] : [],
      likes: d.likesCount || 0,
      hasLiked: false,
      hasSaved: false,
      comments: topLevelComments
    };
  };

  // Tải dữ liệu thật từ Spring Boot khi mở trang
  useEffect(() => {
    const fetchDiariesAndExperts = async () => {
      try {
        const diariesRes = await diaryService.getDiaries();
        if (diariesRes && diariesRes.success) {
          const mappedDiaries = diariesRes.data.map(mapBackendDiaryToFrontend);
          if (mappedDiaries.length > 0) {
            setPosts(mappedDiaries);
          }
        }
      } catch (e) {
        console.warn("Could not load diaries from backend, using default mock data:", e);
      }

      try {
        const expertsRes = await expertService.getExperts();
        if (expertsRes && expertsRes.success) {
          const mappedExperts = expertsRes.data.map((exp) => ({
            id: exp.id,
            name: exp.user.fullName,
            avatar: exp.user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            role: { vi: exp.expertise, en: exp.expertise },
            rating: exp.rating.toFixed(1),
            online: exp.isOnline
          }));
          if (mappedExperts.length > 0) {
            setExperts(mappedExperts);
          }
        }
      } catch (e) {
        console.warn("Could not load experts from backend, using default mock data:", e);
      }

      // Load spots for "Liên kết Địa điểm" dropdown
      try {
        const spotsRes = await spotService.getFeaturedSpots(12);
        if (spotsRes && spotsRes.success) {
          setAvailableSpots(spotsRes.data || []);
          if (spotsRes.data && spotsRes.data.length > 0 && postLinkedSpot == null) {
            setPostLinkedSpot(spotsRes.data[0].id);
          }
        }
      } catch (e) {
        console.warn("Could not load spots for diary dropdown:", e);
      }
    };

    fetchDiariesAndExperts();
  }, [language]);

  // Thả tim bài viết (Like) - Đồng bộ lên Server PostgreSQL
  const handleLike = async (postId) => {
    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    // Optimistic UI update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
          hasLiked: !post.hasLiked
        };
      }
      return post;
    }));

    try {
      await diaryService.likeDiary(postId);
    } catch (e) {
      console.warn("Could not register like on server:", e);
    }
  };

  // Lưu bài viết
  const handleSave = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasSaved: !post.hasSaved
        };
      }
      return post;
    }));
  };

  // Đăng bài viết nhật ký du ký mới - Gửi Multipart Form lên Cloudflare Images API
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', currentUser.id.toString());
      formData.append('category', postCategory);
      formData.append('contentVi', newPostText);
      formData.append('contentEn', newPostText);
      if (postLinkedSpot) {
        formData.append('spotId', postLinkedSpot.toString());
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await diaryService.createDiary(formData);

      if (response && response.success) {
        const newDiary = mapBackendDiaryToFrontend(response.data);
        setPosts([newDiary, ...posts]);
        setNewPostText('');
        setSelectedImage(null);
        setImagePreview('');
      } else {
        alert("Đăng tải bài viết thất bại!");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert(language === 'vi' ? 'Lỗi khi đăng bài viết' : 'Error posting diary');
    }
  };

  // Đăng bình luận lồng nhau dưới bài viết - Kết nối Spring Boot
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    try {
      const response = await diaryService.addComment(postId, currentUser.id, text);

      if (response && response.success) {
        const c = response.data;
        const newComment = {
          id: c.id,
          userId: c.user ? c.user.id : (currentUser?.id || null),
          userName: c.user ? c.user.fullName : (currentUser?.fullName || 'Ẩn danh'),
          userAvatar: c.user ? (c.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80') : (currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'),
          content: { vi: c.content, en: c.content },
          replies: []
        };

        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment]
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      alert(language === 'vi' ? 'Lỗi khi thêm bình luận' : 'Error adding comment');
    }

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // Đăng bình luận con
  const handleAddReply = (postId, commentId) => {
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const nextComments = post.comments.map(c => {
          if (c.id === commentId) {
            const newReply = {
              id: `r_new_${Date.now()}`,
              userId: currentUser?.id || null,
              userName: currentUser?.fullName || (language === 'vi' ? 'Bạn' : 'You'),
              userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
              content: { vi: text, en: text }
            };
            return {
              ...c,
              replies: [...c.replies, newReply]
            };
          }
          return c;
        });
        return {
          ...post,
          comments: nextComments
        };
      }
      return post;
    }));

    setReplyInputs({ ...replyInputs, [commentId]: '' });
    setActiveReplyBoxId(null);
  };

  const handleOpenExpertChat = (expert) => {
    setActiveExpert(expert);
    setExpertMessageText('');
    setMessageSuccess(false);
    setShowChatModal(true);
  };

  // Gửi câu hỏi tư vấn trực tuyến tới Chuyên gia - Kết nối Spring Boot
  const handleSendExpertMessage = async () => {
    if (!expertMessageText.trim() || !activeExpert) return;

    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    try {
      const response = await expertService.sendInquiry(activeExpert.id, currentUser.id, expertMessageText);

      if (response && response.success) {
        setMessageSuccess(true);
        setTimeout(() => {
          setShowChatModal(false);
        }, 1800);
      }
    } catch (e) {
      console.error("Error sending expert inquiry:", e);
      // Fallback
      setMessageSuccess(true);
      setTimeout(() => {
        setShowChatModal(false);
      }, 1800);
    }
  };

  // Filter posts by tag
  const filteredPosts = activeTag === 'all'
    ? posts
    : posts.filter(p => p.category === activeTag);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* Visual Title Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber px-4 py-1.5 rounded-full text-xs font-semibold animate-float">
          <Sparkles className="w-4 h-4 animate-spin-slow text-heritage-gold" />
          Hội An Memory Diaries
        </div>
        <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          {t('socialTitle')}
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm max-w-xl">
          {t('socialDesc')}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4">
        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('communityTags')}:</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: t('all'), icon: Compass },
            { id: 'food', label: t('tagFood'), icon: Star },
            { id: 'adventure', label: t('tagAdventure'), icon: Trophy },
            { id: 'healing', label: t('tagHealing'), icon: Sparkles },
            { id: 'scenic', label: t('tagScenic'), icon: MapPin }
          ].map((tag) => {
            const TagIcon = tag.icon;
            const isActive = activeTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all duration-300 cursor-pointer flex-shrink-0 hover:-translate-y-0.5 shimmer-trigger ${isActive
                  ? 'bg-heritage-amber border-heritage-amber text-white shadow-md shadow-heritage-amber/15 scale-[1.02]'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                  }`}
              >
                <TagIcon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Layout: Posts Column (8) vs Local Guide Sidebar (4) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Main social posts Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Advanced Local Diary Composer */}
          <form
            onSubmit={handleCreatePost}
            className="bg-gradient-to-tr from-[#FAF9F5] to-white border border-heritage-gold/20 p-5 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden shimmer-trigger animate-fade-in-up [animation-delay:100ms]"
          >
            {/* Subtle light overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-amber/5 rounded-full blur-3xl" />

            <div className="flex gap-3 relative z-10">
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                alt="My Avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-heritage-amber"
              />
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={t('postPlaceholder')}
                className="flex-grow bg-white/80 border border-gray-200 text-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-heritage-amber resize-none h-20 placeholder-gray-400 shadow-inner"
              />
            </div>

            {/* Custom tagging parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/50 border border-gray-150 p-3 rounded-xl relative z-10">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{t('diaryCategory')}</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
                >
                  <option value="healing">🧘 {t('tagHealing')}</option>
                  <option value="food">🍗 {t('tagFood')}</option>
                  <option value="adventure">🏮 {t('tagAdventure')}</option>
                  <option value="scenic">📸 {t('tagScenic')}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{language === 'vi' ? 'Liên kết Địa điểm' : 'Link Destination'}</label>
                <select
                  value={postLinkedSpot || ''}
                  onChange={(e) => setPostLinkedSpot(e.target.value ? Number(e.target.value) : null)}
                  className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
                >
                  <option value="">{language === 'vi' ? 'Không liên kết' : 'No link'}</option>
                  {availableSpots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameVi ? `${language === 'vi' ? s.nameVi : s.nameEn}` : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Image Preview with close trigger */}
            {imagePreview && (
              <div className="relative w-32 h-20 border border-gray-150 rounded-xl overflow-hidden shadow-inner group relative z-10 animate-scale-up">
                <img src={imagePreview} className="w-full h-full object-cover animate-fade-in" />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(''); }}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-all cursor-pointer border-none flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-gray-100 pt-3 relative z-10">
              <div className="flex gap-2">
                <label className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer bg-white border-none flex items-center justify-center select-none">
                  <ImageIcon className="w-5 h-5 text-ricefield-green" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button type="button" className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer bg-white border-none">
                  <Smile className="w-5 h-5 text-heritage-amber" />
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-md shadow-heritage-amber/10 hover:scale-[1.02] active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                {t('postButton')}
              </button>
            </div>
          </form>

          {/* Social feed list items */}
          <div className="flex flex-col gap-6">
            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 p-12 rounded-2xl text-center text-gray-400 animate-scale-up">
                <Compass className="w-8 h-8 mx-auto mb-2 opacity-50 animate-float" />
                <p className="text-xs font-semibold">{language === 'vi' ? 'Không tìm thấy nhật ký du lịch phù hợp.' : 'No matching diaries found.'}</p>
              </div>
            ) : (
              filteredPosts.map((post, idx) => (
                <article
                  key={post.id}
                  className={`bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col p-5 gap-4 shadow-sm hover:shadow-md hover:border-heritage-gold/30 transition-all duration-300 group shimmer-trigger animate-fade-in-up`}
                  style={{ animationDelay: `${(idx + 1) * 150}ms` }}
                >

                  {/* Post Header */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex gap-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-outfit text-sm font-bold text-gray-900 group-hover:text-heritage-amber transition-colors">{post.user.name}</span>
                          <span className="text-[9px] bg-ricefield-green/10 text-ricefield-green font-extrabold px-2 py-0.5 rounded-full border border-ricefield-green/20">
                            {post.user.badge[language]}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">{post.date[language]}</span>
                      </div>
                    </div>

                    {/* Visual Category Badge pill */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border leading-none ${post.category === 'food'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : post.category === 'adventure'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : post.category === 'scenic'
                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-green-50 text-ricefield-green border-ricefield-green/20'
                        }`}>
                        {post.category === 'food'
                          ? t('tagFood')
                          : post.category === 'adventure'
                            ? t('tagAdventure')
                            : post.category === 'scenic'
                              ? t('tagScenic')
                              : t('tagHealing')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Content body text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium relative z-10">
                    {post.content[language]}
                  </p>

                  {/* Optional Linked Spot Badge */}
                  {post.spotName && (
                    <div className="inline-flex self-start items-center gap-1.5 bg-gray-50 border border-gray-150 p-2 rounded-xl text-[10.5px] font-bold text-gray-700 shadow-sm relative z-10 hover:scale-[1.03] transition-transform">
                      <MapPin className="w-3.5 h-3.5 text-heritage-amber animate-pulse" />
                      <span>{language === 'vi' ? 'Địa điểm' : 'Place'}:</span>
                      <span className="text-heritage-amber font-extrabold">{post.spotName}</span>
                    </div>
                  )}

                  {/* Images attachments */}
                  {post.images && post.images.length > 0 && (
                    <div className="w-full h-64 overflow-hidden rounded-xl border border-gray-200 relative bg-gray-50 z-10">
                      <img
                        src={post.images[0]}
                        alt="Post Attach"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Bottom Action indicators */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500 relative z-10">

                    {/* Likes */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-gray-800 transition-all cursor-pointer bg-white border-none ${post.hasLiked ? 'text-red-500 hover:text-red-600 font-bold scale-[1.05]' : ''
                        }`}
                    >
                      <Heart className={`w-4 h-4 transition-transform duration-300 active:scale-150 ${post.hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{post.likes} {t('likeStat')}</span>
                    </button>

                    {/* Comments trigger */}
                    <button
                      onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-gray-800 transition-colors cursor-pointer bg-white border-none font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                      <span>{post.comments.length} {t('commentStat')}</span>
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleSave(post.id)}
                      className={`flex items-center gap-1.5 hover:text-gray-800 transition-colors cursor-pointer bg-white border-none ${post.hasSaved ? 'text-heritage-amber font-bold scale-[1.02]' : ''
                        }`}
                    >
                      <Bookmark className={`w-4 h-4 transition-transform ${post.hasSaved ? 'fill-heritage-amber text-heritage-amber' : 'text-gray-400'}`} />
                      <span>{post.hasSaved ? t('savedStat') : t('saveStat')}</span>
                    </button>
                  </div>

                  {/* Comment Thread */}
                  {openCommentsPostId === post.id && (
                    <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-4 bg-gray-50 p-4 rounded-xl relative z-10 animate-fade-in">
                      <h4 className="font-outfit text-xs font-bold text-gray-900 tracking-wide uppercase">{t('commentTitle')}</h4>

                      {/* Top Level Comments List */}
                      <div className="flex flex-col gap-4">
                        {post.comments.length === 0 ? (
                          <span className="text-[11px] text-gray-400 font-semibold">{t('noComments')}</span>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="flex flex-col gap-2 bg-white border border-gray-200/80 p-3 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                              {/* Comment Header */}
                              <div className="flex gap-2.5 items-center">
                                <img
                                  src={comment.userAvatar}
                                  alt={comment.userName}
                                  className="w-7 h-7 rounded-full object-cover border border-gray-100"
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11.5px] font-bold text-gray-900 leading-none">{comment.userName}</span>
                                    {post.authorId && comment.userId && post.authorId === comment.userId && (
                                      <span className="text-[8px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                        {language === 'vi' ? 'Tác giả' : 'Author'}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-gray-400 mt-0.5">{language === 'vi' ? 'Vừa xong' : 'Just now'}</span>
                                </div>
                              </div>

                              {/* Comment content */}
                              <p className="text-[12px] text-gray-700 leading-relaxed pl-9">
                                {comment.content[language]}
                              </p>

                              {/* Nested Replies Rendering */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="pl-9 mt-2 flex flex-col gap-2 border-l border-gray-200">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex gap-2 items-start mt-1 p-2 bg-gray-50 rounded-lg animate-fade-in">
                                      <CornerDownRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                      <img
                                        src={reply.userAvatar}
                                        alt={reply.userName}
                                        className="w-5.5 h-5.5 rounded-full object-cover border border-gray-150"
                                      />
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-bold text-gray-900 leading-none">{reply.userName}</span>
                                          {post.authorId && reply.userId && post.authorId === reply.userId && (
                                            <span className="text-[7.5px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                              {language === 'vi' ? 'Tác giả' : 'Author'}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                                          {reply.content[language]}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply trigger input */}
                              <div className="pl-9 mt-2">
                                {activeReplyBoxId === comment.id ? (
                                  <div className="flex gap-2 items-center animate-fade-in">
                                    <input
                                      type="text"
                                      value={replyInputs[comment.id] || ''}
                                      onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                      placeholder={t('replyPlaceholder')}
                                      className="flex-grow bg-white border border-gray-200 text-xs text-gray-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-heritage-amber"
                                    />
                                    <button
                                      onClick={() => handleAddReply(post.id, comment.id)}
                                      className="px-3 py-1 bg-ricefield-green hover:bg-ricefield-light text-white font-bold text-[10px] rounded-lg cursor-pointer border-none shadow-sm transition-colors"
                                    >
                                      {t('replyButton')}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setActiveReplyBoxId(comment.id)}
                                    className="text-[10px] text-gray-400 hover:text-heritage-amber font-bold cursor-pointer bg-transparent border-none"
                                  >
                                    {t('replyTrigger')}
                                  </button>
                                )}
                              </div>

                            </div>
                          ))
                        )}
                      </div>

                      {/* Create top-level comment Input */}
                      <div className="flex gap-2 items-center border-t border-gray-200 pt-3">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder={t('commentPlaceholder')}
                          className="flex-grow bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-heritage-amber placeholder-gray-400 shadow-inner"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-xl flex items-center justify-center cursor-pointer border-none shadow-sm transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  )}

                </article>
              ))
            )}
          </div>

        </div>

        {/* Local Expert Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Daily Cultural Quest Card with Shimmer trigger */}
          <div className="bg-gradient-to-tr from-amber-500 to-heritage-amber text-white p-5 rounded-3xl shadow-lg shadow-heritage-amber/10 flex flex-col gap-4 relative overflow-hidden shimmer-trigger animate-fade-in-up [animation-delay:200ms]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

            <div className="flex items-center gap-2 border-b border-white/20 pb-2.5 relative z-10">
              <div className="bg-white/20 p-2 rounded-xl text-white animate-float">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-outfit text-sm font-extrabold text-white tracking-wide uppercase">
                {t('challengeTitle')}
              </h3>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <p className="text-[12px] text-white/95 leading-relaxed font-semibold">
                "{t('challengeQuest')}"
              </p>
              <div className="bg-white/15 border border-white/10 p-3 rounded-2xl mt-1 flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/80">{language === 'vi' ? 'Phần thưởng AI' : 'AI Reward'}:</span>
                <span className="text-[10.5px] font-bold text-amber-200">{t('challengeReward')}</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestSuccess(true)}
              className="w-full py-2.5 bg-white hover:bg-gray-50 text-heritage-amber font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer border-none relative z-10"
            >
              <Award className="w-4 h-4 animate-bounce" />
              {t('participate')}
            </button>
          </div>

          {/* Featured Local Experts Spotlight - Apple Shimmer */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger animate-fade-in-up [animation-delay:300ms]">
            <h3 className="font-outfit text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-1.5 relative z-10">
              <UserCheck className="w-4 h-4 text-heritage-amber" />
              {t('localExperts')}
            </h3>

            <div className="flex flex-col gap-4 relative z-10">
              {experts.map((expert, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-heritage-gold/20 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="relative">
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    {expert.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate leading-tight">{expert.name}</h4>
                    <span className="text-[9px] text-gray-400 block truncate mt-0.5">{expert.role[language]}</span>
                    <div className="flex items-center gap-1 text-[10px] text-heritage-gold font-bold mt-1">
                      <Star className="w-3 h-3 fill-heritage-gold text-heritage-gold" />
                      <span>{expert.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenExpertChat(expert)}
                    className="p-2 bg-white hover:bg-heritage-amber/10 border border-gray-200 hover:border-heritage-amber text-gray-500 hover:text-heritage-amber rounded-lg transition-colors cursor-pointer"
                    title={t('askExpert')}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Trending Hashtags */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger animate-fade-in-up [animation-delay:400ms]">
            <h3 className="font-outfit text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-1.5 relative z-10">
              <Flame className="w-4 h-4 text-orange-500" />
              {t('trendingHashtags')}
            </h3>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { tag: '#FeFeRicefield', views: '12.4k views', status: 'hot' },
                { tag: '#BanhMiPhuongTrueLocal', views: '8.5k views', status: 'rising' },
                { tag: '#LanternCraftGuild', views: '6.2k views', status: 'new' },
                { tag: '#ChamIslandCorals', views: '4.8k views', status: 'rising' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs group cursor-pointer hover:translate-x-0.5 transition-transform duration-200">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400 group-hover:text-heritage-amber transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-heritage-amber transition-colors">{item.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold">{item.views}</span>
                    {item.status === 'hot' && (
                      <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1 rounded font-bold uppercase scale-90">Hot</span>
                    )}
                    {item.status === 'rising' && (
                      <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1 rounded font-bold uppercase scale-90">Rising</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CULTURAL QUEST ACCEPTED MODAL */}
      {showQuestSuccess && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-sm w-full flex flex-col items-center text-center gap-4 shadow-2xl animate-scale-up">
            <div className="p-3 bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber rounded-full animate-float">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-outfit text-base font-extrabold text-gray-900">{language === 'vi' ? 'Quest Đã Nhận!' : 'Quest Accepted!'}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-semibold">
                {language === 'vi'
                  ? 'Hãy ghé thăm Chùa Cầu vào sáng sớm mai, chụp một bức ảnh đẹp và tải lên bài viết (chọn tag Góc chụp ảnh đẹp) để nhận Voucher Đèn Lồng 50k nhé!'
                  : 'Visit the Covered Bridge tomorrow morning, take a beautiful photo, and publish a post (select Scenic tag) to claim your 50k Voucher!'}
              </p>
            </div>
            <button
              onClick={() => setShowQuestSuccess(false)}
              className="w-full py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/10 transition-colors"
            >
              {language === 'vi' ? 'Tôi đã hiểu!' : 'Got it!'}
            </button>
          </div>
        </div>
      )}

      {/* QUICK EXPERT CHAT DIALOG */}
      {showChatModal && activeExpert && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 p-5 rounded-3xl max-w-md w-full flex flex-col gap-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-150 pb-3">
              <div className="flex gap-2.5 items-center">
                <img
                  src={activeExpert.avatar}
                  alt={activeExpert.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800 leading-tight">{activeExpert.name}</h4>
                  <span className="text-[9px] text-green-500 font-bold tracking-wide uppercase flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {messageSuccess ? (
              <div className="flex flex-col items-center text-center p-6 gap-3 animate-fade-in">
                <CheckCircle className="w-10 h-10 text-ricefield-green" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800">{language === 'vi' ? 'Đã gửi câu hỏi!' : 'Question Sent!'}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    {language === 'vi'
                      ? 'Chuyên gia bản địa sẽ phản hồi tin nhắn của bạn trong vòng ít phút thông qua hộp thư đến.'
                      : 'The local guide will respond to your query shortly via your inbox.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] text-gray-500 leading-relaxed italic bg-gray-50 p-3 rounded-xl border border-gray-150">
                  {language === 'vi'
                    ? `Chào bạn! Mình có thể tư vấn tất cả kinh nghiệm local về các dịch vụ di chuyển, ẩm thực hay nghề thủ công truyền thống ở Hội An. Hãy để lại câu hỏi bên dưới nhé!`
                    : `Hello! I can advise on all local guides regarding dining, transport, or traditional craft workshops in Hoi An. Leave your question below!`
                  }
                </p>
                <textarea
                  value={expertMessageText}
                  onChange={(e) => setExpertMessageText(e.target.value)}
                  placeholder={language === 'vi' ? 'Nhập câu hỏi của bạn tại đây...' : 'Type your question here...'}
                  className="bg-white border border-gray-200 text-xs text-gray-800 rounded-xl p-3 h-24 resize-none focus:outline-none focus:border-heritage-amber placeholder-gray-450 shadow-inner"
                />
                <button
                  onClick={handleSendExpertMessage}
                  className="w-full py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/10 transition-colors"
                >
                  {language === 'vi' ? 'Gửi Câu Hỏi' : 'Submit Question'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
<div className="flex items-center gap-1 text-[10px] text-heritage-gold font-bold mt-1">
  <Star className="w-3 h-3 fill-heritage-gold text-heritage-gold" />
  <span>{expert.rating}</span>
</div>
                  </div >
  <button
    onClick={() => handleOpenExpertChat(expert)}
    className="p-2 bg-white hover:bg-heritage-amber/10 border border-gray-200 hover:border-heritage-amber text-gray-500 hover:text-heritage-amber rounded-lg transition-colors cursor-pointer"
    title={t('askExpert')}
  >
    <MessageSquare className="w-3.5 h-3.5" />
  </button>
                </div >
              ))}
            </div >
          </div >

  {/* Hot Trending Hashtags */ }
  < div className = "bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm shimmer-trigger animate-fade-in-up [animation-delay:400ms]" >
            <h3 className="font-outfit text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-1.5 relative z-10">
              <Flame className="w-4 h-4 text-orange-500" />
              {t('trendingHashtags')}
            </h3>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { tag: '#FeFeRicefield', views: '12.4k views', status: 'hot' },
                { tag: '#BanhMiPhuongTrueLocal', views: '8.5k views', status: 'rising' },
                { tag: '#LanternCraftGuild', views: '6.2k views', status: 'new' },
                { tag: '#ChamIslandCorals', views: '4.8k views', status: 'rising' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs group cursor-pointer hover:translate-x-0.5 transition-transform duration-200">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400 group-hover:text-heritage-amber transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-heritage-amber transition-colors">{item.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold">{item.views}</span>
                    {item.status === 'hot' && (
                      <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1 rounded font-bold uppercase scale-90">Hot</span>
                    )}
                    {item.status === 'rising' && (
                      <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1 rounded font-bold uppercase scale-90">Rising</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div >

        </div >
</div >
      </div >


  {/* CULTURAL QUEST ACCEPTED MODAL */ }
{
  showQuestSuccess && (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-sm w-full flex flex-col items-center text-center gap-4 shadow-2xl animate-scale-up">
        <div className="p-3 bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber rounded-full animate-float">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-outfit text-base font-extrabold text-gray-900">{language === 'vi' ? 'Quest Đã Nhận!' : 'Quest Accepted!'}</h3>
          <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-semibold">
            {language === 'vi'
              ? 'Hãy ghé thăm Chùa Cầu vào sáng sớm mai, chụp một bức ảnh đẹp và tải lên bài viết (chọn tag Góc chụp ảnh đẹp) để nhận Voucher Đèn Lồng 50k nhé!'
              : 'Visit the Covered Bridge tomorrow morning, take a beautiful photo, and publish a post (select Scenic tag) to claim your 50k Voucher!'}
          </p>
        </div>
        <button
          onClick={() => setShowQuestSuccess(false)}
          className="w-full py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/10 transition-colors"
        >
          {language === 'vi' ? 'Tôi đã hiểu!' : 'Got it!'}
        </button>
      </div>
    </div>
  )
}

{/* QUICK EXPERT CHAT DIALOG */ }
{
  showChatModal && activeExpert && (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 p-5 rounded-3xl max-w-md w-full flex flex-col gap-4 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center border-b border-gray-150 pb-3">
          <div className="flex gap-2.5 items-center">
            <img
              src={activeExpert.avatar}
              alt={activeExpert.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 leading-tight">{activeExpert.name}</h4>
              <span className="text-[9px] text-green-500 font-bold tracking-wide uppercase flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowChatModal(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {messageSuccess ? (
          <div className="flex flex-col items-center text-center p-6 gap-3 animate-fade-in">
            <CheckCircle className="w-10 h-10 text-ricefield-green" />
            <div>
              <h4 className="text-xs font-extrabold text-gray-800">{language === 'vi' ? 'Đã gửi câu hỏi!' : 'Question Sent!'}</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                {language === 'vi'
                  ? 'Chuyên gia bản địa sẽ phản hồi tin nhắn của bạn trong vòng ít phút thông qua hộp thư đến.'
                  : 'The local guide will respond to your query shortly via your inbox.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-gray-500 leading-relaxed italic bg-gray-50 p-3 rounded-xl border border-gray-150">
              {language === 'vi'
                ? `Chào bạn! Mình có thể tư vấn tất cả kinh nghiệm local về các dịch vụ di chuyển, ẩm thực hay nghề thủ công truyền thống ở Hội An. Hãy để lại câu hỏi bên dưới nhé!`
                : `Hello! I can advise on all local guides regarding dining, transport, or traditional craft workshops in Hoi An. Leave your question below!`
              }
            </p>
            <textarea
              value={expertMessageText}
              onChange={(e) => setExpertMessageText(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập câu hỏi của bạn tại đây...' : 'Type your question here...'}
              className="bg-white border border-gray-200 text-xs text-gray-800 rounded-xl p-3 h-24 resize-none focus:outline-none focus:border-heritage-amber placeholder-gray-450 shadow-inner"
            />
            <button
              onClick={handleSendExpertMessage}
              className="w-full py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/10 transition-colors"
            >
              {language === 'vi' ? 'Gửi Câu Hỏi' : 'Submit Question'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

    </div >
  );
}
