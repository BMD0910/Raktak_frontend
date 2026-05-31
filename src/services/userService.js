import api from './api';
import { mapUserResponseToModel } from '../mappers/userMapper';
import { mapVendorStatusToProfile } from '../mappers/marketplaceMapper';

const PROFILE_STORAGE_KEY = 'raktakk_client_profile';

function readLocalProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveLocalProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile || {}));
}

export const userService = {
  async me() {
    const { data } = await api.get('/api/users/me');
    return mapUserResponseToModel(data);
  },
  async vendorStatus() {
    const { data } = await api.get('/api/vendor/status');
    return mapVendorStatusToProfile(data);
  },
  async getUserProfile() {
    const me = await this.me();
    const localProfile = readLocalProfile();
    const baseProfile = me?.profile || {};
    return {
      fullName: me?.fullName || '',
      email: me?.email || '',
      phone: localProfile.phone ?? baseProfile.phone ?? '',
      avatar: localProfile.avatar ?? baseProfile.avatar ?? 'user'
    };
  },
  async saveUserProfile(payload = {}) {
    const nextProfile = {
      fullName: String(payload.fullName || '').trim(),
      email: String(payload.email || '').trim(),
      phone: String(payload.phone || '').trim(),
      avatar: String(payload.avatar || 'user').trim() || 'user'
    };
    saveLocalProfile(nextProfile);
    return nextProfile;
  }
};
