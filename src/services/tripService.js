import axiosClient from './axiosClient';

const tripService = {
  generateTrip: async (tripParams) => {
    return await axiosClient.post('/trips/generate', tripParams, {
      timeout: 120000 // 120s - AI generation can take some time
    });
  },
  saveItinerary: async (itineraryData) => {
    return await axiosClient.post('/itineraries', itineraryData);
  },
  getMyItineraries: async () => {
    return await axiosClient.get('/itineraries/my');
  },
  getCompletedItineraries: async () => {
    return await axiosClient.get('/itineraries/completed');
  },
  deleteItinerary: async (id) => {

    return await axiosClient.delete(`/itineraries/${id}`);
  },
  updateItineraryStatus: async (id, status) => {
    return await axiosClient.put(`/itineraries/${id}/status?status=${status}`);
  },
  getItineraryHandbook: async (id) => {
    return await axiosClient.get(`/itineraries/${id}/handbook`, {
      timeout: 60000
    });
  }
};

export default tripService;
