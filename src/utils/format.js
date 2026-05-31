export function formatNumber(value) {
  return Number(value || 0).toLocaleString('fr-FR');
}

export function stars(rating) {
  return '★'.repeat(Math.round(rating || 0));
}
