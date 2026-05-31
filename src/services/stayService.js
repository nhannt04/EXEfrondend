import axiosClient from './axiosClient';

const stayService = {
  getStays: async (keyword) => {
    const params = {};
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/stays', { params });
  },

  getStayById: async (id) => {
    return await axiosClient.get(`/stays/${id}`);
  },

  createStay: async (stayData) => {
    return await axiosClient.post('/stays', stayData);
  },

  updateStay: async (id, stayData) => {
    return await axiosClient.put(`/stays/${id}`, stayData);
  },

  deleteStay: async (id) => {
    return await axiosClient.delete(`/stays/${id}`);
  }
};

export default stayService;
