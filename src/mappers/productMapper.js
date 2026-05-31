import { sanitizeText } from '../utils/sanitize';

export function mapCategoryResponseToModel(data) {
  return {
    id: Number(data?.id || 0),
    name: sanitizeText(data?.name || ''),
    slug: sanitizeText(data?.slug || ''),
    icon: sanitizeText(data?.icon || 'folder'),
    count: Number(data?.count || 0),
    displayOrder: Number(data?.displayOrder || 0)
  };
}

export function mapVendorResponseToModel(data) {
  return {
    id: Number(data?.id || 0),
    name: sanitizeText(data?.name || ''),
    category: sanitizeText(data?.category || 'Services'),
    city: sanitizeText(data?.city || 'Dakar'),
    country: sanitizeText(data?.country || 'Sénégal'),
    rating: Number(data?.rating || 0),
    reviews: Number(data?.reviews || 0),
    verified: Boolean(data?.verified),
    badge: sanitizeText(data?.badge || ''),
    emoji: sanitizeText(data?.emoji || 'building'),
    description: sanitizeText(data?.description || ''),
    services: Array.isArray(data?.services) ? data.services.map((s) => sanitizeText(s)) : [],
    price: sanitizeText(data?.price || 'Sur devis'),
    available: Boolean(data?.available),
    views: Number(data?.views || 0),
    leads: Number(data?.leads || 0)
  };
}

export function mapCityResponseToModel(data) {
  return {
    name: sanitizeText(data?.name || ''),
    country: sanitizeText(data?.country || ''),
    vendors: Number(data?.vendors || 0),
    emoji: sanitizeText(data?.emoji || 'globe')
  };
}

export function mapReviewResponseToModel(data) {
  return {
    id: Number(data?.id || 0),
    vendorId: Number(data?.vendorId || 0),
    client: sanitizeText(data?.client || ''),
    rating: Number(data?.rating || 0),
    comment: sanitizeText(data?.comment || ''),
    date: sanitizeText(data?.date || '')
  };
}
