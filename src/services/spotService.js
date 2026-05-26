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

  createSpot: async (spotData) => {
    return await axiosClient.post('/spots', spotData);
  },

  deleteSpot: async (id) => {
    return await axiosClient.delete(`/spots/${id}`);
  }
};

export default spotService;
