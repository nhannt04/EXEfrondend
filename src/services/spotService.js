import axiosClient from './axiosClient';

const spotService = {
  getSpots: async (category, keyword) => {
    const params = {};
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/spots', { params });
  },

  getSpotById: async (id) => {
    return await axiosClient.get(`/spots/${id}`);
  },

  getNearbySpots: async (lat, lng, radius) => {
    return await axiosClient.get('/spots/nearby', {
      params: { lat, lng, radius }
    });
  },

  // Lấy N địa điểm nổi bật ngẫu nhiên cho trang chủ
  getFeaturedSpots: async (limit = 8) => {
    return await axiosClient.get('/spots/featured', { params: { limit } });
  },

  // Lấy top spots theo danh mục cho section phân loại
  getTopByCategory: async (category, limit = 4) => {
    return await axiosClient.get(`/spots/category/${category}`, { params: { limit } });
  },

  createSpot: async (spotData) => {
    return await axiosClient.post('/spots', spotData);
  },

  updateSpot: async (id, spotData) => {
    return await axiosClient.put(`/spots/${id}`, spotData);
  },

  deleteSpot: async (id) => {
    return await axiosClient.delete(`/spots/${id}`);
  },

  getPresignedUrl: async (fileName, contentType, uploadType = 'SPOT_IMAGE') => {
    return await axiosClient.post('/uploads/presigned', { fileName, contentType, uploadType });
  }
};

export default spotService;
