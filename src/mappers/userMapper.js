import { sanitizeText, sanitizeEmail } from '../utils/sanitize';

export function mapUserResponseToModel(data) {
  return {
    id: Number(data?.id || 0),
    email: sanitizeEmail(data?.email || ''),
    fullName: sanitizeText(data?.fullName || ''),
    role: sanitizeText(data?.role || 'USER'),
    accountStatus: String(data?.account_status || data?.accountStatus || 'active'),
    deactivationReason: data?.deactivation_reason || data?.deactivationReason || null,
    deactivationContact: data?.deactivation_contact || data?.deactivationContact || null,
    profile: {
      isVendor: Boolean(data?.profile?.isVendor || data?.isVendor),
      vendorVerified: Boolean(data?.profile?.vendorVerified || data?.vendorVerified),
      subscriptionActive: Boolean(data?.profile?.subscriptionActive || data?.subscriptionActive),
      profileCompleted: Boolean(data?.profile?.profileCompleted || data?.profileCompleted),
      subscriptionPlanCode: String(data?.profile?.subscriptionPlanCode || data?.subscriptionPlanCode || ''),
      subscriptionPlanName: String(data?.profile?.subscriptionPlanName || data?.subscriptionPlanName || ''),
      subscriptionPlanPriceFcfa: Number(data?.profile?.subscriptionPlanPriceFcfa || data?.subscriptionPlanPriceFcfa || 0),
      bio: sanitizeText(data?.profile?.bio || data?.bio || ''),
      phone: sanitizeText(data?.profile?.phone || data?.phone || ''),
      avatar: sanitizeText(data?.profile?.avatar || data?.avatar || ''),
      rating: Number(data?.profile?.rating || data?.rating || 0),
      totalReviews: Number(data?.profile?.totalReviews || data?.totalReviews || 0)
    }
  };
}
