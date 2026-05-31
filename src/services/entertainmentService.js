import axiosClient from './axiosClient';

const entertainmentService = {
  getEntertainments: async (keyword) => {
    const params = {};
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/entertainments', { params });
  },

  getEntertainmentById: async (id) => {
    return await axiosClient.get(`/entertainments/${id}`);
  },

  createEntertainment: async (data) => {
    return await axiosClient.post('/entertainments', data);
  },

  updateEntertainment: async (id, data) => {
    return await axiosClient.put(`/entertainments/${id}`, data);
  },

  deleteEntertainment: async (id) => {
    return await axiosClient.delete(`/entertainments/${id}`);
  }
};

export default entertainmentService;
