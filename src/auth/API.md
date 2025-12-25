# Auth Module API Documentation

Base URL: `/api/v1/auth`

## Overview

Authentication module handling user login and profile retrieval using JWT tokens.

## Endpoints

### 1. Login

**POST** `/api/v1/auth/login`

Authenticates a user and returns a JWT token.

**Authentication**: Not required (Public endpoint)

**Request Body**:
```json
{
  "email": "string (required, email format)",
  "password": "string (required)"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN | ENSEIGNANT | ETUDIANT",
    "departmentId": "uuid | null",
    "filiereId": "uuid | null"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "statusCode": 401,
    "message": "Email ou mot de passe incorrect",
    "error": "Unauthorized"
  }
  ```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@intellieval.com",
    "password": "password123"
  }'
```

---

### 2. Get Profile

**GET** `/api/v1/auth/profile`

Retrieves the authenticated user's profile information.

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "message": "Profil récupéré avec succès",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "ADMIN | ENSEIGNANT | ETUDIANT",
    "departmentId": "uuid | null",
    "filiereId": "uuid | null",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized"
  }
  ```

**Example**:
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Data Models

### LoginDto
```typescript
{
  email: string;      // Required, must be valid email
  password: string;   // Required
}
```

### AuthResponseDto
```typescript
{
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    departmentId?: string;
    filiereId?: string;
  }
}
```

### JwtPayload
```typescript
{
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  filiereId?: string;
  iat: number;
  exp: number;
}
```

---

## Authentication Flow

1. User submits credentials via `/auth/login`
2. Server validates credentials against database
3. If valid, server generates JWT token with user information
4. Client stores token (localStorage/sessionStorage)
5. Client includes token in `Authorization` header for subsequent requests
6. Server validates token on protected endpoints

---

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 24 hours (configurable via JWT_EXPIRATION env variable)
- Login endpoint is rate-limited to prevent brute force attacks
- All other endpoints require valid JWT authentication
