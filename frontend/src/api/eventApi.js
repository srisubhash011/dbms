import api from '../services/axios';

export const eventApi = {
  getAllEvents: async () => {
    const res = await api.get('/events');
    return res.data;
  },
  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  getSeats: async (eventId) => {
    const res = await api.get(`/seats/${eventId}`);
    return res.data;
  },
  createEvent: async (eventData) => {
    const res = await api.post('/events', eventData);
    return res.data;
  },
  deleteEvent: async (id) => {
    await api.delete(`/events/${id}`);
  }
};
