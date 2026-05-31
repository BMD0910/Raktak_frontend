# API Contract — Frontend ↔ Spring Boot

## Base URL
`VITE_API_URL` (ex: `https://raktak-backend.onrender.com`)

## Public endpoints (`/api/public/*`)

### `GET /api/public/health`
```json
{ "ok": true, "service": "raktakk-backend" }
```

### `GET /api/public/categories`
```json
[
  { "id": 1, "name": "Marketing Digital", "slug": "marketing-digital", "icon": "🚀", "displayOrder": 1 }
]
```

### `GET /api/public/subcategories?categoryId=1`
```json
[
  { "id": 1, "categoryId": 1, "name": "Community Management", "slug": "community-management" }
]
```

### `GET /api/public/vendors?q=&category=&city=`
```json
[
  {
    "id": 2,
    "name": "Prestataire 2",
    "category": "Informatique & Tech",
    "city": "Bamako",
    "country": "Sénégal",
    "rating": 4.6,
    "reviews": 22,
    "verified": true,
    "badge": "Vérifié",
    "emoji": "💻",
    "description": "Prestataire professionnel disponible sur Raktakk.",
    "services": ["Conseil", "Exécution", "Support"],
    "price": "Sur devis",
    "available": true,
    "views": 1346,
    "leads": 72
  }
]
```

### `GET /api/public/vendors/{id}`
Même format qu'un objet vendor.

### `GET /api/public/cities`
```json
[
  { "name": "Dakar", "country": "Sénégal", "vendors": 3, "emoji": "🏙️" }
]
```

### `GET /api/public/reviews?vendorId=2`
```json
[
  { "id": 21, "vendorId": 2, "client": "Aminata S.", "rating": 5, "comment": "Très satisfait du service.", "date": "2026-04-12" }
]
```

## Auth endpoints (`/api/auth/*`)

### `POST /api/auth/register`
Body:
```json
{ "email": "user@example.com", "password": "Password@123", "fullName": "User Name" }
```
Response:
```json
{ "token": "jwt", "user": { "id": 10, "email": "user@example.com", "fullName": "User Name", "role": "USER" } }
```

### `POST /api/auth/login`
Body:
```json
{ "email": "user@example.com", "password": "Password@123" }
```
Response: même format que register.

### `GET /api/auth/me`
Header: `Authorization: Bearer <jwt>`
```json
{ "id": 10, "email": "user@example.com", "fullName": "User Name", "role": "USER" }
```

## User endpoints (`/api/users/*`)

### `GET /api/users/me`
Header: `Authorization: Bearer <jwt>`
```json
{ "id": 10, "email": "user@example.com", "fullName": "User Name", "role": "USER" }
```

### `GET /api/users/admin?page=0&size=10`
Rôle `ADMIN` requis.

## Dashboard endpoints (`/api/dashboard/*`)

### `GET /api/dashboard/summary`
Header: `Authorization: Bearer <jwt>`
```json
{
  "totalUsers": 7,
  "totalVendors": 6,
  "totalCategories": 6,
  "totalSubcategories": 0,
  "currentRole": "USER"
}
```

## Error format
```json
{
  "timestamp": "2026-04-24T12:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required"
}
```
