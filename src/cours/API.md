# Cours Module API Documentation

Base URL: `/api/v1/cours`

## Overview

Course materials (files) management module with secure upload, download, and access control based on user roles and filiere.

## Endpoints

### 1. Upload Course Material

**POST** `/api/v1/cours/upload`

Uploads a course material file.

**Authentication**: Required
**Authorization**: ENSEIGNANT or ADMIN

**Request**: Multipart form data
- `file`: File upload (required)
- `matiereId`: Matiere UUID (required, form field)
- `titre`: Course title (required, form field)
- `description`: Course description (optional, form field)

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "titre": "Chapitre 1 - Introduction à la POO",
  "description": "Cours introductif sur les concepts de base",
  "fileName": "chapitre1-poo.pdf",
  "filePath": "uploads/cours/uuid/chapitre1-poo.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "matiereId": "uuid",
  "uploadedById": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "matiere": {
    "id": "uuid",
    "nom": "Programmation Orientée Objet",
    "code": "INF201"
  },
  "uploadedBy": {
    "id": "uuid",
    "name": "Dr. Dupont"
  }
}
```

**Error Responses**:
- `400 Bad Request`: File missing or validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ENSEIGNANT or ADMIN
- `404 Not Found`: Matiere not found
- `413 Payload Too Large`: File exceeds size limit

**Supported File Types**:
- PDF (.pdf)
- Word (.doc, .docx)
- PowerPoint (.ppt, .pptx)
- Images (.jpg, .png)
- Archives (.zip, .rar)

**Maximum File Size**: 50MB (configurable)

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/cours/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@chapitre1.pdf" \
  -F "matiereId=matiere-uuid" \
  -F "titre=Chapitre 1 - Introduction" \
  -F "description=Cours introductif"
```

---

### 2. Get All Course Materials

**GET** `/api/v1/cours`

Retrieves course materials with filtering based on user role.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `matiereId` (optional): Filter by matiere UUID
- `filiereId` (optional): Filter by filiere UUID
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Access Rules**:
- **ADMIN**: Can view all cours
- **ENSEIGNANT**: Can view cours for matieres they teach
- **ETUDIANT**: Can view cours for their filiere's matieres

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "titre": "Chapitre 1 - Introduction à la POO",
      "description": "Cours introductif",
      "fileName": "chapitre1-poo.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "matiereId": "uuid",
      "uploadedById": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "matiere": {
        "id": "uuid",
        "nom": "Programmation Orientée Objet",
        "code": "INF201",
        "filiere": {
          "id": "uuid",
          "name": "Génie Logiciel"
        }
      },
      "uploadedBy": {
        "id": "uuid",
        "name": "Dr. Dupont"
      }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Examples**:
```bash
# Get all accessible cours
GET /api/v1/cours

# Filter by matiere
GET /api/v1/cours?matiereId=matiere-uuid

# Filter by filiere (for students)
GET /api/v1/cours?filiereId=filiere-uuid

# Paginate
GET /api/v1/cours?page=2&limit=20
```

---

### 3. Get Course Material by ID

**GET** `/api/v1/cours/:id`

Retrieves a single course material.

**Authentication**: Required
**Authorization**: Based on access rules (see Get All)

**URL Parameters**:
- `id`: Cours UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "titre": "Chapitre 1 - Introduction à la POO",
  "description": "Cours introductif sur les concepts de base",
  "fileName": "chapitre1-poo.pdf",
  "filePath": "uploads/cours/uuid/chapitre1-poo.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "matiereId": "uuid",
  "uploadedById": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "matiere": {
    "id": "uuid",
    "nom": "Programmation Orientée Objet",
    "code": "INF201",
    "filiere": {
      "id": "uuid",
      "name": "Génie Logiciel",
      "department": {
        "id": "uuid",
        "name": "Informatique"
      }
    }
  },
  "uploadedBy": {
    "id": "uuid",
    "name": "Dr. Dupont",
    "email": "dupont@example.com"
  }
}
```

**Error Responses**:
- `404 Not Found`: Cours not found
- `403 Forbidden`: User doesn't have access to this cours

---

### 4. Download Course Material

**GET** `/api/v1/cours/:id/download`

Downloads the course material file.

**Authentication**: Required
**Authorization**: Based on access rules

**URL Parameters**:
- `id`: Cours UUID

**Success Response** (200 OK):
- Returns file stream with appropriate headers
- Content-Type based on file type
- Content-Disposition: attachment with filename

**Response Headers**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="chapitre1-poo.pdf"
Content-Length: 2048576
```

**Error Responses**:
- `403 Forbidden`: User doesn't have access to this cours
- `404 Not Found`: Cours or file not found

**Example**:
```bash
curl -X GET http://localhost:3000/api/v1/cours/cours-uuid/download \
  -H "Authorization: Bearer <token>" \
  --output downloaded-file.pdf
```

