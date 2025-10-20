import apiClient, { API_BASE_URL } from './client';

// ============================================================================
// USER API - Routes for regular users (filtered by owner)
// Base path: /api/v1/user
// ============================================================================

// Helper to get SSE logs URL with token
export const getUserCrawlLogsUrl = (jobId, token) => {
  return `${API_BASE_URL}/crawl/${jobId}/logs?token=${encodeURIComponent(token)}`;
};

export const userWebsitesAPI = {
  // Get user's own websites
  list: (params) => apiClient.get('/user/websites', { params }),

  // Get specific website (only if owned by user)
  get: (brokerId) => apiClient.get(`/user/websites/${brokerId}`),

  // Create website (automatically assigns current user as owner)
  create: (data) => apiClient.post('/user/websites', data),

  // Update website (only if owned by user)
  update: (brokerId, data) => apiClient.put(`/user/websites/${brokerId}`, data),

  // Delete website (only if owned by user)
  delete: (brokerId) => apiClient.delete(`/user/websites/${brokerId}`),

  // Get website stats (only if owned by user)
  getStats: (brokerId) => apiClient.get(`/user/websites/${brokerId}/stats`),
};

export const userCrawlAPI = {
  // Start crawl for user's website
  start: (brokerId, options = {}) => apiClient.post('/user/crawl', { brokerId, options }),

  // Get crawl status
  getStatus: (jobId) => apiClient.get(`/user/crawl/${jobId}/status`),
};

export const userQueryAPI = {
  // Query user's website
  query: (brokerId, query, options = {}) => apiClient.post('/user/query', { brokerId, query, options }),

  // Chat with user's website
  chat: (data) => apiClient.post('/user/chat', data),

  // Get chat session history
  getSessionHistory: (sessionId) => apiClient.get(`/user/chat/session/${sessionId}`),

  // Clear chat session
  clearSession: (sessionId) => apiClient.delete(`/user/chat/session/${sessionId}`),

  // Create new session
  createNewSession: () => apiClient.post('/user/session/new'),
};

export const userDashboardAPI = {
  // Get user dashboard stats
  getStats: () => apiClient.get('/user/dashboard/stats'),
};

export const userChatAPI = {
  // Chat with user's website (streaming)
  // Note: Returns fetch Response for streaming, not apiClient
  chat: async (brokerId, query, sessionId) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/user/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ brokerId, query, sessionId }),
    });
  },

  // Get chat session history
  getSessionHistory: (sessionId) => apiClient.get(`/user/chat/session/${sessionId}`),

  // Clear chat session
  clearSession: (sessionId) => apiClient.delete(`/user/chat/session/${sessionId}`),
};
