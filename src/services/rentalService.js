import axiosClient from './axiosClient';

const rentalService = {
  getRentals: async (keyword) => {
    const params = {};
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/rentals', { params });
  },

  getRentalById: async (id) => {
    return await axiosClient.get(`/rentals/${id}`);
  },

  createRental: async (data) => {
    return await axiosClient.post('/rentals', data);
  },

  updateRental: async (id, data) => {
    return await axiosClient.put(`/rentals/${id}`, data);
  },

  deleteRental: async (id) => {
    return await axiosClient.delete(`/rentals/${id}`);
  }
};

export default rentalService;
