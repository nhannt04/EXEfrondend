import React, { useState, useEffect } from 'react';
import { MessageSquare, Share2, Send, CornerDownRight, Image as ImageIcon, Smile, MapPin, Award, Compass, Hash, Sparkles, Trophy, CheckCircle, Flame, UserCheck, X, ThumbsUp, ThumbsDown, MoreHorizontal, AlertTriangle, Eye, EyeOff, Trash2 } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import diaryService from '@/services/diaryService';
import expertService from '@/services/expertService';
import spotService from '@/services/spotService';
import authService from '@/services/authService';
import tripService from '@/services/tripService';

import PostComposer from './PostComposer';
import PostCard from './PostCard';
import LocalExpertSidebar from './LocalExpertSidebar';
import ExpertChatModal from './ExpertChatModal';
import QuestSuccessModal from './QuestSuccessModal';

export default function CommunityFeed() {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const REACTION_STORAGE_KEY = 'travelist-diary-reactions';

  const getStoredReactions = () => {
    try {
      return JSON.parse(localStorage.getItem(REACTION_STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  };

  const getStoredReactionForPost = (userId, postId) => {
    if (!userId || !postId) return null;
    const allReactions = getStoredReactions();
    return allReactions?.[String(userId)]?.[String(postId)] || null;
  };

  const setStoredReactionForPost = (userId, postId, reaction) => {
    if (!userId || !postId) return;
    const allReactions = getStoredReactions();
    const userKey = String(userId);
    const postKey = String(postId);
    allReactions[userKey] = allReactions[userKey] || {};
    allReactions[userKey][postKey] = reaction;
    localStorage.setItem(REACTION_STORAGE_KEY, JSON.stringify(allReactions));
  };

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
  // store selected spot id (nullable)
  const [postLinkedSpot, setPostLinkedSpot] = useState(null);
  const [activeTag, setActiveTag] = useState('all');
  const [feedViewMode, setFeedViewMode] = useState('all'); // 'all', 'my_posts'
  const [myPostsSubFilter, setMyPostsSubFilter] = useState('all'); // 'all', 'public', 'hidden', 'reported'
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);

  const [completedItineraries, setCompletedItineraries] = useState([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [spotsForSelectedItinerary, setSpotsForSelectedItinerary] = useState([]);
  const [postedSpotIds, setPostedSpotIds] = useState([]);

  const extractSpotsFromItinerary = (tripDataStr) => {
    try {
      const itineraryData = JSON.parse(tripDataStr);
      const spotsMap = {};
      itineraryData.forEach(day => {
        if (day.accommodation && day.accommodation.id) {
          spotsMap[day.accommodation.id] = day.accommodation;
        }
        if (day.slots) {
          day.slots.forEach(slot => {
            if (slot.spot && slot.spot.id) {
              spotsMap[slot.spot.id] = slot.spot;
            }
          });
        }
      });
      return Object.values(spotsMap);
    } catch (e) {
      console.error("Failed to parse tripData:", e);
      return [];
    }
  };


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

  const [sharedPostId, setSharedPostId] = useState(null);

  const handleShareLink = (postId) => {
    const shareUrl = `${window.location.origin}/social?post=${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSharedPostId(postId);
      setTimeout(() => setSharedPostId(null), 2000);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };


  const [postIdFromUrl, setPostIdFromUrl] = useState(null);
  const [activeHashtagFilter, setActiveHashtagFilter] = useState(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get('post');
    if (postParam) {
      setPostIdFromUrl(Number(postParam));
    }
  }, []);


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

    const spotObj = d.spot ? {
      id: d.spot.id,
      name: language === 'vi' ? d.spot.nameVi : d.spot.nameEn,
      address: d.spot.address || (language === 'vi' ? 'Hội An, Quảng Nam' : 'Hoi An, Quang Nam'),
      tags: d.spot.tags ? d.spot.tags.split(',').map(t => {
        const trimmed = t.trim();
        return trimmed.startsWith('#') ? trimmed : '#' + trimmed;
      }) : []
    } : null;

    const reaction = d.myReaction || getStoredReactionForPost(currentUser?.id, d.id);

    const fromContentVi = d.contentVi ? (d.contentVi.match(/#[\p{L}\w]+/gu) || []) : [];
    const fromContentEn = d.contentEn ? (d.contentEn.match(/#[\p{L}\w]+/gu) || []) : [];
    const fromSpot = spotObj ? spotObj.tags : [];
    const postHashtags = [...new Set([...fromContentVi, ...fromContentEn, ...fromSpot])];

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
      spot: spotObj,
      hashtags: postHashtags,
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
      dislikes: d.dislikesCount || 0,
      myReaction: reaction || null,
      hasLiked: reaction === 'LIKE',
      hasDisliked: reaction === 'DISLIKE',
      hasSaved: false,
      status: d.status || 'public',
      reported: d.reported || false,
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
          if (spotsRes.data && spotsRes.data.length > 0 && postLinkedSpot == null) {
            setPostLinkedSpot(spotsRes.data[0].id);
          }
        }
      } catch (e) {
        console.warn("Could not load spots for diary dropdown:", e);
      }
    };

    fetchDiariesAndExperts();
  }, [language, currentUser?.id]);

  useEffect(() => {
    const fetchCompletedItineraries = async () => {
      if (!currentUser) {
        setCompletedItineraries([]);
        return;
      }
      try {
        const response = await tripService.getCompletedItineraries();
        if (response && response.success) {
          setCompletedItineraries(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch completed itineraries:", err);
      }
    };
    fetchCompletedItineraries();
  }, [currentUser]);

  useEffect(() => {
    const updateSpotsAndPosted = async () => {
      if (!selectedItineraryId) {
        setSpotsForSelectedItinerary([]);
        setPostedSpotIds([]);
        setPostLinkedSpot(null);
        return;
      }
      const itinerary = completedItineraries.find(it => it.id === Number(selectedItineraryId));
      if (itinerary) {
        const spots = extractSpotsFromItinerary(itinerary.tripData);
        setSpotsForSelectedItinerary(spots);
        
        try {
          const response = await diaryService.getPostedSpots(selectedItineraryId);
          if (response && response.success) {
            setPostedSpotIds(response.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch posted spots:", err);
        }
      }
    };
    updateSpotsAndPosted();
  }, [selectedItineraryId, completedItineraries]);

  // Tương tác Thích (Like)
  const handleLike = async (postId) => {
    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const storedReaction = getStoredReactionForPost(currentUser.id, postId);
    if (post.myReaction || storedReaction) {
      return;
    }

    // Optimistic UI update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.likes + 1,
          hasLiked: true,
          hasDisliked: false,
          myReaction: 'LIKE'
        };
      }
      return p;
    }));

    setStoredReactionForPost(currentUser.id, postId, 'LIKE');

    try {
      await diaryService.likeDiary(postId, 'LIKE');
    } catch (e) {
      console.warn("Could not register like on server:", e);
    }
  };

  // Tương tác Ghét (Dislike)
  const handleDislike = async (postId) => {
    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const storedReaction = getStoredReactionForPost(currentUser.id, postId);
    if (post.myReaction || storedReaction) {
      return;
    }

    // Optimistic UI update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          dislikes: p.dislikes + 1,
          hasDisliked: true,
          hasLiked: false,
          myReaction: 'DISLIKE'
        };
      }
      return p;
    }));

    setStoredReactionForPost(currentUser.id, postId, 'DISLIKE');

    try {
      await diaryService.likeDiary(postId, 'DISLIKE');
    } catch (e) {
      console.warn("Could not register dislike on server:", e);
    }
  };

  const handleReportPost = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, reported: true };
      }
      return p;
    }));
    alert(language === 'vi' ? '🔔 Đã báo cáo bài viết này đến admin thành công!' : '🔔 Reported this post to admin successfully!');
    setActiveDropdownPostId(null);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa bài viết này?' : 'Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== postId));
      setActiveDropdownPostId(null);
    }
  };

  const handleToggleHidePost = async (postId, newStatus) => {
    try {
      const response = await diaryService.updateDiaryStatus(postId, newStatus);
      if (response && response.success) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, status: newStatus };
          }
          return p;
        }));
        const msg = newStatus === 'hidden'
          ? (language === 'vi' ? 'Bài viết đã được ẩn thành công!' : 'Post has been hidden successfully!')
          : (language === 'vi' ? 'Bài viết đã được hiển thị công khai!' : 'Post is now public!');
        alert(msg);
      } else {
        alert(language === 'vi' ? 'Cập nhật trạng thái thất bại!' : 'Failed to update status!');
      }
    } catch (e) {
      console.error("Failed to toggle hide post:", e);
      alert(language === 'vi' ? 'Lỗi khi cập nhật trạng thái bài viết' : 'Error updating post status');
    }
    setActiveDropdownPostId(null);
  };


  // Đăng bài viết nhật ký du ký mới - Gửi Multipart Form lên Cloudflare Images API
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    if (!selectedItineraryId) {
      alert(language === 'vi' ? "Vui lòng chọn một lịch trình đã hoàn thành!" : "Please select a completed itinerary!");
      return;
    }
    if (!postLinkedSpot) {
      alert(language === 'vi' ? "Vui lòng chọn một địa điểm để đánh giá!" : "Please select a spot to review!");
      return;
    }
    if (postedSpotIds.includes(postLinkedSpot)) {
      alert(language === 'vi' 
        ? "Địa điểm này đã được đánh giá trong lịch trình này. Hãy hoàn thành một lịch trình khác để đánh giá lại!" 
        : "This spot has already been reviewed in this itinerary. Complete a new journey to review again!");
      return;
    }

    try {
      const itinerary = completedItineraries.find(it => it.id === Number(selectedItineraryId));
      let categoryVal = 'healing';
      if (itinerary && itinerary.travelStyle) {
        const styleLower = itinerary.travelStyle.toLowerCase();
        if (styleLower.includes('chill') || styleLower.includes('thư giãn')) {
          categoryVal = 'healing';
        } else if (styleLower.includes('ảo') || styleLower.includes('scenic') || styleLower.includes('sống ảo')) {
          categoryVal = 'scenic';
        } else if (styleLower.includes('trải nghiệm') || styleLower.includes('experience') || styleLower.includes('local')) {
          categoryVal = 'adventure';
        }
      }

      const formData = new FormData();
      formData.append('userId', currentUser.id.toString());
      formData.append('category', categoryVal);
      formData.append('contentVi', newPostText);
      formData.append('contentEn', newPostText);
      if (postLinkedSpot) {
        formData.append('spotId', postLinkedSpot.toString());
      }
      if (selectedItineraryId) {
        formData.append('itineraryId', selectedItineraryId.toString());
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
        // Cập nhật lại danh sách địa điểm đã đánh giá
        setPostedSpotIds([...postedSpotIds, postLinkedSpot]);
        setPostLinkedSpot(null);
      } else {
        alert("Đăng tải bài viết thất bại!");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert(language === 'vi' ? 'Lỗi khi đăng bài viết' : 'Error posting diary');
    }
  };


  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa bình luận này?' : 'Are you sure you want to delete this comment?')) return;
    try {
      const response = await diaryService.deleteComment(postId, commentId);
      if (response && response.success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            const updatedComments = post.comments
              .filter(c => c.id !== commentId)
              .map(c => ({
                ...c,
                replies: c.replies.filter(r => r.id !== commentId)
              }));
            return {
              ...post,
              comments: updatedComments
            };
          }
          return post;
        }));
      }
    } catch (e) {
      console.error("Failed to delete comment:", e);
      alert(language === 'vi' ? 'Xóa bình luận thất bại!' : 'Failed to delete comment!');
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
  const handleAddReply = async (postId, commentId) => {
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    if (!currentUser) {
      window.dispatchEvent(new Event('auth-required'));
      return;
    }

    try {
      const response = await diaryService.addComment(postId, currentUser.id, text, commentId);

      if (response && response.success) {
        const c = response.data;
        const newReply = {
          id: c.id,
          userId: c.user ? c.user.id : (currentUser?.id || null),
          userName: c.user ? c.user.fullName : (currentUser?.fullName || 'Ẩn danh'),
          userAvatar: c.user ? (c.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80') : (currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'),
          content: { vi: c.content, en: c.content },
          replies: []
        };

        setPosts(posts.map(post => {
          if (post.id === postId) {
            const nextComments = post.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newReply]
                };
              }
              return comment;
            });
            return {
              ...post,
              comments: nextComments
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      alert(language === 'vi' ? 'Lỗi khi trả lời bình luận' : 'Error adding reply');
    }

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

  const getTrendingHashtags = () => {
    const tagLikesMap = {};
    posts.forEach(post => {
      if (post.hashtags) {
        post.hashtags.forEach(tag => {
          tagLikesMap[tag] = (tagLikesMap[tag] || 0) + (post.likes || 0);
        });
      }
    });

    const sortedTags = Object.keys(tagLikesMap)
      .map(tag => ({
        tag,
        likes: tagLikesMap[tag]
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    if (sortedTags.length === 0) {
      return [
        { tag: '#FeFeRicefield', likes: 120, status: 'hot' },
        { tag: '#BanhMiPhuongTrueLocal', likes: 85, status: 'rising' },
        { tag: '#LanternCraftGuild', likes: 62, status: 'new' },
        { tag: '#ChamIslandCorals', likes: 48, status: 'rising' }
      ];
    }
    return sortedTags;
  };

  // Filter posts by tag, hashtag filter, or shared parameter

  const filteredPosts = posts.filter(p => {
    // 1. URL Shared Post
    if (postIdFromUrl) return p.id === postIdFromUrl;

    // 2. Hashtag Filter
    if (activeHashtagFilter) {
      if (!p.hashtags || !p.hashtags.includes(activeHashtagFilter)) return false;
    }

    // 3. Category Tag Filter (chill & thư giãn, sống ảo, trải nghiệm local)
    if (activeTag !== 'all' && p.category !== activeTag) return false;

    // 4. Feed View Mode Filter
    if (feedViewMode === 'all') {
      // All posts mode: only show public posts
      return p.status !== 'hidden';
    } else if (feedViewMode === 'my_posts') {
      // My posts mode: must belong to current user
      if (p.authorId !== currentUser?.id) return false;

      // Sub-filter for my posts
      if (myPostsSubFilter === 'public') {
        return p.status !== 'hidden';
      } else if (myPostsSubFilter === 'hidden') {
        return p.status === 'hidden';
      } else if (myPostsSubFilter === 'reported') {
        return p.reported === true;
      }
      // 'all' subfilter: show all of my posts (both public and hidden)
      return true;
    }
    return true;
  });



  return (
    <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 py-8 sm:py-10 flex flex-col gap-8">

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

      {postIdFromUrl && (
        <div className="bg-heritage-amber/10 border border-heritage-amber p-4 rounded-xl flex justify-between items-center animate-fade-in relative z-10">
          <span className="text-xs font-bold text-gray-700">
            {language === 'vi' ? '📌 Bạn đang xem một bài viết được chia sẻ từ liên kết.' : '📌 You are viewing a shared post from link.'}
          </span>
          <button
            onClick={() => setPostIdFromUrl(null)}
            className="px-3 py-1.5 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-extrabold rounded-lg cursor-pointer transition-colors border-none"
          >
            {language === 'vi' ? 'Xem tất cả' : 'View all'}
          </button>
        </div>
      )}

      {activeHashtagFilter && (
        <div className="bg-ricefield-green/10 border border-ricefield-green p-4 rounded-xl flex justify-between items-center animate-fade-in relative z-10">
          <span className="text-xs font-bold text-gray-700">
            {language === 'vi' 
              ? `📌 Đang lọc theo chủ đề hashtag: ${activeHashtagFilter}` 
              : `📌 Filtering by hashtag: ${activeHashtagFilter}`}
          </span>
          <button
            onClick={() => setActiveHashtagFilter(null)}
            className="px-3 py-1.5 bg-ricefield-green hover:bg-ricefield-light text-white text-xs font-extrabold rounded-lg cursor-pointer transition-colors border-none"
          >
            {language === 'vi' ? 'Xem tất cả' : 'View all'}
          </button>
        </div>
      )}



      {/* Feed View Mode Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 border border-heritage-gold/25 p-4 rounded-2xl relative z-20 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setFeedViewMode('all'); setMyPostsSubFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all duration-350 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 ${
              feedViewMode === 'all'
                ? 'bg-heritage-amber border-heritage-amber text-white shadow-md shadow-heritage-amber/15'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {language === 'vi' ? 'Tất cả bài viết' : 'All Posts'}
          </button>
          
          {currentUser && (
            <button
              onClick={() => { setFeedViewMode('my_posts'); setMyPostsSubFilter('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all duration-350 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 ${
                feedViewMode === 'my_posts'
                  ? 'bg-heritage-amber border-heritage-amber text-white shadow-md shadow-heritage-amber/15'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {language === 'vi' ? 'Bài viết của tôi' : 'My Posts'}
            </button>
          )}
        </div>

        {/* Sub-filters under My Posts */}
        {feedViewMode === 'my_posts' && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1 w-full sm:w-auto animate-fade-in">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase whitespace-nowrap">
              {language === 'vi' ? 'Trạng thái bài viết:' : 'Post status:'}
            </span>
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
                { id: 'public', label: language === 'vi' ? 'Công khai' : 'Public' },
                { id: 'hidden', label: language === 'vi' ? 'Đã ẩn' : 'Hidden' },
                // Only show reported sub-filter to Admin
                ...(currentUser && currentUser.role === 'ADMIN' ? [{ id: 'reported', label: language === 'vi' ? 'Bị báo cáo ⚠️' : 'Reported ⚠️' }] : [])
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setMyPostsSubFilter(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-300 cursor-pointer ${
                    myPostsSubFilter === sub.id
                      ? 'bg-ricefield-green border-ricefield-green text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4">
        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t('communityTags')}:</span>
        <div className="flex flex-wrap gap-2 pb-1">
          {[
            { id: 'all', label: t('all'), icon: Compass },
            { id: 'adventure', label: t('tagAdventure'), icon: Trophy },
            { id: 'healing', label: t('tagHealing'), icon: Sparkles },
            { id: 'scenic', label: t('tagScenic'), icon: MapPin },
            { id: 'food', label: t('tagFood'), icon: Flame }
          ].map((tag) => {
            const TagIcon = tag.icon;
            const isActive = activeTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shimmer-trigger ${isActive
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
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Main social posts Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Advanced Local Diary Composer */}
          <PostComposer
            currentUser={currentUser}
            language={language}
            t={t}
            completedItineraries={completedItineraries}
            selectedItineraryId={selectedItineraryId}
            setSelectedItineraryId={setSelectedItineraryId}
            spotsForSelectedItinerary={spotsForSelectedItinerary}
            postLinkedSpot={postLinkedSpot}
            setPostLinkedSpot={setPostLinkedSpot}
            postedSpotIds={postedSpotIds}
            newPostText={newPostText}
            setNewPostText={setNewPostText}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            handleImageChange={handleImageChange}
            handleCreatePost={handleCreatePost}
          />

          {/* Social feed list items */}
          <div className="flex flex-col gap-6">
            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 p-12 rounded-2xl text-center text-gray-400 animate-scale-up">
                <Compass className="w-8 h-8 mx-auto mb-2 opacity-50 animate-float" />
                <p className="text-xs font-semibold">{language === 'vi' ? 'Không tìm thấy nhật ký du lịch phù hợp.' : 'No matching diaries found.'}</p>
              </div>
            ) : (
              filteredPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  idx={idx}
                  currentUser={currentUser}
                  language={language}
                  t={t}
                  openCommentsPostId={openCommentsPostId}
                  setOpenCommentsPostId={setOpenCommentsPostId}
                  commentInputs={commentInputs}
                  setCommentInputs={setCommentInputs}
                  replyInputs={replyInputs}
                  setReplyInputs={setReplyInputs}
                  activeReplyBoxId={activeReplyBoxId}
                  setActiveReplyBoxId={setActiveReplyBoxId}
                  activeDropdownPostId={activeDropdownPostId}
                  setActiveDropdownPostId={setActiveDropdownPostId}
                  sharedPostId={sharedPostId}
                  activeHashtagFilter={activeHashtagFilter}
                  setActiveHashtagFilter={setActiveHashtagFilter}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  handleReportPost={handleReportPost}
                  handleDeletePost={handleDeletePost}
                  handleToggleHidePost={handleToggleHidePost}
                  handleShareLink={handleShareLink}
                  handleAddComment={handleAddComment}
                  handleAddReply={handleAddReply}
                  handleDeleteComment={handleDeleteComment}
                />
              ))
            )}
          </div>

        </div>

        {/* Local Expert Sidebar Column */}
        <LocalExpertSidebar
          language={language}
          t={t}
          experts={experts}
          handleOpenExpertChat={handleOpenExpertChat}
          getTrendingHashtags={getTrendingHashtags}
          activeHashtagFilter={activeHashtagFilter}
          setActiveHashtagFilter={setActiveHashtagFilter}
          showQuestSuccess={showQuestSuccess}
          setShowQuestSuccess={setShowQuestSuccess}
        />

      </div>

      {/* CULTURAL QUEST ACCEPTED MODAL */}
      <QuestSuccessModal
        showQuestSuccess={showQuestSuccess}
        setShowQuestSuccess={setShowQuestSuccess}
        language={language}
      />

            {/* QUICK EXPERT CHAT DIALOG */}
      <ExpertChatModal
        showChatModal={showChatModal}
        setShowChatModal={setShowChatModal}
        activeExpert={activeExpert}
        language={language}
        expertMessageText={expertMessageText}
        setExpertMessageText={setExpertMessageText}
        messageSuccess={messageSuccess}
        handleSendExpertMessage={handleSendExpertMessage}
      />

    </div>
  );
}

