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

  loginWithGoogle: async (idToken) => {
    const res = await axiosClient.post('/auth/google', { idToken });
    if (res && res.success && res.data) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  register: async (fullName, email, password, otp) => {
    return await axiosClient.post('/auth/register', {
      fullName,
      email,
      password,
      otp,
      role: 'USER'
    });
  },

  sendOtp: async (email, type = 'register') => {
    return await axiosClient.post('/auth/send-otp', { email, type });
  },

  resetPassword: async (email, newPassword, otp) => {
    return await axiosClient.post('/auth/reset-password', { email, newPassword, otp });
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

  updateProfile: async (userId, fullName) => {
    const res = await axiosClient.put(`/users/${userId}/profile`, { fullName });
    if (res && res.success && res.data) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.fullName = res.data.fullName;
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth-state-changed'));
        } catch (e) {
          console.error(e);
        }
      }
    }
    return res;
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    return await axiosClient.put(`/users/${userId}/password`, { oldPassword, newPassword });
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
