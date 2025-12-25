# Filieres Module API Documentation

Base URL: `/api/v1/filieres`

## Overview

Filiere (academic program/track) management module with pagination, search, and filtering by department.

## Endpoints

### 1. Create Filiere

**POST** `/api/v1/filieres`

Creates a new filiere.

**Authentication**: Required
**Authorization**: ADMIN only

**Request Body**:
```json
{
  "name": "string (required, 2-200 chars)",
  "departmentId": "uuid (required)",
  "description": "string (optional)"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "Génie Logiciel",
  "description": "Filière de Génie Logiciel et Développement",
  "departmentId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "department": {
    "id": "uuid",
    "name": "Informatique"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Department not found
- `409 Conflict`: Filiere name already exists in this department

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/filieres \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Génie Logiciel",
    "departmentId": "dept-uuid",
    "description": "Filière de Génie Logiciel"
  }'
```

---

### 2. Get All Filieres

**GET** `/api/v1/filieres`

Retrieves all filieres with pagination, search, and filtering.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search in filiere name and description
- `departmentId` (optional): Filter by department UUID
- `sortBy` (optional, default: "name"): Sort field (name, createdAt)
- `sortOrder` (optional, default: "ASC"): Sort order (ASC, DESC)

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Génie Logiciel",
      "description": "Filière de Génie Logiciel",
      "departmentId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "department": {
        "id": "uuid",
        "name": "Informatique"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Examples**:
```bash
# Get all filieres
GET /api/v1/filieres

# Filter by department
GET /api/v1/filieres?departmentId=dept-uuid

# Search filieres
GET /api/v1/filieres?search=logiciel

# Paginate and sort
GET /api/v1/filieres?page=2&limit=20&sortBy=createdAt&sortOrder=DESC
```

---

### 3. Get Filiere by ID

**GET** `/api/v1/filieres/:id`

Retrieves a single filiere by ID with department information.

**Authentication**: Required
**Authorization**: Any authenticated user

**URL Parameters**:
- `id`: Filiere UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "Génie Logiciel",
  "description": "Filière de Génie Logiciel",
  "departmentId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "department": {
    "id": "uuid",
    "name": "Informatique",
    "description": "Département d'Informatique"
  }
}
```

**Error Responses**:
- `404 Not Found`: Filiere not found

---

### 4. Update Filiere

**PATCH** `/api/v1/filieres/:id`

Updates a filiere's information.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Filiere UUID

**Request Body** (all fields optional):
```json
{
  "name": "string (2-200 chars)",
  "departmentId": "uuid",
  "description": "string"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "Génie Logiciel et IA",
  "description": "Updated description",
  "departmentId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "department": {
    "id": "uuid",
    "name": "Informatique"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Filiere or department not found
- `409 Conflict`: Filiere name already exists in target department

---

### 5. Delete Filiere

**DELETE** `/api/v1/filieres/:id`

Deletes a filiere.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Filiere UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Filiere not found
- `400 Bad Request`: Cannot delete filiere with associated students or matieres

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/filieres/uuid \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Filiere Entity
```typescript
{
  id: string;              // UUID
  name: string;            // 2-200 chars
  description?: string;    // Optional
  departmentId: string;    // Required, FK to Department
  createdAt: Date;
  updatedAt: Date;
  department?: Department; // Included in responses
}
```

### CreateFiliereDto
```typescript
{
  name: string;            // Required, 2-200 chars
  departmentId: string;    // Required, must exist
  description?: string;    // Optional
}
```

### UpdateFiliereDto
```typescript
{
  name?: string;           // Optional, 2-200 chars
  departmentId?: string;   // Optional, must exist
  description?: string;    // Optional
}
```

### FilterFiliereDto
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10
  search?: string;         // Search in name and description
  departmentId?: string;   // Filter by department UUID
  sortBy?: string;         // Default: "name"
  sortOrder?: 'ASC' | 'DESC';  // Default: "ASC"
}
```

---

## Business Rules

1. **Department requirement**: Every filiere must belong to a department
2. **Unique constraint**: Filiere name must be unique within the same department
3. **Cross-department names**: Same filiere name can exist in different departments
4. **Cascade constraints**: Cannot delete filiere with associated students or matieres
5. **Department validation**: Department must exist when creating/updating filiere

---

## Events Emitted

This module emits the following events:

- `filiere.created`: When a new filiere is created
- `filiere.updated`: When a filiere is updated
- `filiere.deleted`: When a filiere is deleted

---

## Related Modules

- **Departments**: Parent entity, one department has many filieres
- **Users**: ETUDIANT users are assigned to filieres
- **Matieres**: Filieres contain multiple matieres
- **Campagnes**: Evaluation campaigns target filieres

---

## Use Cases

### 1. List filieres by department for student enrollment
```bash
GET /api/v1/filieres?departmentId=dept-uuid&page=1&limit=50
```

### 2. Search for a specific program
```bash
GET /api/v1/filieres?search=génie logiciel
```

### 3. Create a new academic program
```bash
POST /api/v1/filieres
{
  "name": "Intelligence Artificielle",
  "departmentId": "dept-uuid",
  "description": "Programme d'IA et Machine Learning"
}
```
