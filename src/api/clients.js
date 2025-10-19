import apiClient from './client';

export const clientsAPI = {
  list: (params) => apiClient.get('/clients', { params }),

  get: (brokerId) => apiClient.get(`/clients/${brokerId}`),

  create: (data) => apiClient.post('/clients', data),

  update: (brokerId, data) => apiClient.put(`/clients/${brokerId}`, data),

  delete: (brokerId) => apiClient.delete(`/clients/${brokerId}`),

  getStats: (brokerId) => apiClient.get(`/clients/${brokerId}/stats`),
};

export const crawlAPI = {
  start: (brokerId, options) => apiClient.post('/crawl', { brokerId, options }),

  getStatus: (jobId) => apiClient.get(`/crawl/${jobId}/status`),

  batchCrawl: (brokerIds) => apiClient.post('/crawl/batch', { brokerIds }),
};

export const queryAPI = {
  query: (brokerId, query, options) => apiClient.post('/query', { brokerId, query, options }),

  search: (brokerId, query, options) => apiClient.post('/search', { brokerId, query, options }),

  chat: (data) => apiClient.post('/chat', data),

  getSessionHistory: (sessionId) => apiClient.get(`/chat/session/${sessionId}`),

  clearSession: (sessionId) => apiClient.delete(`/chat/session/${sessionId}`),
};
