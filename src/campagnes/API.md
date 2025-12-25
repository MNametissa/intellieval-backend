# Campagnes Module API Documentation

Base URL: `/api/v1/campagnes`

## Overview

Evaluation campaign management module for scheduling and managing evaluation periods for matieres.

## Endpoints

### 1. Create Campagne

**POST** `/api/v1/campagnes`

Creates a new evaluation campagne.

**Authentication**: Required
**Authorization**: ADMIN only

**Request Body**:
```json
{
  "titre": "string (required, 2-200 chars)",
  "description": "string (optional)",
  "dateDebut": "ISO 8601 date string (required)",
  "dateFin": "ISO 8601 date string (required, after dateDebut)",
  "questionnaireId": "uuid (required)",
  "matiereId": "uuid (required)",
  "filiereId": "uuid (required)"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "titre": "Évaluation Semestre 1 - POO",
  "description": "Évaluation du cours de Programmation Orientée Objet",
  "dateDebut": "2024-01-15T00:00:00.000Z",
  "dateFin": "2024-01-31T23:59:59.000Z",
  "statut": "PLANIFIEE",
  "questionnaireId": "uuid",
  "matiereId": "uuid",
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "questionnaire": {
    "id": "uuid",
    "titre": "Questionnaire Standard"
  },
  "matiere": {
    "id": "uuid",
    "nom": "Programmation Orientée Objet",
    "code": "INF201"
  },
  "filiere": {
    "id": "uuid",
    "name": "Génie Logiciel"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (dateFin before dateDebut, overlapping campagnes)
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Questionnaire, matiere, or filiere not found

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/campagnes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Évaluation Semestre 1 - POO",
    "description": "Évaluation du cours de POO",
    "dateDebut": "2024-01-15T00:00:00.000Z",
    "dateFin": "2024-01-31T23:59:59.000Z",
    "questionnaireId": "questionnaire-uuid",
    "matiereId": "matiere-uuid",
    "filiereId": "filiere-uuid"
  }'
```

---

### 2. Get All Campagnes

**GET** `/api/v1/campagnes`

