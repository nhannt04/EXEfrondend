import axiosClient from './axiosClient';

const dishService = {
  getDishes: async (keyword) => {
    const params = {};
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/dishes', { params });
  },

  getDishById: async (id) => {
    return await axiosClient.get(`/dishes/${id}`);
  },

  createDish: async (dishData) => {
    return await axiosClient.post('/dishes', dishData);
  },

  updateDish: async (id, dishData) => {
    return await axiosClient.put(`/dishes/${id}`, dishData);
  },

  deleteDish: async (id) => {
    return await axiosClient.delete(`/dishes/${id}`);
  }
};

export default dishService;
