import axiosClient from './axiosClient';

const diaryService = {
  getDiaries: async (category) => {
    const params = {};
    if (category) params.category = category;
    return await axiosClient.get('/diaries', { params });
  },

  createDiary: async (formData) => {
    return await axiosClient.post('/diaries', formData);
  },

  likeDiary: async (id) => {
    return await axiosClient.post(`/diaries/${id}/like`);
  },

  addComment: async (diaryId, userId, content) => {
    return await axiosClient.post(`/diaries/${diaryId}/comments`, {
      userId,
      content
    });
  }
};

export default diaryService;
