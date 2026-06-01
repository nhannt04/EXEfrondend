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

  likeDiary: async (id, type = 'LIKE') => {
     return await axiosClient.post(`/diaries/${id}/like?type=${type}`);
  },



  addComment: async (diaryId, userId, content, parentCommentId = null) => {
    return await axiosClient.post(`/diaries/${diaryId}/comments`, {
      userId,
      content,
      parentCommentId
    });
  },

  getPostedSpots: async (itineraryId) => {
    return await axiosClient.get(`/diaries/posted-spots`, { params: { itineraryId } });
  },

  deleteComment: async (diaryId, commentId) => {
    return await axiosClient.delete(`/diaries/${diaryId}/comments/${commentId}`);
  }
};


export default diaryService;
