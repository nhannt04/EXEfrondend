import axiosClient from './axiosClient';

const tripService = {
  generateTrip: async (tripParams) => {
    return await axiosClient.post('/trips/generate', tripParams);
  },
  saveItinerary: async (itineraryData) => {
    return await axiosClient.post('/itineraries', itineraryData);
  },
  getMyItineraries: async () => {
    return await axiosClient.get('/itineraries/my');
  },
  deleteItinerary: async (id) => {
    return await axiosClient.delete(`/itineraries/${id}`);
  }
};

export default tripService;
