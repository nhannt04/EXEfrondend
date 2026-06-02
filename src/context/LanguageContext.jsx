import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  vi: {
    // Header
    home: 'Trang chủ',
    aiPlanner: 'Lên lịch trình',
    community: 'Cộng đồng',
    visitor: 'Khách du lịch',
    localMember: 'Hội viên Local',
    navigation: 'Dẫn đường',

    // Landing Page
    heroBadge: 'Hành trình cá nhân hóa',
    heroTitle: 'Khám phá Việt Nam theo cách',
    heroTitleHighlight: 'Local thực thụ',
    heroSubtitle: 'Nhập ngân sách, thời gian và gu của bạn. Hệ thống sẽ lập tức thiết lập lịch trình ăn chơi, ngủ nghỉ tối ưu và tiết kiệm nhất trên khắp Việt Nam.',
    daysCount: 'Số ngày đi',
    budgetLabel: 'Ngân sách tổng',
    travelStyle: 'Phong cách',
    startNow: 'Bắt đầu ngay',
    localSpotlight: 'Khám phá tinh hoa bản địa',
    hiddenGems: 'Địa điểm Local ẩn mình độc lạ',
    hiddenGemsDesc: 'Những góc nhỏ ít khách du lịch đại trà biết tới, mang đậm tinh thần Hội An mộc mạc và chân thực.',
    estimateCost: 'Chi phí ước tính',
    planByGu: 'Lên lịch trình theo gu này',
    valuePropTitle1: 'Đề xuất Local Thực Thụ',
    valuePropDesc1: 'Nói không với các bẫy du lịch (tourist traps). Chúng tôi giới thiệu những địa điểm có gốc gác lâu đời của người dân bản xứ.',
    valuePropTitle2: 'Tối Ưu Địa Lý & Thời Gian',
    valuePropDesc2: 'Thuật toán thông minh sắp xếp các điểm đến theo cụm địa lý, giúp bạn tiết kiệm thời gian đi lại.',
    valuePropTitle3: 'Quản Lý Ngân Sách Chặt Chẽ',
    valuePropDesc3: 'Tích hợp công cụ Budget Optimizer cân đối chi phí. Chỉ 1-click hệ thống tự động đổi điểm rẻ hơn nhưng chất lượng tương đương.',

    // Planner Studio
    plannerTitle: 'Kiến Tạo Lịch Trình',
    plannerDesc: 'Tinh chỉnh tham số đầu vào bên dưới. Hệ thống sẽ thiết lập tức thì lịch trình khám phá Hội An tối ưu nhất.',
    tripParams: 'Tham số chuyến đi',
    destination: 'Điểm đến',
    adults: 'Người lớn',
    children: 'Trẻ em',
    interests: 'Sở thích cá nhân',
    generateButton: 'SINH LỊCH TRÌNH',
    generating: 'Đang phân tích...',
    loadingFact: 'Có thể bạn chưa biết:',

    // Budget Dashboard
    yourBudget: 'Ngân sách của bạn',
    remainingBalance: 'Còn dư thực tế',
    optimizeButton: 'TỐI ƯU CHI PHÍ',
    optimizing: 'Đang tối ưu...',
    inControl: 'Trong tầm kiểm soát',
    optMessage: 'Đang chạy thuật toán Tối Ưu Hóa Ngân Sách: Rà soát lại phòng ngủ, thay đổi các workshop đắt đỏ, và cân bằng lại ăn uống...',
    optSuccess: 'Đã áp dụng tối ưu ngân sách thành công! Đã chuyển sang homestay sinh thái bình dân Hội An và ẩm thực local để tiết kiệm chi phí.',
    costsAccommodation: 'Nơi nghỉ ngơi',
    costsFood: 'Ăn uống',
    costsActivities: 'Hoạt động & Trải nghiệm',
    costsTransport: 'Di chuyển (Cố định)',
    financialAnalysis: 'Phân tích tài chính',
    advisorTitle: 'Trợ lý Đánh giá:',
    advisorOver: 'Lịch trình hiện đang vượt quá ngân sách mong muốn của bạn. Hãy click nút "TỐI ƯU CHI PHÍ" để tự động áp dụng các giải pháp giảm giá trị phòng nghỉ mà vẫn giữ nguyên trải nghiệm.',
    advisorUnder: 'Lịch trình cực kỳ tối ưu! Chi phí phân bổ hợp lý, bạn còn dư ngân sách để chi tiêu mua sắm quà lưu niệm hoặc ăn vặt Phố Cổ Hội An lúc nửa đêm.',

    // Timeline
    restPlace: 'Nơi nghỉ ngơi',
    estimatedNight: 'Ước tính/đêm',
    morning: 'Buổi Sáng',
    afternoon: 'Buổi Chiều',
    evening: 'Buổi Tối',
    free: 'Miễn phí',
    quickActions: 'Hành động nhanh',
    swapSpot: 'Đổi địa điểm',
    dayTab: 'Ngày',
    noItinerary: 'Chưa có lịch trình được tạo',
    noItineraryDesc: 'Vui lòng thiết lập các tham số chuyến đi ở bảng bên trái và nhấn nút Sinh lịch trình để bắt đầu.',

    // Social Network
    socialTitle: 'Nhật Ký Hành Trình Local',
    socialDesc: 'Cộng đồng chia sẻ kinh nghiệm du lịch thực tế, không có quảng cáo, bảo vệ giá trị Hội An.',
    postPlaceholder: 'Chia sẻ một góc nhỏ Hội An mộc mạc bạn vừa tìm ra...',
    postButton: 'Đăng bài',
    postBadge: 'Hội viên Local',
    likeStat: 'Thích',
    commentStat: 'Bình luận',
    saveStat: 'Lưu trữ',
    savedStat: 'Đã lưu',
    commentTitle: 'Bình luận trao đổi',
    noComments: 'Chưa có bình luận. Hãy là người đầu tiên chia sẻ cảm xúc!',
    replyPlaceholder: 'Viết phản hồi...',
    replyButton: 'Phản hồi',
    replyTrigger: 'Trả lời bình luận này',
    commentPlaceholder: 'Viết bình luận của bạn...',
    communityTags: 'Bộ lọc địa phương',
    all: 'Tất cả nhật ký',
    tagFood: 'Ẩm thực local',
    tagAdventure: 'Trải nghiệm local',
    tagHealing: 'Chill & thư giãn',
    tagScenic: 'Sống ảo',
    diaryCategory: 'Chủ đề nhật ký',
    localExperts: 'Chuyên gia Bản địa Tiêu biểu',
    askExpert: 'Trò chuyện nhanh',
    trendingHashtags: 'Chủ đề Thịnh hành 🔥',
    challengeTitle: 'Thách thức Văn hóa Hôm nay 🏮',
    challengeQuest: 'Chụp ảnh Chùa Cầu lúc bình minh & viết cảm nhận di sản.',
    challengeReward: 'Quà tặng: Voucher giảm 50k khi làm Đèn lồng Phố cổ!',
    participate: 'Nhận Thách Thức',

    // Chatbot
    botIntro: 'Chào bạn! Tôi là Travelist Guide 🏮 - trợ lý ảo đồng hành cùng bạn suốt chuyến đi Hội An. Tôi tự động đồng bộ hóa lịch trình đang tạo của bạn để hỗ trợ chỉ đường, gợi ý quán ăn địa phương và thuyết minh lịch sử di tích thực tế. Bạn cần tôi hỗ trợ gì?',
    botTitle: 'Travelist Guide',
    botSubtitle: 'Trợ lý du lịch ảo Hội An',
    botSuggestHeader: 'Gợi ý nhanh',
    botInputPlaceholder: 'Hỏi Travelist đường đi, quán ăn ngon...',
    botTypeIndicator: 'Travelist đang nhập...',
    suggestMeal: 'Trưa nay ăn gì ngon gần Little Pie Homestay?',
    suggestHistory: 'Lịch sử Chùa Cầu có nguồn gốc thế nào?',
    suggestSunset: 'Gu Healing nên đi đâu chill ngắm hoàng hôn?',

    // Bot responses (pre-translated or generated)
    botMealReply: 'Dựa vào lịch trình của bạn đang ở Little Pie Homestay, tôi gợi ý quán ăn trưa cực ngon cách bạn chỉ 250m: Quán Cao Lầu Thanh hoặc Cơm gà Bà Buội. Nếu bạn thích uống cafe chill đồng lúa ngắm cảnh, hãy ghé FeFe Coffee nhé. Đường đi rất bằng phẳng, đi bộ tầm 5 phút là tới nha!',
    botHistoryReply: '🏮 [Thuyết Minh Lịch Sử]: Chùa Cầu (Lai Viễn Kiều) được các thương nhân Nhật Bản xây dựng vào đầu thế kỷ 17. Ngôi cầu mang kiến trúc độc bản hình chữ Công, trên có mái che, dưới vòm cầu là bức tượng thần khỉ Sarutahiko và thần chó Thiên Cẩu yểm giữ để trấn trị thủy quái Namazu gây ra động đất. Chùa Cầu chính là biểu tượng giao thoa văn hoá Nhật - Hoa - Việt tại phố hội.',
    botSunsetReply: 'Với gu Healing của bạn, địa điểm ngắm hoàng hôn Hội An tuyệt vời nhất là bãi biển An Bàng (khu vực bãi tắm ẩn sau rặng thông) hoặc ghé Roving Chill House nằm ngay giữa cánh đồng lúa Cẩm Châu. Trải nghiệm ngắm ráng chiều vàng buông xuống trên sóng biển hoặc đồng lúa sẽ giúp bạn nạp năng lượng cực tốt!',
    botDefaultReply: 'Tôi đã nhận được câu hỏi của bạn. Hội An có rất nhiều điều thú vị đang chờ đón! Bạn có muốn tôi tối ưu hóa tuyến đường di chuyển từ địa điểm hiện tại của bạn đến Phố Cổ không?',

    // Map Routing
    mapTitle: 'Bản đồ Định vị & Lộ trình',
    mapCurrentLocation: 'Điểm xuất phát (Của bạn)',
    mapDetectingLocation: 'Đang kết nối định vị GPS...',
    mapFarAwayWarning: 'Bạn đang ở xa Hội An. Hệ thống tự động tối ưu hóa điểm xuất phát từ Homestay của ngày hiện tại để bạn dễ dàng di chuyển!',
    mapDistance: 'Khoảng cách',
    mapDuration: 'Thời gian đi',
    mapRouteTo: 'Đường đi đến',
    mapFoot: 'Đi bộ',
    mapBike: 'Xe đạp',
    mapMotorbike: 'Xe máy',
    mapCar: 'Ô tô',
    mapStartRoute: 'Xem trên Google Maps thực tế',
    mapMaximize: 'Phóng to Bản đồ',
    mapMinimize: 'Thu nhỏ',
    mapStepsTitle: 'Chỉ dẫn Lộ trình chi tiết',
    mapStepDepart: 'Khởi hành từ vị trí của bạn (hoặc Homestay trung tâm).',
    mapStepFollow: 'Đi thẳng theo tuyến đường chỉ định để đến:',
    mapStepTip: 'Lưu ý bản địa: Tuyến đường này rất thơ mộng, hãy tận hưởng cảnh sắc hai bên đường nhé!',
    mapActiveTab: 'Lộ Trình Đang Đi',
    mapStartNav: 'Bắt đầu đi',
    mapStopNav: 'Dừng dẫn đường',
    mapNavigating: 'Đang định vị trực tiếp...',

    // Footer
    footerBrandDesc: 'Hệ thống gợi ý lịch trình du lịch thông minh và kết nối cộng đồng khám phá các giá trị văn hóa, ẩm thực local độc đáo của Phố cổ Hội An.',
    footerColHeader1: 'Khám phá Hội An',
    footerColHeader2: 'Công nghệ thông minh',
    footerColHeader3: 'Liên hệ',
    footerLink1: 'Địa điểm check-in ẩn mình',
    footerLink2: 'Quán cafe mộc mạc yên tĩnh',
    footerLink3: 'Homestay địa phương ấm áp',
    footerLink4: 'Workshop làm đèn lồng, gốm',
    footerLink5: 'Lên lịch trình tự động',
    footerLink6: 'Tối ưu chi phí thực tế',
    footerLink7: 'Trợ lý ảo Travelist Guide',
    footerLink8: 'Sinh thông tin lịch sử tự động',
    footerCopyright: '© 2026 Travelist Project. Phát triển bởi Google Deepmind team & Bạn đồng hành.'
  },
  en: {
    // Header
    home: 'Home',
    aiPlanner: 'Trip Planner',
    community: 'Community',
    visitor: 'Traveler',
    localMember: 'Local Member',
    navigation: 'Navigation',

    // Landing Page
    heroBadge: 'Personalized Itinerary Builder',
    heroTitle: 'Discover Vietnam like a',
    heroTitleHighlight: 'True Local',
    heroSubtitle: 'Enter your budget, duration, and personal style. Our system will instantly craft the most optimal and cost-effective food, stay, and activities map across Vietnam.',
    daysCount: 'Number of Days',
    budgetLabel: 'Total Budget',
    travelStyle: 'Travel Style',
    startNow: 'Start Now',
    localSpotlight: 'Explore Local Treasures',
    hiddenGems: 'Hidden Local Gems Out of the Ordinary',
    hiddenGemsDesc: 'Quiet corners tucked away from mainstream crowds, reflecting Hoi An\'s rustic and authentic spirit.',
    estimateCost: 'Estimated Cost',
    planByGu: 'Plan with this style',
    valuePropTitle1: 'True Local Recommendations',
    valuePropDesc1: 'Say no to tourist traps. We prioritize homestays, local diners, and cafes with deep generational roots in Hoi An.',
    valuePropTitle2: 'Geographic & Route Optimization',
    valuePropDesc2: 'Our smart algorithm clusters destinations geographically. You will never waste time driving zig-zag across town.',
    valuePropTitle3: 'Strict Budget Management',
    valuePropDesc3: 'Equipped with a Budget Optimizer. If you exceed limits, a 1-click action swaps expensive entries with premium local alternatives.',

    // Planner Studio
    plannerTitle: 'Smart Itinerary Studio',
    plannerDesc: 'Fine-tune your travel parameters below. Our system will instantly map out your perfect Hoi An vacation.',
    tripParams: 'Trip Parameters',
    destination: 'Destination',
    adults: 'Adults',
    children: 'Children',
    interests: 'Personal Interests',
    generateButton: 'GENERATE TRIP',
    generating: 'Analyzing...',
    loadingFact: 'Did you know?',

    // Budget Dashboard
    yourBudget: 'Your Budget',
    remainingBalance: 'Remaining Balance',
    optimizeButton: 'OPTIMIZE BUDGET',
    optimizing: 'Optimizing...',
    inControl: 'In Budget Range',
    optMessage: 'Running Budget Optimizer: reviewing accommodation tiers, swapping high-cost workshops, and balancing dining expenditures...',
    optSuccess: 'Budget optimization applied successfully! Changed lodging to authentic boutique homestays and meals to local dining.',
    costsAccommodation: 'Stays / Lodging',
    costsFood: 'Dining & Drinks',
    costsActivities: 'Activities & Workshops',
    costsTransport: 'Transport (Fixed)',
    financialAnalysis: 'Financial Analysis',
    advisorTitle: 'Guide Assessment:',
    advisorOver: 'Your current itinerary exceeds your targeted budget. Click the "OPTIMIZE BUDGET" button to automatically swap entries with cost-effective alternatives.',
    advisorUnder: 'Itinerary perfectly optimized! Well-distributed costs leave you with ample budget for souvenir shopping or late-night street food walks.',

    // Timeline
    restPlace: 'Stay / Rest Area',
    estimatedNight: 'Estimated/night',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    free: 'Free of Charge',
    quickActions: 'Quick Actions',
    swapSpot: 'Swap Location',
    dayTab: 'Day',
    noItinerary: 'No Itinerary Created Yet',
    noItineraryDesc: 'Configure your travel parameters in the left-side panel and click the Generate button to begin.',

    // Social Network
    socialTitle: 'Local Travel Diaries',
    socialDesc: 'A community sharing practical, ad-free travel experiences preserving Hoi An\'s true heritage.',
    postPlaceholder: 'Share a rustic corner of Hoi An you just discovered...',
    postButton: 'Publish',
    postBadge: 'Local Member',
    likeStat: 'Likes',
    commentStat: 'Comments',
    saveStat: 'Bookmark',
    savedStat: 'Bookmarked',
    commentTitle: 'Community Discussions',
    noComments: 'No comments yet. Be the first to share your thoughts!',
    replyPlaceholder: 'Write a reply...',
    replyButton: 'Reply',
    replyTrigger: 'Reply to this comment',
    commentPlaceholder: 'Write your comment...',
    communityTags: 'Local Filters',
    all: 'All Diaries',
    tagFood: 'Local Foodie',
    tagAdventure: 'Local Experiences',
    tagHealing: 'Chill & Relax',
    tagScenic: 'Insta-worthy',
    diaryCategory: 'Diary Style',
    localExperts: 'Featured Local Experts',
    askExpert: 'Quick Chat',
    trendingHashtags: 'Trending Hashtags 🔥',
    challengeTitle: 'Daily Cultural Quest 🏮',
    challengeQuest: 'Capture the Japanese Bridge at sunrise & write a heritage review.',
    challengeReward: 'Reward: 50k VND Voucher for Lantern Making Workshop!',
    participate: 'Accept Quest',

    // Chatbot
    botIntro: 'Hello! I am Travelist Guide 🏮 - your virtual companion throughout Hoi An. I dynamically sync your active itinerary to help with navigation, recommend local diners, and tell cultural stories. How can I help you today?',
    botTitle: 'Travelist Guide',
    botSubtitle: 'Virtual Travel Guide',
    botSuggestHeader: 'Quick Prompts',
    botInputPlaceholder: 'Ask Travelist for directions, top diners...',
    botTypeIndicator: 'Travelist is typing...',
    suggestMeal: 'What is good to eat near Little Pie Homestay?',
    suggestHistory: 'What is the history of the Japanese Bridge (Chua Cau)?',
    suggestSunset: 'Where can a Healing enthusiast go for sunset views?',

    // Bot responses
    botMealReply: 'Since you are staying at Little Pie Homestay, I highly recommend two amazing lunch spots within 250m: Thanh Cao Lau diner or Ba Buoi Chicken Rice. If you want to sip coffee overlooking vast green fields, drop by FeFe Coffee. The route is very flat and takes only 5 minutes on foot!',
    botHistoryReply: '🏮 [History Thuyết Minh]: The Japanese Covered Bridge (Chua Cau) was constructed by Japanese merchants in the early 17th century. It features a unique bridge-temple design shaped like the kanji "Gong", housing statues of the Monkey deity Sarutahiko and the Dog deity Tenshogu to subdue the earthquake-causing water serpent Namazu. It symbolizes the historical merger of Japanese, Chinese, and Vietnamese cultures.',
    botSunsetReply: 'For your Healing style, the best sunset views in Hoi An can be found at An Bang Beach (the quiet pine tree patch behind the main strip) or by relaxing at Roving Chill House nestled in the Cam Chau rice paddies. Watching the amber sunset fall over the fields or waves will recharge your spirit!',
    botDefaultReply: 'I have received your query. Hoi An has many amazing secrets waiting for you! Would you like me to optimize your walking path from your current location to the Old Town?',

    // Map Routing
    mapTitle: 'Route & Navigation Map',
    mapCurrentLocation: 'Starting Point (Your Location)',
    mapDetectingLocation: 'Connecting to GPS...',
    mapFarAwayWarning: 'You are currently far from Hoi An. The system has set the starting point to the active Homestay for optimal routing!',
    mapDistance: 'Distance',
    mapDuration: 'Travel Time',
    mapRouteTo: 'Directions to',
    mapFoot: 'Walk',
    mapBike: 'Bicycle',
    mapMotorbike: 'Motorbike',
    mapCar: 'Drive',
    mapStartRoute: 'Open in actual Google Maps',
    mapMaximize: 'Maximize Map',
    mapMinimize: 'Minimize',
    mapStepsTitle: 'Detailed Directions',
    mapStepDepart: 'Depart from your active starting point (or central Homestay).',
    mapStepFollow: 'Follow the designated routing path directly to:',
    mapStepTip: 'Local recommendation: This route is highly scenic. Take in the local culture along the way!',
    mapActiveTab: 'Active Journey',
    mapStartNav: 'Start Navigation',
    mapStopNav: 'Stop Navigation',
    mapNavigating: 'Live GPS Active...',

    // Footer
    footerBrandDesc: 'Smart travel suggestion platform and community hubs dedicated to discovering local culture and authentic Hoi An heritage.',
    footerColHeader1: 'Discover Hoi An',
    footerColHeader2: 'Smart Technology',
    footerColHeader3: 'Contact Us',
    footerLink1: 'Hidden Check-in Spots',
    footerLink2: 'Rustic Quiet Cafes',
    footerLink3: 'Cozy Family Homestays',
    footerLink4: 'Lantern & Ceramic Workshops',
    footerLink5: 'Auto Itinerary Builder',
    footerLink6: 'Real Cost Estimator',
    footerLink7: 'Virtual Guide Assistant',
    footerLink8: 'History Generator',
    footerCopyright: '© 2026 Travelist Project. Engineered by Google Deepmind team & Travel Companions.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi'); // Default Vietnamese

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
