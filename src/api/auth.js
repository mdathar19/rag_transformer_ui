import apiClient from './client';

export const authAPI = {
  // OTP-only authentication endpoints
  requestLoginOTP: (email) => apiClient.post('/auth/request-login-otp', { email }),

  requestSignupOTP: (data) => apiClient.post('/auth/request-signup-otp', data),

  verifyLoginOTP: (email, otp) => apiClient.post('/auth/verify-login-otp', { email, otp }),

  verifySignupOTP: (email, otp) => apiClient.post('/auth/verify-signup-otp', { email, otp }),

  // Token and profile endpoints
  verify: (token) => apiClient.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data) => apiClient.put('/auth/profile', data),

  generateApiKey: (keyName) => apiClient.post('/auth/api-key', { keyName }),
};
