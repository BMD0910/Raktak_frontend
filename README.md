# Raktakk React Frontend

Frontend React (Vite) construit à partir des pages HTML d'origine, avec routage SPA et intégration API.

## Stack
- React
- React Router
- Axios

## Architecture
- `src/components/common`
- `src/components/layout`
- `src/components/ui`
- `src/pages`
- `src/services`
- `src/mappers`
- `src/hooks`
- `src/context`
- `src/utils`
- `src/router`

## Migration UI
Les pages sont migrées en composants React natifs, sans injection HTML et sans scripts legacy.
Les layouts (`MainLayout`, `AuthLayout`, `DashboardLayout`) structurent la navigation et la séparation des responsabilités.
Le routeur utilise lazy loading + code splitting pour optimiser les performances.

## Installation
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Variables d'environnement
Créer `.env` depuis `.env.example` :
```bash
VITE_API_URL=https://raktak-backend.onrender.com
```

## Intégration API
- Token JWT stocké dans `localStorage` (`raktakk_token`)
- Interceptor Axios pour `Authorization: Bearer <token>`
- Callback OAuth2 Google : `/oauth2/success`
- Authentification globale via `AuthContext` + protection des routes privées
- Mapping DTO obligatoire via `src/mappers` (pas d'usage direct des payloads backend dans les composants)

## Contrats & tests
- Contrat d'API: `docs/API_CONTRACT.md`
- Plan de test intégration: `docs/TEST_PLAN.md`

## Déploiement Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Variable d'environnement: `VITE_API_URL=https://raktak-backend.onrender.com`
4. La redirection SPA est déjà gérée par `netlify.toml` et `public/_redirects`.
# Raktak_frontend
