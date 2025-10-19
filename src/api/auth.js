import apiClient from './client';

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),

  login: (data) => apiClient.post('/auth/login', data),

  requestOTP: (email) => apiClient.post('/auth/request-otp', { email }),

  verifyOTP: (email, otp) => apiClient.post('/auth/verify-otp', { email, otp }),

  verify: (token) => apiClient.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data) => apiClient.put('/auth/profile', data),

  changePassword: (data) => apiClient.post('/auth/change-password', data),

  generateApiKey: (keyName) => apiClient.post('/auth/api-key', { keyName }),
};
