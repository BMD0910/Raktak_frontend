import api from './api';

export const conversationService = {
  async getConversation(orderId) {
    const { data } = await api.get(`/api/conversations/${orderId}`);
    return data;
  },

  async sendMessage(conversationId, content) {
    const payload = {
      content: String(content || '').trim()
    };

    const { data } = await api.post(`/api/messages/${conversationId}`, payload);
    return data;
  }
};