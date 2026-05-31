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
