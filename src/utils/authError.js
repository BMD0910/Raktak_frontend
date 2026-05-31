function humanizeFieldName(field) {
  const labels = {
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom complet'
  };
  return labels[field] || field;
}

function mapKnownMessage(message) {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('invalid credentials')) return 'Email ou mot de passe incorrect.';
  if (normalized.includes('email already used')) return 'Cet email est déjà utilisé.';
  if (normalized.includes('refresh token')) return 'Session expirée, veuillez vous reconnecter.';
  if (normalized.includes('internal server error')) return 'Erreur technique du serveur. Merci de réessayer dans quelques instants.';
  return message;
}

function mapKnownCode(code) {
  const normalized = String(code || '').toUpperCase();
  if (normalized === 'AUTHENTICATION_FAILED') return 'Email ou mot de passe incorrect.';
  if (normalized === 'AUTH_REQUIRED') return 'Session expirée, veuillez vous reconnecter.';
  if (normalized === 'DATA_INTEGRITY_CONFLICT') return 'Conflit de données: cet email existe déjà ou les données sont invalides.';
  if (normalized === 'VALIDATION_ERROR') return 'Veuillez corriger les champs du formulaire.';
  if (normalized === 'TOO_MANY_REQUESTS') return 'Trop de tentatives. Merci de patienter avant de réessayer.';
  if (normalized === 'INTERNAL_ERROR') return 'Erreur interne du serveur. Réessayez dans quelques instants.';
  return '';
}

export function getAuthErrorMessage(error, fallback = 'Une erreur est survenue.') {
  const status = error?.response?.status;
  const data = error?.response?.data || {};
  const validationErrors = data?.errors;
  const code = data?.code;

  if (validationErrors && typeof validationErrors === 'object') {
    const details = Object.entries(validationErrors)
      .map(([field, message]) => `${humanizeFieldName(field)}: ${message}`)
      .join(' · ');
    if (details) return details;
  }

  const knownCode = mapKnownCode(code);
  if (knownCode) return knownCode;

  const directMessage =
    error?.userMessage
    || data?.message
    || error?.message
    || '';

  const known = mapKnownMessage(directMessage);
  if (known) return known;

  if (error?.code === 'ECONNABORTED') {
    return 'Le serveur met trop de temps à répondre. Vérifiez votre connexion puis réessayez.';
  }

  if (status === 401) return 'Email ou mot de passe incorrect.';
  if (status === 403) return 'Accès refusé pour cette action.';
  if (status === 409) return 'Conflit de données: vérifiez les informations saisies.';
  if (status >= 500) return 'Erreur serveur, merci de réessayer dans un instant.';
  if (!error?.response) return 'Impossible de contacter le serveur.';

  return fallback;
}
