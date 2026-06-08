import axios from 'axios';
import environment from '../config/environment';
import { clearToken, getToken, setToken } from '../utils/tokenStorage';

let unauthorizedHandler = null;

export function setSpringUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const springApi = axios.create({
  baseURL: environment.apiUrl,
  timeout: 30000,
  withCredentials: true
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = springApi.post('/api/auth/refresh', {})
      .then((response) => {
        const newToken = response?.data?.token;
        if (!newToken) throw new Error('Refresh invalide');
        setToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

springApi.interceptors.request.use((config) => {
  const token = getToken();
  const url = config.url || '';
  const method = String(config.method || 'get').toLowerCase();
  const isProtected = (
    url.startsWith('/api/users')
    || url.startsWith('/api/dashboard')
    || url.startsWith('/api/vendor')
    || (url.startsWith('/api/services') && method !== 'get')
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

springApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config || {};

    const isAuthEndpoint = (originalRequest.url || '').startsWith('/api/auth/login')
      || (originalRequest.url || '').startsWith('/api/auth/register')
      || (originalRequest.url || '').startsWith('/api/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newToken}`
        };
        return springApi(originalRequest);
      } catch (refreshError) {
        clearToken();
        if (typeof unauthorizedHandler === 'function') unauthorizedHandler();
        const refreshMessage = refreshError?.response?.data?.message || refreshError?.message || 'Session expirée';
        return Promise.reject({ ...refreshError, userMessage: refreshMessage });
      }
    }

    if (status === 401) {
      clearToken();
      if (typeof unauthorizedHandler === 'function') unauthorizedHandler();
    }

    const message = error.response?.data?.message
      || (error.response?.status === 403 ? 'Accès refusé pour cette ressource.' : null)
      || error.message
      || 'Erreur API';
    return Promise.reject({ ...error, userMessage: message });
  }
);

export default springApi;