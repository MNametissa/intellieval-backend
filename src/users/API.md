# Users Module API Documentation

Base URL: `/api/v1/users`

## Overview

User management module handling CRUD operations, bulk import, and filtering by role/department/filiere.

**Roles**: ADMIN, ENSEIGNANT, ETUDIANT

## Endpoints

### 1. Create User

**POST** `/api/v1/users`

Creates a new user.

**Authentication**: Required
**Authorization**: ADMIN only

**Request Body**:
```json
{
  "name": "string (required, 2-100 chars)",
  "email": "string (required, unique, email format)",
  "password": "string (required, min 8 chars)",
  "role": "ADMIN | ENSEIGNANT | ETUDIANT (required)",
  "matricule": "string (optional, unique)",
  "departmentId": "uuid (optional, required for ENSEIGNANT)",
  "filiereId": "uuid (optional, required for ETUDIANT)"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ETUDIANT",
  "matricule": "ETU2024001",
  "departmentId": null,
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `409 Conflict`: Email or matricule already exists

---

### 2. Get All Users

**GET** `/api/v1/users`

Retrieves all users with optional filtering.

**Authentication**: Required
**Authorization**: ADMIN only

**Query Parameters**:
- `role` (optional): Filter by role (ADMIN, ENSEIGNANT, ETUDIANT)
- `departmentId` (optional): Filter by department UUID
- `filiereId` (optional): Filter by filiere UUID

**Success Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ETUDIANT",
    "matricule": "ETU2024001",
    "departmentId": null,
    "filiereId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Examples**:
```bash
# Get all users
GET /api/v1/users

# Get all students
GET /api/v1/users?role=ETUDIANT

# Get all users in a department
GET /api/v1/users?departmentId=uuid

# Get all users in a filiere
GET /api/v1/users?filiereId=uuid
```

---

### 3. Get User by ID

**GET** `/api/v1/users/:id`

Retrieves a single user by ID.

**Authentication**: Required
**Authorization**: Any authenticated user

**URL Parameters**:
- `id`: User UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ETUDIANT",
  "matricule": "ETU2024001",
  "departmentId": null,
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### 4. Update User

**PATCH** `/api/v1/users/:id`

Updates a user's information.

**Authentication**: Required
**Authorization**: Any authenticated user (can update their own profile)

**URL Parameters**:
- `id`: User UUID

**Request Body** (all fields optional):
```json
{
  "name": "string",
  "email": "string (email format)",
  "password": "string (min 8 chars)",
  "role": "ADMIN | ENSEIGNANT | ETUDIANT",
  "matricule": "string",
  "departmentId": "uuid",
  "filiereId": "uuid"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "ETUDIANT",
  "matricule": "ETU2024001",
  "departmentId": null,
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found
- `409 Conflict`: Email or matricule already in use

---

### 5. Delete User

**DELETE** `/api/v1/users/:id`

Deletes a user.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: User UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: User not found

---

### 6. Download Import Template

**GET** `/api/v1/users/import/template`

Downloads an Excel template for bulk user import.

**Authentication**: Required
**Authorization**: ADMIN only

**Success Response** (200 OK):
```json
{
  "buffer": "base64-encoded-excel-file",
  "filename": "template_import_utilisateurs.xlsx",
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}
```

**Template Columns**:
- Nom (required)
- Email (required, unique)
- Matricule (optional, unique)
- Mot de passe (required)
- Rôle (required: ADMIN, ENSEIGNANT, ETUDIANT)
- ID Département (optional, for ENSEIGNANT)
- ID Filière (optional, for ETUDIANT)

---

### 7. Preview Import

**POST** `/api/v1/users/import/preview`

Previews users from an Excel file before importing.

**Authentication**: Required
**Authorization**: ADMIN only

**Request**: Multipart form data
- `file`: Excel file (.xlsx)

**Success Response** (200 OK):
```json
{
  "valid": [
    {
      "row": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ETUDIANT",
      "matricule": "ETU001"
    }
  ],
  "invalid": [
    {
      "row": 3,
      "errors": ["Email déjà utilisé", "Matricule requis pour ETUDIANT"]
    }
  ],
  "summary": {
    "total": 50,
    "valid": 45,
    "invalid": 5
  }
}
```

**Error Responses**:
- `400 Bad Request`: File missing or invalid format

---

### 8. Import Users

**POST** `/api/v1/users/import`

Imports users from an Excel file.

**Authentication**: Required
**Authorization**: ADMIN only

**Request**: Multipart form data
- `file`: Excel file (.xlsx)

**Success Response** (201 Created):
```json
{
  "imported": 45,
  "failed": 5,
  "errors": [
    {
      "row": 3,
      "email": "duplicate@example.com",
      "error": "Email déjà utilisé"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: File missing or invalid format

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/users/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@users.xlsx"
```

---

## Data Models

### User Entity
```typescript
{
  id: string;              // UUID
  name: string;            // 2-100 chars
  email: string;           // Unique, email format
  password: string;        // Hashed, not returned in responses
  role: UserRole;          // ADMIN, ENSEIGNANT, ETUDIANT
  matricule?: string;      // Unique student/teacher ID
  departmentId?: string;   // Required for ENSEIGNANT
  filiereId?: string;      // Required for ETUDIANT
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateUserDto
```typescript
{
  name: string;            // Required, 2-100 chars
  email: string;           // Required, unique, email format
  password: string;        // Required, min 8 chars
  role: UserRole;          // Required
  matricule?: string;      // Optional, unique
  departmentId?: string;   // Optional, required for ENSEIGNANT
  filiereId?: string;      // Optional, required for ETUDIANT
}
```

### UpdateUserDto
```typescript
{
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  matricule?: string;
  departmentId?: string;
  filiereId?: string;
}
```

---

## Business Rules

1. **Email uniqueness**: Each user must have a unique email
2. **Matricule uniqueness**: If provided, matricule must be unique
3. **Department assignment**: ENSEIGNANT must have departmentId
4. **Filiere assignment**: ETUDIANT must have filiereId
5. **Password hashing**: All passwords are hashed with bcrypt before storage
6. **Password security**: Passwords never returned in API responses

---

## Import File Rules

1. **File format**: Excel (.xlsx) only
2. **Required columns**: Nom, Email, Mot de passe, Rôle
3. **Role values**: Must be exactly "ADMIN", "ENSEIGNANT", or "ETUDIANT"
4. **Validation**: All rows validated before import
5. **Partial import**: Valid rows imported even if some rows fail
6. **Error reporting**: Detailed error messages for failed rows
