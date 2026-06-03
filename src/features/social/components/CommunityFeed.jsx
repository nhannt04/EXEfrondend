import React, { useState, useEffect } from 'react';
import { MessageSquare, Share2, Send, CornerDownRight, Image as ImageIcon, Smile, MapPin, Award, Compass, Hash, Sparkles, Trophy, CheckCircle, Flame, UserCheck, X, ThumbsUp, ThumbsDown, MoreHorizontal, AlertTriangle, Eye, EyeOff, Trash2 } from 'lucide-react';

import { useLanguage } from '../../../context/LanguageContext';
import diaryService from '../../../services/diaryService';
import expertService from '../../../services/expertService';
import spotService from '../../../services/spotService';
import authService from '../../../services/authService';
import tripService from '../../../services/tripService';


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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">

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
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: t('all'), icon: Compass },
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
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Main social posts Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Advanced Local Diary Composer */}
          <form
            onSubmit={handleCreatePost}
            className="bg-gradient-to-tr from-white to-blue-50/40 border border-heritage-gold/20 p-4 sm:p-5 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden shimmer-trigger animate-fade-in-up [animation-delay:100ms]"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 border border-gray-150 p-3 rounded-xl relative z-10">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">
                  {language === 'vi' ? 'Lịch trình đã hoàn thành' : 'Completed Itinerary'}
                </label>
                <select
                  value={selectedItineraryId || ''}
                  onChange={(e) => {
                    setSelectedItineraryId(e.target.value ? Number(e.target.value) : null);
                    setPostLinkedSpot(null);
                  }}
                  className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
                  required
                >
                  <option value="">{language === 'vi' ? '-- Chọn lịch trình --' : '-- Select itinerary --'}</option>
                  {completedItineraries.map((it) => (
                    <option key={it.id} value={it.id}>
                      📍 {it.title} ({it.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">
                  {language === 'vi' ? 'Chọn Địa điểm đã đi' : 'Select Visited Spot'}
                </label>
                <select
                  value={postLinkedSpot || ''}
                  onChange={(e) => setPostLinkedSpot(e.target.value ? Number(e.target.value) : null)}
                  className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-heritage-amber cursor-pointer"
                  disabled={!selectedItineraryId}
                  required
                >
                  <option value="">{language === 'vi' ? '-- Chọn địa điểm --' : '-- Select spot --'}</option>
                  {spotsForSelectedItinerary.map((s) => {
                    const isPosted = postedSpotIds.includes(s.id);
                    const name = s.name?.[language] || s.nameVi || s.nameEn || s.name;
                    return (
                      <option key={s.id} value={s.id} disabled={isPosted}>
                        {name} {isPosted ? `(${language === 'vi' ? 'Đã đánh giá' : 'Reviewed'})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>


            {/* Selected Image Preview with close trigger */}
            {imagePreview && (
              <div className="relative w-32 h-20 border border-gray-150 rounded-xl overflow-hidden shadow-inner group z-10 animate-scale-up">
                <img src={imagePreview} alt={language === 'vi' ? 'Ảnh xem trước bài viết' : 'Post preview'} className="w-full h-full object-cover animate-fade-in" />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(''); }}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-all cursor-pointer border-none flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-gray-100 pt-3 relative z-10">
              <div className="flex gap-2 flex-wrap">
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
                className="px-5 py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none shadow-md shadow-heritage-amber/10 hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
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
                  className={`bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col p-4 sm:p-5 gap-4 shadow-sm hover:shadow-md hover:border-heritage-gold/30 transition-all duration-300 group shimmer-trigger animate-fade-in-up`}
                  style={{ animationDelay: `${(idx + 1) * 150}ms` }}
                >

                  {/* Post Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 relative z-10">
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
                    <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border leading-none ${post.category === 'food'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : post.category === 'adventure'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : post.category === 'scenic'
                            ? 'bg-sky-50 text-sky-600 border-sky-200'
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

                  {post.reported && (
                    <div className="bg-red-50 border border-red-250 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse relative z-10 select-none">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{language === 'vi' ? 'Bài viết này đã bị báo cáo đến admin!' : 'This post has been reported to admin!'}</span>
                    </div>
                  )}

                  {post.status === 'hidden' && (
                    <div className="bg-gray-50 border border-gray-200 text-gray-500 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 relative z-10 select-none">
                      <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{language === 'vi' ? 'Bài viết này đang bị ẩn đối với cộng đồng.' : 'This post is currently hidden from the community.'}</span>
                    </div>
                  )}

                  {/* Content body text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium relative z-10">
                    {post.content[language]}
                  </p>

                  {/* Optional Linked Spot Details */}
                  {post.spot && (
                    <div className="flex flex-col gap-1.5 bg-gradient-to-r from-gray-50 to-blue-50/20 border border-gray-150 p-3 rounded-xl text-[11.5px] font-bold text-gray-700 shadow-sm relative z-10 select-none">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-heritage-amber animate-pulse" />
                        <span className="text-gray-400">{language === 'vi' ? 'Địa điểm' : 'Place'}:</span>
                        <span className="text-heritage-amber font-extrabold">{post.spot.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 pl-5 font-semibold">
                        📍 {post.spot.address}
                      </div>
                    </div>
                  )}

                  {/* Clickable Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 relative z-10 select-none">
                      {post.hashtags.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHashtagFilter(tag);
                          }}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            activeHashtagFilter === tag
                              ? 'bg-heritage-amber text-white border-heritage-amber shadow-sm shadow-heritage-amber/20 scale-105'
                              : 'bg-white text-heritage-amber border-heritage-amber/35 hover:border-heritage-amber'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500 relative z-10">

                    {/* Likes & Dislikes */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(post.id)}
                        disabled={Boolean(post.myReaction)}
                        className={`flex items-center gap-1.5 hover:text-gray-800 transition-all cursor-pointer bg-white border-none ${post.hasLiked ? 'text-green-600 font-extrabold scale-[1.03]' : 'text-gray-500'} ${post.myReaction ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <ThumbsUp className={`w-4 h-4 transition-transform duration-300 active:scale-150 ${post.hasLiked ? 'text-green-600 fill-green-600' : 'text-gray-400'}`} />
                        <span>{language === 'vi' ? 'Thích' : 'Like'} ({post.likes})</span>
                      </button>

                      {/* Dislike */}
                      <button
                        onClick={() => handleDislike(post.id)}
                        disabled={Boolean(post.myReaction)}
                        className={`flex items-center gap-1.5 hover:text-gray-800 transition-all cursor-pointer bg-white border-none ${post.hasDisliked ? 'text-red-500 font-extrabold scale-[1.03]' : 'text-gray-500'} ${post.myReaction ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <ThumbsDown className={`w-4 h-4 transition-transform duration-300 active:scale-150 ${post.hasDisliked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                        <span>{language === 'vi' ? 'Không thích' : 'Dislike'} ({post.dislikes})</span>
                      </button>
                    </div>


                    {/* Comments trigger */}
                    <button
                      onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-gray-800 transition-colors cursor-pointer bg-white border-none font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                      <span>{post.comments.length} {t('commentStat')}</span>
                    </button>

                    {/* Actions Dropdown Button (3-dots) */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownPostId(activeDropdownPostId === post.id ? null : post.id);
                        }}
                        className="flex items-center gap-1.5 p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-xl transition-all cursor-pointer bg-white border-none"
                        title={language === 'vi' ? 'Thao tác' : 'Actions'}
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>

                      {activeDropdownPostId === post.id && (
                        <div className="absolute right-0 bottom-10 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-scale-up select-none">
                          {/* Case A: Is the Owner of the post */}
                          {post.authorId === currentUser?.id ? (
                            <>
                              {/* Option 1: Can DELETE if 0 likes AND 0 comments */}
                              {post.likes === 0 && post.comments.length === 0 ? (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-2 text-xs font-extrabold text-red-650 hover:bg-red-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                  <span>{language === 'vi' ? 'Xóa bài viết' : 'Delete Post'}</span>
                                </button>
                              ) : (
                                /* Option 2: Can HIDE or SHOW if likes > 0 OR comments > 0 */
                                post.status === 'hidden' ? (
                                  <button
                                    onClick={() => handleToggleHidePost(post.id, 'public')}
                                    className="w-full text-left px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 text-ricefield-green" />
                                    <span>{language === 'vi' ? 'Hiển thị bài viết' : 'Show Post'}</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleHidePost(post.id, 'hidden')}
                                    className="w-full text-left px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                    <span>{language === 'vi' ? 'Ẩn bài viết' : 'Hide Post'}</span>
                                  </button>
                                )
                              )}
                            </>
                          ) : (
                            /* Case B: NOT the Owner of the post */
                            <button
                              onClick={() => handleReportPost(post.id)}
                              className="w-full text-left px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                            >
                              <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" />
                              <span>{language === 'vi' ? 'Báo cáo vi phạm' : 'Report Post'}</span>
                            </button>
                          )}

                          {/* Share Link option inside menu */}
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => {
                              handleShareLink(post.id);
                              setActiveDropdownPostId(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-extrabold transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer ${
                              sharedPostId === post.id ? 'text-green-600 hover:bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Share2 className="w-4 h-4 text-gray-400" />
                            <span>
                              {sharedPostId === post.id 
                                ? (language === 'vi' ? 'Đã copy link!' : 'Copied!') 
                                : (language === 'vi' ? 'Chia sẻ liên kết' : 'Copy Share Link')}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
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
                              <div className="flex gap-2.5 items-center justify-between">
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
                                {currentUser && currentUser.id === comment.userId && (
                                  <button
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none bg-transparent"
                                    title={language === 'vi' ? 'Xóa bình luận' : 'Delete comment'}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
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
                                        className="w-7 h-7 rounded-full object-cover border border-gray-150"
                                      />
                                      <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-900 leading-none">{reply.userName}</span>
                                            {post.authorId && reply.userId && post.authorId === reply.userId && (
                                              <span className="text-[7.5px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                                {language === 'vi' ? 'Tác giả' : 'Author'}
                                              </span>
                                            )}
                                          </div>
                                          {currentUser && currentUser.id === reply.userId && (
                                            <button
                                              onClick={() => handleDeleteComment(post.id, reply.id)}
                                              className="p-0.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none bg-transparent"
                                              title={language === 'vi' ? 'Xóa phản hồi' : 'Delete reply'}
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
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
                                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center animate-fade-in">
                                    <input
                                      type="text"
                                      value={replyInputs[comment.id] || ''}
                                      onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                      placeholder={t('replyPlaceholder')}
                                      className="flex-grow bg-white border border-gray-200 text-xs text-gray-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-heritage-amber"
                                    />
                                    <button
                                      onClick={() => handleAddReply(post.id, comment.id)}
                                      className="px-3 py-2 sm:py-1 bg-ricefield-green hover:bg-ricefield-light text-white font-bold text-[10px] rounded-lg cursor-pointer border-none shadow-sm transition-colors w-full sm:w-auto"
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
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center border-t border-gray-200 pt-3">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder={t('commentPlaceholder')}
                          className="flex-grow bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-heritage-amber placeholder-gray-400 shadow-inner"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-xl flex items-center justify-center cursor-pointer border-none shadow-sm transition-colors w-full sm:w-auto"
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
          <div className="bg-gradient-to-tr from-blue-500 to-heritage-amber text-white p-5 rounded-3xl shadow-lg shadow-heritage-amber/10 flex flex-col gap-4 relative overflow-hidden shimmer-trigger animate-fade-in-up [animation-delay:200ms]">
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
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/80">{language === 'vi' ? 'Phần thưởng' : 'Reward'}:</span>
                <span className="text-[10.5px] font-bold text-blue-100">{t('challengeReward')}</span>
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
              <Flame className="w-4 h-4 text-blue-500" />
              {t('trendingHashtags')}
            </h3>

            <div className="flex flex-col gap-3 relative z-10">
              {getTrendingHashtags().map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveHashtagFilter(item.tag)}
                  className="flex justify-between items-center text-xs group cursor-pointer hover:translate-x-0.5 transition-transform duration-200"
                >
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400 group-hover:text-heritage-amber transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-heritage-amber transition-colors">{item.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold">{item.likes ?? 0} likes</span>
                    {idx === 0 && (
                      <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1 rounded font-bold uppercase scale-90">Hot</span>
                    )}
                    {idx > 0 && idx < 3 && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1 rounded font-bold uppercase scale-90">Rising</span>
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

