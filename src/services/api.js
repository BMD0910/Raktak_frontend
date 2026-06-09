import axios from 'axios';
import environment from '../config/environment';
import { clearToken, getToken, setToken } from '../utils/tokenStorage';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: environment.apiUrl,
  timeout: 60000,
  withCredentials: true
});

function isTimeoutError(error) {
  return error?.code === 'ECONNABORTED' || String(error?.message || '').toLowerCase().includes('timeout');
}

async function retryOnceOnTimeout(instance, originalRequest) {
  originalRequest._timeoutRetry = true;
  await new Promise((resolve) => setTimeout(resolve, 4000));
  return instance(originalRequest);
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api.post('/api/auth/refresh', {})
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

api.interceptors.request.use((config) => {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config || {};

    if (isTimeoutError(error) && !originalRequest._timeoutRetry) {
      return retryOnceOnTimeout(api, originalRequest);
    }

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
        return api(originalRequest);
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

export default api;
