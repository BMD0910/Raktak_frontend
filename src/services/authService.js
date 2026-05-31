import api from './api';
import environment from '../config/environment';
import { mapAuthResponseToModel } from '../mappers/authMapper';
import { mapUserResponseToModel } from '../mappers/userMapper';
import { clearToken } from '../utils/tokenStorage';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    return mapAuthResponseToModel(data);
  },
  async register(payload) {
    const { data } = await api.post('/api/auth/register', payload);
    return mapAuthResponseToModel(data);
  },
  async me() {
    const { data } = await api.get('/api/auth/me');
    return mapUserResponseToModel(data);
  },
  async logout() {
    try {
      await api.post('/api/auth/logout', {});
    } catch (_) {
      // ignored on purpose: local cleanup still runs
    }
    clearToken();
  },
  googleLoginUrl() {
    return `${environment.apiUrl}/oauth2/authorization/google`;
  }
};
