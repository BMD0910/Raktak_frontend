import { sanitizeText, sanitizeEmail } from '../utils/sanitize';

export function mapVendorDtoToModel(data) {
  const name = sanitizeText(data?.fullName || data?.name || '');
  return {
    id: Number(data?.id || 0),
    fullName: name,
    name,
    email: sanitizeEmail(data?.email || ''),
    bio: sanitizeText(data?.bio || data?.description || ''),
    phone: sanitizeText(data?.phone || ''),
    avatar: sanitizeText(data?.avatar || data?.emoji || 'building'),
    rating: Number(data?.rating || 0),
    totalReviews: Number(data?.totalReviews || data?.reviews || 0),
    vendorVerified: Boolean(data?.vendorVerified ?? data?.verified),
    category: sanitizeText(data?.category || 'Services'),
    city: sanitizeText(data?.city || 'Dakar'),
    country: sanitizeText(data?.country || 'Sénégal'),
    services: Array.isArray(data?.services) ? data.services.map((s) => sanitizeText(s)) : [],
    price: sanitizeText(data?.price || 'Sur devis')
  };
}

export function mapServiceDtoToModel(data) {
  return {
    id: Number(data?.id || 0),
    title: sanitizeText(data?.title || ''),
    description: sanitizeText(data?.description || ''),
    price: Number(data?.price || 0),
    category: sanitizeText(data?.category || 'Service'),
    imageUrl: sanitizeText(data?.imageUrl || ''),
    deliveryTime: Number(data?.deliveryTime || 0),
    featured: Boolean(data?.featured),
    vendorId: Number(data?.vendorId || 0),
    vendorName: sanitizeText(data?.vendorName || ''),
    vendorVerified: Boolean(data?.vendorVerified),
    active: Boolean(data?.active),
    status: sanitizeText(data?.status || 'active'),
    deactivationReason: sanitizeText(data?.deactivation_reason || data?.deactivationReason || ''),
    deactivatedAt: sanitizeText(data?.deactivated_at || data?.deactivatedAt || ''),
    statusLabel: sanitizeText(data?.statusLabel || (data?.active ? 'Actif' : 'Inactif'))
  };
}

export function mapVendorDetailDtoToModel(data) {
  return {
    vendor: mapVendorDtoToModel(data?.vendor || {}),
    services: Array.isArray(data?.services) ? data.services.map(mapServiceDtoToModel) : []
  };
}

export function mapVendorStatusToProfile(data = {}) {
  return {
    isVendor: Boolean(data?.isVendor),
    subscriptionActive: Boolean(data?.subscriptionActive),
    profileCompleted: Boolean(data?.profileCompleted),
    subscriptionPlanCode: sanitizeText(data?.subscriptionPlanCode || ''),
    subscriptionPlanName: sanitizeText(data?.subscriptionPlanName || ''),
    subscriptionPlanPriceFcfa: Number(data?.subscriptionPlanPriceFcfa || 0),
    vendorVerified: Boolean(data?.vendorVerified),
    profession: sanitizeText(data?.profession || ''),
    skills: sanitizeText(data?.skills || ''),
    experience: sanitizeText(data?.experience || ''),
    bio: sanitizeText(data?.bio || ''),
    description: sanitizeText(data?.description || ''),
    phone: sanitizeText(data?.phone || ''),
    location: sanitizeText(data?.location || ''),
    portfolioUrl: sanitizeText(data?.portfolioUrl || ''),
    socialLinks: sanitizeText(data?.socialLinks || ''),
    avatar: sanitizeText(data?.avatar || 'user'),
    rating: Number(data?.rating || 0),
    totalReviews: Number(data?.totalReviews || 0)
  };
}
