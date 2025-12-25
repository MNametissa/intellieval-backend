# Matieres Module API Documentation

Base URL: `/api/v1/matieres`

## Overview

Matiere (course/subject) management module with enseignant assignment capabilities, pagination, and filtering.

## Endpoints

### 1. Create Matiere

**POST** `/api/v1/matieres`

Creates a new matiere.

**Authentication**: Required
**Authorization**: ADMIN only

**Request Body**:
```json
{
  "nom": "string (required, 2-200 chars)",
  "code": "string (required, unique, 3-20 chars)",
  "filiereId": "uuid (required)",
  "description": "string (optional)"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "nom": "Programmation Orientée Objet",
  "code": "INF201",
  "description": "Introduction à la POO avec Java",
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "filiere": {
    "id": "uuid",
    "name": "Génie Logiciel"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Filiere not found
- `409 Conflict`: Matiere code already exists

---

### 2. Get All Matieres

**GET** `/api/v1/matieres`

Retrieves all matieres with pagination, search, and filtering.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search in matiere nom, code, and description
- `filiereId` (optional): Filter by filiere UUID
- `sortBy` (optional, default: "nom"): Sort field (nom, code, createdAt)
- `sortOrder` (optional, default: "ASC"): Sort order (ASC, DESC)

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "nom": "Programmation Orientée Objet",
      "code": "INF201",
      "description": "Introduction à la POO",
      "filiereId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "filiere": {
        "id": "uuid",
        "name": "Génie Logiciel"
      },
      "enseignants": [
        {
          "id": "uuid",
          "name": "Dr. Dupont",
          "email": "dupont@example.com"
        }
      ]
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
# Get all matieres
GET /api/v1/matieres

# Filter by filiere
GET /api/v1/matieres?filiereId=filiere-uuid

# Search matieres
GET /api/v1/matieres?search=programmation

# Paginate and sort by code
GET /api/v1/matieres?page=2&limit=20&sortBy=code
```

---

### 3. Get Matiere by ID

**GET** `/api/v1/matieres/:id`

Retrieves a single matiere by ID with filiere and enseignants information.

**Authentication**: Required
**Authorization**: Any authenticated user

**URL Parameters**:
- `id`: Matiere UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "nom": "Programmation Orientée Objet",
  "code": "INF201",
  "description": "Introduction à la POO avec Java",
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "filiere": {
    "id": "uuid",
    "name": "Génie Logiciel",
    "department": {
      "id": "uuid",
      "name": "Informatique"
    }
  },
  "enseignants": [
    {
      "id": "uuid",
      "name": "Dr. Dupont",
      "email": "dupont@example.com",
      "departmentId": "uuid"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Matiere not found

---

### 4. Update Matiere

**PATCH** `/api/v1/matieres/:id`

Updates a matiere's information.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Matiere UUID

**Request Body** (all fields optional):
```json
{
  "nom": "string (2-200 chars)",
  "code": "string (unique, 3-20 chars)",
  "filiereId": "uuid",
  "description": "string"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "nom": "POO Avancée",
  "code": "INF201",
  "description": "Updated description",
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Matiere or filiere not found
- `409 Conflict`: Matiere code already exists

---

### 5. Delete Matiere

**DELETE** `/api/v1/matieres/:id`

Deletes a matiere.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Matiere UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Matiere not found
- `400 Bad Request`: Cannot delete matiere with associated evaluations or cours

---

### 6. Assign Enseignant to Matiere

**POST** `/api/v1/matieres/:id/enseignants`

Assigns an enseignant to teach a matiere.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Matiere UUID

**Request Body**:
```json
{
  "enseignantId": "uuid (required)"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "nom": "Programmation Orientée Objet",
  "code": "INF201",
  "enseignants": [
    {
      "id": "uuid",
      "name": "Dr. Dupont",
      "email": "dupont@example.com"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors or enseignant already assigned
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Matiere or enseignant not found

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/matieres/matiere-uuid/enseignants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "enseignantId": "enseignant-uuid"
  }'
```

---

### 7. Unassign Enseignant from Matiere

**DELETE** `/api/v1/matieres/:id/enseignants/:enseignantId`

Removes an enseignant from a matiere.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Matiere UUID
- `enseignantId`: Enseignant UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "nom": "Programmation Orientée Objet",
  "code": "INF201",
  "enseignants": []
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Matiere or enseignant not found or not assigned

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/matieres/matiere-uuid/enseignants/enseignant-uuid \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Matiere Entity
```typescript
{
  id: string;              // UUID
  nom: string;             // 2-200 chars
  code: string;            // Unique, 3-20 chars
  description?: string;    // Optional
  filiereId: string;       // Required, FK to Filiere
  createdAt: Date;
  updatedAt: Date;
  filiere?: Filiere;       // Included in responses
  enseignants?: User[];    // List of assigned enseignants
}
```

### CreateMatiereDto
```typescript
{
  nom: string;             // Required, 2-200 chars
  code: string;            // Required, unique, 3-20 chars
  filiereId: string;       // Required, must exist
  description?: string;    // Optional
}
```

### UpdateMatiereDto
```typescript
{
  nom?: string;            // Optional, 2-200 chars
  code?: string;           // Optional, unique, 3-20 chars
  filiereId?: string;      // Optional, must exist
  description?: string;    // Optional
}
```

### AssignEnseignantDto
```typescript
{
  enseignantId: string;    // Required, must be ENSEIGNANT role
}
```

---

## Business Rules

1. **Code uniqueness**: Matiere code must be globally unique
2. **Filiere requirement**: Every matiere must belong to a filiere
3. **Enseignant role**: Only users with ENSEIGNANT role can be assigned
4. **Multiple enseignants**: A matiere can have multiple enseignants
5. **Cross-matiere teaching**: An enseignant can teach multiple matieres
6. **Cascade constraints**: Cannot delete matiere with evaluations or cours

---

## Events Emitted

- `matiere.created`: When a new matiere is created
- `matiere.updated`: When a matiere is updated
- `matiere.deleted`: When a matiere is deleted
- `matiere.enseignant.assigned`: When an enseignant is assigned
- `matiere.enseignant.unassigned`: When an enseignant is removed

---

## Related Modules

- **Filieres**: Parent entity, one filiere has many matieres
- **Users**: Enseignants are assigned to matieres
- **Questionnaires**: Evaluation questionnaires linked to matieres
- **Campagnes**: Evaluation campaigns for matieres
- **Cours**: Course materials uploaded for matieres
- **Reponses**: Student evaluations of matieres

---

## Use Cases

### 1. Get all matieres for a filiere
```bash
GET /api/v1/matieres?filiereId=filiere-uuid
```

### 2. Assign enseignant to teach a course
```bash
POST /api/v1/matieres/matiere-uuid/enseignants
{
  "enseignantId": "enseignant-uuid"
}
```

### 3. Search for specific courses
```bash
GET /api/v1/matieres?search=programmation
```
