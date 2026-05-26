import axiosClient from './axiosClient';

const authService = {
  login: async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res && res.success && res.data) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  register: async (fullName, email, password) => {
    return await axiosClient.post('/auth/register', {
      fullName,
      email,
      password,
      role: 'USER'
    });
  },

  updateAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axiosClient.post(`/users/${userId}/avatar`, formData);
    if (res && res.success && res.data) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.avatarUrl = res.data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth-state-changed'));
        } catch (e) {
          console.error(e);
        }
      }
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-state-changed'));
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
};

export default authService;
