import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lk_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('lk_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
          const newAccessToken = res.data.data.tokens.accessToken;
          const newRefreshToken = res.data.data.tokens.refreshToken;

          localStorage.setItem('lk_access_token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('lk_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('lk_access_token');
          localStorage.removeItem('lk_refresh_token');
          localStorage.removeItem('lk_user');
          window.dispatchEvent(new Event('lk_auth_logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
