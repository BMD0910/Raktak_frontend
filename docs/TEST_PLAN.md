# Test Plan — Frontend ↔ Backend Integration

## Pré-requis
- Backend démarré (`raktakk-spring-backend`)
- Frontend démarré (`raktakk-react-frontend`)
- `VITE_API_URL` pointe vers backend

## Scénarios fonctionnels

### 1) Login
- Ouvrir `/login`
- Se connecter avec `admin@raktakk.com` / `Admin@12345`
- Vérifier redirection dashboard
- Vérifier token `raktakk_token` dans localStorage

### 2) Register + auto-login
- Ouvrir `/register-client`
- Créer un compte
- Vérifier token stocké + session active

### 3) Logout
- Cliquer déconnexion
- Vérifier suppression du token
- Vérifier redirection vers page publique

### 4) Dashboard protégé
- Sans token, ouvrir `/dashboard-client`
- Attendu: redirection `/login`

### 5) 401 handling
- Forcer un token invalide dans localStorage
- Recharger une page dashboard
- Attendu: logout auto + retour login

### 6) 403 handling
- Utilisateur USER appelant endpoint admin
- Attendu: message "Accès refusé pour cette ressource."

### 7) Data pages
- `/` charge catégories, villes, top vendors via API
- `/listing`, `/search`, `/profile?id=...` chargent les données réelles
- Attendu: loaders + empty state + error state fonctionnels

### 8) Token expiration
- Réduire `JWT_EXPIRATION_MS` côté backend
- Se connecter puis attendre expiration
- Attendu: au prochain appel privé, 401 + logout auto
