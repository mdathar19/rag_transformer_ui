import apiClient, { API_BASE_URL } from './client';

// ============================================================================
// ADMIN API - Routes for admin users (full access to all data)
// Base path: /api/v1/admin
// ============================================================================

// Helper to get SSE logs URL with token
export const getAdminCrawlLogsUrl = (jobId, token) => {
  return `${API_BASE_URL}/admin/crawl/${jobId}/logs?token=${encodeURIComponent(token)}`;
};

export const adminWebsitesAPI = {
  // Get all websites
  list: (params) => apiClient.get('/admin/websites', { params }),

  // Get any website
  get: (brokerId) => apiClient.get(`/admin/websites/${brokerId}`),

  // Create website (can create for any user)
  create: (data) => apiClient.post('/admin/websites', data),

  // Update any website
  update: (brokerId, data) => apiClient.put(`/admin/websites/${brokerId}`, data),

  // Delete any website
  delete: (brokerId) => apiClient.delete(`/admin/websites/${brokerId}`),

  // Get website stats
  getStats: (brokerId) => apiClient.get(`/admin/websites/${brokerId}/stats`),

  // Update no-answer response
  updateNoAnswerResponse: (brokerId, noDataResponse) =>
    apiClient.put(`/admin/websites/${brokerId}/no-answer-response`, { noDataResponse }),
};

export const adminUsersAPI = {
  // Get all users
  list: (params) => apiClient.get('/admin/users', { params }),

  // Get specific user
  get: (brokerId) => apiClient.get(`/admin/users/${brokerId}`),

  // Update user
  update: (brokerId, data) => apiClient.put(`/admin/users/${brokerId}`, data),

  // Delete user
  delete: (brokerId) => apiClient.delete(`/admin/users/${brokerId}`),
};

export const adminCrawlAPI = {
  // Start crawl for any website
  start: (brokerId, options = {}) => apiClient.post('/admin/crawl', { brokerId, options }),

  // Batch crawl
  batchCrawl: (brokerIds) => apiClient.post('/admin/crawl/batch', { brokerIds }),

  // Get crawl status
  getStatus: (jobId) => apiClient.get(`/admin/crawl/${jobId}/status`),
};

export const adminQueryAPI = {
  // Query any website
  query: (brokerId, query, options = {}) => apiClient.post('/admin/query', { brokerId, query, options }),

  // Chat with any website
  chat: (data) => apiClient.post('/admin/chat', data),
};

export const adminDashboardAPI = {
  // Get system-wide stats
  getStats: () => apiClient.get('/admin/dashboard/stats'),
};

export const adminAnalyticsAPI = {
  // Get analytics for any website
  getAnalytics: (brokerId, params) => apiClient.get(`/admin/analytics/${brokerId}`, { params }),
};

export const adminContentAPI = {
  // Get content for any website
  getContent: (brokerId, params) => apiClient.get(`/admin/content/${brokerId}`, { params }),

  // Delete content
  deleteContent: (brokerId, contentId) => apiClient.delete(`/admin/content/${brokerId}/${contentId}`),
};

export const adminCacheAPI = {
  // Clear cache for specific broker
  clearCache: (brokerId) => apiClient.post('/admin/cache/clear', { brokerId }),

  // Get cache stats
  getStats: () => apiClient.get('/admin/cache/stats'),
};

export const adminChatAPI = {
  // Chat with any website (streaming)
  // Note: Returns fetch Response for streaming, not apiClient
  chat: async (brokerId, query, sessionId) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/admin/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ brokerId, query, sessionId }),
    });
  },
};
