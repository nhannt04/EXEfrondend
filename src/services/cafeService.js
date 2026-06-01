import axiosClient from './axiosClient';

const cafeService = {
  getCafes: async (keyword) => {
    const params = {};
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/cafes', { params });
  },

  getCafeById: async (id) => {
    return await axiosClient.get(`/cafes/${id}`);
  },

  // Get only cafes that are currently operating
  getOperatingCafes: async () => {
    return await axiosClient.get('/cafes/operating/now');
  },

  // Get all unique addresses for dropdown
  getAddresses: async () => {
    const response = await axiosClient.get('/cafes');
    if (response?.data) {
      return [...new Set(response.data.map(c => c.address).filter(Boolean))];
    }
    return [];
  },

  createCafe: async (cafeData) => {
    return await axiosClient.post('/cafes', cafeData);
  },

  updateCafe: async (id, cafeData) => {
    return await axiosClient.put(`/cafes/${id}`, cafeData);
  },

  deleteCafe: async (id) => {
    return await axiosClient.delete(`/cafes/${id}`);
  }
};

export default cafeService;
