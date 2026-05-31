import api from './api';

export const orderService = {
  async createOrder(serviceId, description) {
    const payload = {
      serviceId: Number(serviceId),
      description: String(description || '').trim()
    };

    const { data } = await api.post('/api/orders', payload);
    return data;
  },

  async getVendorOrders() {
    const { data } = await api.get('/api/orders/vendor');
    return data || [];
  },

  async getClientOrders() {
    const { data } = await api.get('/api/orders/client');
    return data || [];
  },

  async accept(orderId) {
    const { data } = await api.post(`/api/orders/${orderId}/accept`);
    return data;
  },

  async reject(orderId) {
    const { data } = await api.post(`/api/orders/${orderId}/reject`);
    return data;
  },

  async complete(orderId) {
    const { data } = await api.post(`/api/orders/${orderId}/complete`);
    return data;
  },

  async cancel(orderId) {
    const { data } = await api.post(`/api/orders/${orderId}/cancel`);
    return data;
  }
};
