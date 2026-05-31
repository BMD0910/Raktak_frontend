import api from './api';
import { mapDashboardSummaryToModel } from '../mappers/dashboardMapper';
import { subscriptionPlanService } from './subscriptionPlanService';

export const dashboardService = {
  async summary() {
    const { data } = await api.get('/api/dashboard/summary');
    return mapDashboardSummaryToModel(data);
  },

  async adminSubscriptionPlans() {
    return subscriptionPlanService.getAdminPlans();
  },

  async updateAdminSubscriptionPlans(plans) {
    return subscriptionPlanService.saveAdminPlans(plans);
  }
};
