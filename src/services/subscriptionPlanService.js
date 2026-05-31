import api from './api';

function mapPlan(data = {}) {
  return {
    code: String(data.code || ''),
    name: String(data.name || ''),
    priceFcfa: Number(data.priceFcfa || 0),
    description: String(data.description || ''),
    features: Array.isArray(data.features) ? data.features.map((item) => String(item || '')) : [],
    maxServices: data.maxServices == null ? null : Number(data.maxServices),
    maxFeaturedServices: data.maxFeaturedServices == null ? null : Number(data.maxFeaturedServices),
    allowFeatured: Boolean(data.allowFeatured),
    allowPremiumBadge: Boolean(data.allowPremiumBadge),
    requireCompleteProfile: Boolean(data.requireCompleteProfile),
    active: Boolean(data.active),
    displayOrder: Number(data.displayOrder || 0)
  };
}

export const subscriptionPlanService = {
  async getPublicPlans() {
    const { data } = await api.get('/api/public/subscription-plans');
    return Array.isArray(data) ? data.map(mapPlan) : [];
  },

  async getAdminPlans() {
    const { data } = await api.get('/api/admin/subscription-plans');
    return Array.isArray(data) ? data.map(mapPlan) : [];
  },

  async saveAdminPlans(plans) {
    const payload = (Array.isArray(plans) ? plans : []).map((plan, index) => ({
      code: String(plan.code || '').trim().toUpperCase(),
      name: String(plan.name || '').trim(),
      priceFcfa: Number(plan.priceFcfa || 0),
      description: String(plan.description || '').trim(),
      features: Array.isArray(plan.features)
        ? plan.features.map((item) => String(item || '').trim()).filter(Boolean)
        : String(plan.features || '').split('\n').map((item) => item.trim()).filter(Boolean),
      maxServices: Number(plan.maxServices ?? 0),
      maxFeaturedServices: Number(plan.maxFeaturedServices ?? 0),
      allowFeatured: Boolean(plan.allowFeatured),
      allowPremiumBadge: Boolean(plan.allowPremiumBadge),
      requireCompleteProfile: Boolean(plan.requireCompleteProfile),
      active: Boolean(plan.active),
      displayOrder: Number(plan.displayOrder ?? index + 1)
    }));

    const { data } = await api.put('/api/admin/subscription-plans', payload);
    return Array.isArray(data) ? data.map(mapPlan) : [];
  }
};
