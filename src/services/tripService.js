import axiosClient from './axiosClient';

const tripService = {
  generateTrip: async (tripParams) => {
    return await axiosClient.post('/trips/generate', tripParams);
  }
};

export default tripService;
