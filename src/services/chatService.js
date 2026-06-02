import axiosClient from './axiosClient';

export const getChatReply = async (message) => {
  const response = await axiosClient.post('/chat', { message });
  return response.data; // This returns the ChatResponse payload: { reply: "..." }
};
