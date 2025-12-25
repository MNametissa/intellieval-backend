# Departments Module API Documentation

Base URL: `/api/v1/departments`

## Overview

Department management module for academic departments with pagination, search, and filtering capabilities.

## Endpoints

### 1. Create Department

**POST** `/api/v1/departments`

Creates a new department.

**Authentication**: Required
**Authorization**: ADMIN only

**Request Body**:
```json
{
  "name": "string (required, unique, 2-200 chars)",
  "description": "string (optional)"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "Informatique",
  "description": "Département d'Informatique et Technologies",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `409 Conflict`: Department name already exists

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/departments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Informatique",
    "description": "Département d'\''Informatique et Technologies"
  }'
```

---

### 2. Get All Departments

**GET** `/api/v1/departments`

Retrieves all departments with pagination, search, and filtering.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search in department name and description
- `sortBy` (optional, default: "name"): Sort field (name, createdAt)
- `sortOrder` (optional, default: "ASC"): Sort order (ASC, DESC)

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Informatique",
      "description": "Département d'Informatique",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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
# Get first page
GET /api/v1/departments

# Get page 2 with 20 items
GET /api/v1/departments?page=2&limit=20

# Search departments
GET /api/v1/departments?search=informatique

# Sort by creation date descending
GET /api/v1/departments?sortBy=createdAt&sortOrder=DESC
```

---

### 3. Get Department by ID

**GET** `/api/v1/departments/:id`

Retrieves a single department by ID.

**Authentication**: Required
**Authorization**: Any authenticated user

**URL Parameters**:
- `id`: Department UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "Informatique",
  "description": "Département d'Informatique",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Department not found

**Example**:
```bash
curl -X GET http://localhost:3000/api/v1/departments/uuid \
  -H "Authorization: Bearer <token>"
```

---

### 4. Update Department

**PATCH** `/api/v1/departments/:id`

Updates a department's information.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Department UUID

**Request Body** (all fields optional):
```json
{
  "name": "string (unique, 2-200 chars)",
  "description": "string"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "Informatique et Réseaux",
  "description": "Département d'Informatique et Réseaux",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Department not found
- `409 Conflict`: Department name already exists

**Example**:
```bash
curl -X PATCH http://localhost:3000/api/v1/departments/uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Informatique et Réseaux",
    "description": "Updated description"
  }'
```

---

### 5. Delete Department

**DELETE** `/api/v1/departments/:id`

Deletes a department.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Department UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Department not found
- `400 Bad Request`: Cannot delete department with associated filieres or enseignants

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/departments/uuid \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Department Entity
```typescript
{
  id: string;              // UUID
  name: string;            // Unique, 2-200 chars
  description?: string;    // Optional
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateDepartmentDto
```typescript
{
  name: string;            // Required, unique, 2-200 chars
  description?: string;    // Optional
}
```

### UpdateDepartmentDto
```typescript
{
  name?: string;           // Optional, unique, 2-200 chars
  description?: string;    // Optional
}
```

### FilterDepartmentDto
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10
  search?: string;         // Search in name and description
  sortBy?: string;         // Default: "name"
  sortOrder?: 'ASC' | 'DESC';  // Default: "ASC"
}
```

### Paginated Response
```typescript
{
  data: Department[];
  meta: {
    total: number;         // Total items
    page: number;          // Current page
    limit: number;         // Items per page
    totalPages: number;    // Total pages
  }
}
```

---

## Business Rules

1. **Name uniqueness**: Each department must have a unique name
2. **Cascade constraints**: Cannot delete department with associated filieres or enseignants
3. **Search functionality**: Search works on both name and description fields
4. **Pagination**: Default page size is 10, maximum is 100
5. **Sorting**: Default sort by name ascending

---

## Events Emitted

This module emits the following events for inter-module communication:

- `department.created`: When a new department is created
- `department.updated`: When a department is updated
- `department.deleted`: When a department is deleted

---

## Related Modules

- **Filieres**: Departments contain multiple filieres
- **Users**: ENSEIGNANT users are assigned to departments
- **Matieres**: Linked via filieres
