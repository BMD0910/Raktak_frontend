import api from './springApi';
import {
  mapServiceDtoToModel,
  mapVendorDetailDtoToModel,
  mapVendorDtoToModel,
  mapVendorStatusToProfile
} from '../mappers/marketplaceMapper';

export const marketplaceService = {
  async getVendorStatus() {
    const { data } = await api.get('/api/vendor/status');
    return mapVendorStatusToProfile(data);
  },

  async subscribeVendor(payload) {
    const { data } = await api.post('/api/vendor/subscribe', payload || {});
    return mapVendorStatusToProfile(data);
  },

  async updateVendorSubscription(payload) {
    const { data } = await api.put('/api/vendor/subscription', payload || {});
    return mapVendorStatusToProfile(data);
  },

  async initiateSubscription(payload) {
    const { data } = await api.post('/api/vendor/initiate-subscription', payload || {});
    return data || {};
  },

  async becomeVendor(payload) {
    return this.initiateSubscription(payload);
  },

  async setupVendorProfile(payload) {
    const { data } = await api.post('/api/vendor/setup-profile', payload || {});
    return mapVendorStatusToProfile(data);
  },

  async updateVendorProfile(payload) {
    const { data } = await api.put('/api/vendor/profile', payload || {});
    return mapVendorStatusToProfile(data);
  },

  async getMyServices() {
    const { data } = await api.get('/api/vendor/services');
    return Array.isArray(data) ? data.map(mapServiceDtoToModel) : [];
  },

  async getMyService(id) {
    const { data } = await api.get(`/api/vendor/services/${id}`);
    return mapServiceDtoToModel(data);
  },

  async updateMyService(id, payload) {
    const { data } = await api.put(`/api/vendor/services/${id}`, payload || {});
    return mapServiceDtoToModel(data);
  },

  async getVendors(query = '') {
    const { data } = await api.get('/api/vendors', { params: query ? { q: query } : {} });
    return Array.isArray(data) ? data.map(mapVendorDtoToModel) : [];
  },

  async getVendorById(id) {
    const { data } = await api.get(`/api/vendors/${id}`);
    return mapVendorDetailDtoToModel(data);
  },

  async getServices(vendorId) {
    const params = typeof vendorId === 'number' ? { vendorId } : {};
    const { data } = await api.get('/api/services', { params });
    return Array.isArray(data) ? data.map(mapServiceDtoToModel) : [];
  },

  async createService(payload) {
    const { data } = await api.post('/api/services', payload);
    return mapServiceDtoToModel(data);
  },

  async listVendors(query = '') {
    return this.getVendors(query);
  },

  async vendorDetail(id) {
    return this.getVendorById(id);
  },

  async listServices(vendorId) {
    return this.getServices(vendorId);
  },

  async getPublicSettings() {
    const { data } = await api.get('/api/public/settings');
    return data.data || {};
  }
};
