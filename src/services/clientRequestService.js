import { orderService } from './orderService';

const STATUS_MAP = {
  EN_ATTENTE: 'PENDING',
  EN_COURS: 'ACCEPTED',
  TERMINE: 'COMPLETED',
  REFUSE: 'REJECTED',
  ANNULEE: 'CANCELLED',
  TOUTES: 'ALL'
};

export const clientRequestService = {
  async getRequests(status) {
    const safeStatus = String(status || '').toUpperCase();
    const orders = await orderService.getClientOrders();

    if (!safeStatus || STATUS_MAP[safeStatus] === 'ALL') {
      return orders;
    }

    const backendStatus = STATUS_MAP[safeStatus] || safeStatus;
    return orders.filter((request) => request.status === backendStatus);
  },

  async cancelRequest(orderId) {
    return orderService.cancel(orderId);
  }
};
