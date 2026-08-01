import api from '../services/axios';

export const bookingApi = {
  bookTicket: async (bookingData) => {
    const res = await api.post('/book', bookingData);
    return res.data;
  },
  getUserBookings: async (userId = 1) => {
    const res = await api.get(`/bookings?userId=${userId}`);
    return res.data;
  }
};
