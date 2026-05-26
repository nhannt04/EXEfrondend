import axiosClient from './axiosClient';

const expertService = {
  getExperts: async (online) => {
    const params = {};
    if (online !== undefined) params.online = online;
    return await axiosClient.get('/experts', { params });
  },

  sendInquiry: async (expertId, userId, question) => {
    return await axiosClient.post('/experts/inquiries', {
      expertId,
      userId,
      question
    });
  }
};

export default expertService;
