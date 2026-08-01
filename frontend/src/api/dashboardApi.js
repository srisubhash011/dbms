import api from '../services/axios';

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
  getLogs: async () => {
    const res = await api.get('/logs');
    return res.data;
  },
  getPerformance: async () => {
    const res = await api.get('/performance');
    return res.data;
  },
  runSimulation: async (simulationData) => {
    const res = await api.post('/simulation/run', simulationData);
    return res.data;
  }
};