Retrieves all campagnes with pagination, search, and filtering.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search in titre and description
- `statut` (optional): Filter by status (PLANIFIEE, EN_COURS, TERMINEE)
- `matiereId` (optional): Filter by matiere UUID
- `filiereId` (optional): Filter by filiere UUID
- `sortBy` (optional, default: "dateDebut"): Sort field
- `sortOrder` (optional, default: "DESC"): Sort order (ASC, DESC)

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "titre": "Évaluation Semestre 1 - POO",
      "description": "Évaluation du cours de POO",
      "dateDebut": "2024-01-15T00:00:00.000Z",
      "dateFin": "2024-01-31T23:59:59.000Z",
      "statut": "EN_COURS",
      "questionnaireId": "uuid",
      "matiereId": "uuid",
      "filiereId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "questionnaire": {
        "id": "uuid",
        "titre": "Questionnaire Standard"
      },
      "matiere": {
        "id": "uuid",
        "nom": "Programmation Orientée Objet",
        "code": "INF201"
      },
      "filiere": {
        "id": "uuid",
        "name": "Génie Logiciel"
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
# Get all campagnes
GET /api/v1/campagnes

# Filter by status
GET /api/v1/campagnes?statut=EN_COURS

# Filter by matiere
GET /api/v1/campagnes?matiereId=matiere-uuid

# Filter by filiere
GET /api/v1/campagnes?filiereId=filiere-uuid

# Search campagnes
GET /api/v1/campagnes?search=programmation

# Paginate and sort
GET /api/v1/campagnes?page=1&limit=20&sortBy=dateDebut&sortOrder=DESC
```

---

### 3. Get Campagne by ID

**GET** `/api/v1/campagnes/:id`

Retrieves a single campagne with full details.

**Authentication**: Required
**Authorization**: Any authenticated user

**URL Parameters**:
- `id`: Campagne UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "titre": "Évaluation Semestre 1 - POO",
  "description": "Évaluation complète du cours de Programmation Orientée Objet",
  "dateDebut": "2024-01-15T00:00:00.000Z",
  "dateFin": "2024-01-31T23:59:59.000Z",
  "statut": "EN_COURS",
  "questionnaireId": "uuid",
  "matiereId": "uuid",
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z",
  "questionnaire": {
    "id": "uuid",
    "titre": "Questionnaire Standard",
    "questions": [
      {
        "id": "uuid",
        "texte": "Qualité de l'enseignement",
        "type": "ECHELLE",
        "ordre": 1
      }
    ]
  },
  "matiere": {
    "id": "uuid",
    "nom": "Programmation Orientée Objet",
    "code": "INF201",
    "enseignants": [
      {
        "id": "uuid",
        "name": "Dr. Dupont"
      }
    ]
  },
  "filiere": {
    "id": "uuid",
    "name": "Génie Logiciel",
    "department": {
      "id": "uuid",
      "name": "Informatique"
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Campagne not found

---

### 4. Update Campagne

**PATCH** `/api/v1/campagnes/:id`

Updates a campagne's information.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Campagne UUID

**Request Body** (all fields optional):
```json
{
  "titre": "string (2-200 chars)",
  "description": "string",
  "dateDebut": "ISO 8601 date string",
  "dateFin": "ISO 8601 date string",
  "statut": "PLANIFIEE | EN_COURS | TERMINEE",
  "questionnaireId": "uuid",
  "matiereId": "uuid",
  "filiereId": "uuid"
}
```

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "titre": "Évaluation Semestre 1 - POO (Mise à jour)",
  "description": "Updated description",
  "dateDebut": "2024-01-15T00:00:00.000Z",
  "dateFin": "2024-02-05T23:59:59.000Z",
  "statut": "EN_COURS",
  "questionnaireId": "uuid",
  "matiereId": "uuid",
  "filiereId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Campagne, questionnaire, matiere, or filiere not found

---

### 5. Delete Campagne

**DELETE** `/api/v1/campagnes/:id`

Deletes a campagne.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Campagne UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Campagne not found
- `400 Bad Request`: Cannot delete campagne with submitted evaluations

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/campagnes/uuid \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Campagne Entity
```typescript
{
  id: string;              // UUID
  titre: string;           // 2-200 chars
  description?: string;    // Optional
  dateDebut: Date;         // Start date
  dateFin: Date;           // End date (must be after dateDebut)
  statut: CampagneStatut;  // PLANIFIEE, EN_COURS, TERMINEE
  questionnaireId: string; // FK to Questionnaire
  matiereId: string;       // FK to Matiere
  filiereId: string;       // FK to Filiere
  createdAt: Date;
  updatedAt: Date;
  questionnaire?: Questionnaire;
  matiere?: Matiere;
  filiere?: Filiere;
}
```

### CampagneStatut Enum
```typescript
enum CampagneStatut {
  PLANIFIEE = 'PLANIFIEE',   // Scheduled, not started
  EN_COURS = 'EN_COURS',     // Currently active
  TERMINEE = 'TERMINEE'      // Ended
}
```

### CreateCampagneDto
```typescript
{
  titre: string;           // Required, 2-200 chars
  description?: string;    // Optional
  dateDebut: Date;         // Required
  dateFin: Date;           // Required, after dateDebut
  questionnaireId: string; // Required, must exist
  matiereId: string;       // Required, must exist
  filiereId: string;       // Required, must exist
}
```

### UpdateCampagneDto
```typescript
{
  titre?: string;
  description?: string;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: CampagneStatut;
  questionnaireId?: string;
  matiereId?: string;
  filiereId?: string;
}
```

---

## Business Rules

1. **Date validation**: dateFin must be after dateDebut
2. **Status lifecycle**:
   - **PLANIFIEE**: Created but not yet started
   - **EN_COURS**: Currently accepting evaluations
   - **TERMINEE**: Evaluation period ended
3. **Status auto-update**: System automatically updates status based on current date
4. **Overlap prevention**: Optional validation to prevent overlapping campagnes for same matiere
5. **Cascade constraints**: Cannot delete campagne with submitted evaluations

---

## Automatic Status Updates

The system automatically updates campagne status based on dates:

- Before `dateDebut`: Status = PLANIFIEE
- Between `dateDebut` and `dateFin`: Status = EN_COURS
- After `dateFin`: Status = TERMINEE

---

## Events Emitted

- `campagne.created`: When a new campagne is created
- `campagne.updated`: When a campagne is updated
- `campagne.deleted`: When a campagne is deleted
- `campagne.started`: When a campagne starts (dateDebut reached)
- `campagne.ended`: When a campagne ends (dateFin reached)

---

## Related Modules

- **Questionnaires**: Campagnes use questionnaires
- **Matieres**: Campagnes evaluate matieres
- **Filieres**: Campagnes target specific filieres
- **Reponses**: Students submit evaluations during campagnes
- **Notifications**: Users notified when campagnes start/end

---

## Use Cases

### 1. Create evaluation campaign for a course
```bash
POST /api/v1/campagnes
{
  "titre": "Évaluation Semestre 1 - Bases de Données",
  "description": "Évaluation du cours de BD",
  "dateDebut": "2024-01-15T00:00:00.000Z",
  "dateFin": "2024-01-31T23:59:59.000Z",
  "questionnaireId": "questionnaire-uuid",
  "matiereId": "matiere-uuid",
  "filiereId": "filiere-uuid"
}
```

### 2. Get active campaigns for students
```bash
GET /api/v1/campagnes?statut=EN_COURS&filiereId=student-filiere-uuid
```

### 3. Get all campaigns for a specific matiere
```bash
GET /api/v1/campagnes?matiereId=matiere-uuid
```

### 4. Extend campaign deadline
```bash
PATCH /api/v1/campagnes/campagne-uuid
{
  "dateFin": "2024-02-15T23:59:59.000Z"
}
```