---

### 5. Update Course Material

**PATCH** `/api/v1/cours/:id`

Updates course material metadata (not the file itself).

**Authentication**: Required
**Authorization**: ENSEIGNANT (who uploaded it) or ADMIN

**URL Parameters**:
- `id`: Cours UUID

**Request Body** (all fields optional):
```json
{
  "titre": "string",
  "description": "string",
  "matiereId": "uuid"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "titre": "Chapitre 1 - Introduction (Mise à jour)",
  "description": "Updated description",
  "fileName": "chapitre1-poo.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "matiereId": "uuid",
  "uploadedById": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User didn't upload this file (unless ADMIN)
- `404 Not Found`: Cours not found

---

### 6. Delete Course Material

**DELETE** `/api/v1/cours/:id`

Deletes a course material and its file.

**Authentication**: Required
**Authorization**: ENSEIGNANT (who uploaded it) or ADMIN

**URL Parameters**:
- `id`: Cours UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User didn't upload this file (unless ADMIN)
- `404 Not Found`: Cours not found

**Note**: This permanently deletes both the database record and the file from storage.

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/cours/cours-uuid \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Cours Entity
```typescript
{
  id: string;              // UUID
  titre: string;           // Course title
  description?: string;    // Optional description
  fileName: string;        // Original filename
  filePath: string;        // Server file path
  fileSize: number;        // Size in bytes
  mimeType: string;        // File MIME type
  matiereId: string;       // FK to Matiere
  uploadedById: string;    // FK to User (ENSEIGNANT)
  createdAt: Date;
  updatedAt: Date;
  matiere?: Matiere;
  uploadedBy?: User;
}
```

### UploadCoursDto
```typescript
{
  titre: string;           // Required
  description?: string;    // Optional
  matiereId: string;       // Required
  file: File;             // Required, multipart upload
}
```

### UpdateCoursDto
```typescript
{
  titre?: string;
  description?: string;
  matiereId?: string;
}
```

---

## Business Rules

### 1. Access Control

**Upload Permission**:
- ENSEIGNANT: Can upload for matieres they teach
- ADMIN: Can upload for any matiere

**View Permission**:
- ADMIN: Can view all cours
- ENSEIGNANT: Can view cours for matieres they teach
- ETUDIANT: Can view cours for matieres in their filiere

**Modify Permission**:
- ENSEIGNANT: Can modify/delete only their uploads
- ADMIN: Can modify/delete any cours

### 2. File Storage
- Files stored in `uploads/cours/:id/` directory
- Original filename preserved
- Unique directory per cours for organization
- File size limit enforced (default 50MB)

### 3. File Types
- Allowed MIME types validated
- Common educational formats supported
- Executables and scripts blocked for security

### 4. Cascade Operations
- Deleting cours deletes associated file from disk
- Deleting matiere should handle associated cours

---

## Security Considerations

1. **File Validation**:
   - MIME type checking
   - File extension validation
   - Size limits enforced

2. **Access Control**:
   - Role-based permissions
   - Filiere-based filtering for students
   - Teacher assignment verification

3. **Path Security**:
   - No path traversal allowed
   - Files stored in controlled directory
   - Unique IDs prevent filename conflicts

4. **Download Safety**:
   - Files served with appropriate headers
   - Content-Disposition prevents inline execution
   - Access checked before file streaming

---

## Events Emitted

- `cours.uploaded`: When a new cours is uploaded
- `cours.updated`: When cours metadata is updated
- `cours.deleted`: When a cours is deleted
- `cours.downloaded`: When a cours is downloaded (optional)

---

## Related Modules

- **Matieres**: Cours belong to matieres
- **Users**: ENSEIGNANT users upload cours
- **Filieres**: Access control based on filiere
- **Notifications**: Notify students when new cours uploaded

---

## Use Cases

### 1. Teacher uploads course material
```bash
POST /api/v1/cours/upload
Authorization: Bearer <enseignant-token>
Content-Type: multipart/form-data

file=@lecture-notes.pdf
matiereId=matiere-uuid
titre=Lecture 1 - Introduction
description=First lecture notes
```

### 2. Student downloads course materials for their program
```bash
# Student automatically filtered by their filiere
GET /api/v1/cours
Authorization: Bearer <student-token>
```

### 3. Teacher updates course description
```bash
PATCH /api/v1/cours/cours-uuid
Authorization: Bearer <enseignant-token>
{
  "description": "Updated with new examples"
}
```

### 4. Admin views all course materials
```bash
GET /api/v1/cours
Authorization: Bearer <admin-token>
```

### 5. Download specific course material
```bash
GET /api/v1/cours/cours-uuid/download
Authorization: Bearer <token>
```
