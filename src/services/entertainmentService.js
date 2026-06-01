import axiosClient from './axiosClient';

const entertainmentService = {
  getEntertainments: async (keyword) => {
    const params = {};
    if (keyword) params.keyword = keyword;
    return await axiosClient.get('/entertainments', { params });
  },

  createEntertainment: async (data) => {
    const payload = { ...data };
    // Ensure openingTime/closingTime are formatted as HH:mm strings if provided
    const formatTime = (t) => {
      if (!t) return null;
      if (typeof t === 'string') return t; // assume already HH:mm
      // If Date object
      if (t instanceof Date) {
        const hh = String(t.getHours()).padStart(2, '0');
        const mm = String(t.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      // If object with hour/minute
      if (typeof t === 'object' && (t.hour !== undefined || t.hours !== undefined)) {
        const h = t.hour ?? t.hours ?? 0;
        const m = t.minute ?? t.minutes ?? 0;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return String(t);
    };

    payload.openingTime = formatTime(payload.openingTime);
    payload.closingTime = formatTime(payload.closingTime);
    payload.overnight = !!payload.overnight || (payload.openingTime && payload.closingTime && payload.openingTime > payload.closingTime);

    return await axiosClient.post('/entertainments', payload);
  },

  updateEntertainment: async (id, data) => {
    const payload = { ...data };
    const formatTime = (t) => {
      if (!t) return null;
      if (typeof t === 'string') return t;
      if (t instanceof Date) {
        const hh = String(t.getHours()).padStart(2, '0');
        const mm = String(t.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      if (typeof t === 'object' && (t.hour !== undefined || t.hours !== undefined)) {
        const h = t.hour ?? t.hours ?? 0;
        const m = t.minute ?? t.minutes ?? 0;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return String(t);
    };

    payload.openingTime = formatTime(payload.openingTime);
    payload.closingTime = formatTime(payload.closingTime);
    payload.overnight = !!payload.overnight || (payload.openingTime && payload.closingTime && payload.openingTime > payload.closingTime);

    return await axiosClient.put(`/entertainments/${id}`, payload);
  },

  deleteEntertainment: async (id) => {
    return await axiosClient.delete(`/entertainments/${id}`);
  },

  getEntertainmentStatus: async (id) => {
    return await axiosClient.get(`/entertainments/${id}/status`);
  },

  // Get only entertainments that are currently operating
  getOperatingEntertainments: async () => {
    return await axiosClient.get('/entertainments/operating/now');
  },

  // Get all unique addresses for dropdown
  getAddresses: async () => {
    const response = await axiosClient.get('/entertainments');
    if (response?.data) {
      return [...new Set(response.data.map(e => e.address).filter(Boolean))];
    }
    return [];
  }
};

export default entertainmentService;
