import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data && !response.data.requires2FA) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
};

const twoFactorService = {
  // Setup TOTP
  setupTOTP: async () => {
    const response = await api.post('/2fa/setup/totp');
    return response.data;
  },

  // Verify TOTP
  verifyTOTP: async (code) => {
    const response = await api.post('/2fa/verify/totp', { code });
    return response.data;
  },

  // Setup Email 2FA
  setupEmail2FA: async () => {
    const response = await api.post('/2fa/setup/email');
    return response.data;
  },

  // Verify Email 2FA
  verifyEmail2FA: async (code) => {
    const response = await api.post('/2fa/verify/email', { code });
    return response.data;
  },

  // Setup SMS 2FA
  setupSMS2FA: async (phoneNumber) => {
    const response = await api.post('/2fa/setup/sms', { phoneNumber });
    return response.data;
  },

  // Verify SMS 2FA
  verifySMS2FA: async (code) => {
    const response = await api.post('/2fa/verify/sms', { code });
    return response.data;
  },

  // Verify 2FA during login
  verify2FALogin: async (code, tempToken, isBackupCode = false) => {
    const response = await api.post('/2fa/verify-login', { code, tempToken, isBackupCode });
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  // Send 2FA code
  send2FACode: async (tempToken) => {
    const response = await api.post('/2fa/send-code', { tempToken });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (password) => {
    const response = await api.post('/2fa/disable', { password });
    return response.data;
  }
};

export { authService, twoFactorService };
export default api;
