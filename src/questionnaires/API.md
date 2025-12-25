# Questionnaires Module API Documentation

Base URL: `/api/v1/questionnaires`

## Overview

Questionnaire management module for creating and managing evaluation questionnaires with questions.

## Endpoints

### 1. Create Questionnaire

**POST** `/api/v1/questionnaires`

Creates a new questionnaire with questions.

**Authentication**: Required
**Authorization**: ADMIN only

**Request Body**:
```json
{
  "titre": "string (required, 2-200 chars)",
  "description": "string (optional)",
  "questions": [
    {
      "texte": "string (required)",
      "type": "ECHELLE | TEXTE_LIBRE (required)",
      "ordre": "number (required, unique within questionnaire)",
      "obligatoire": "boolean (default: true)"
    }
  ]
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "titre": "Évaluation Enseignement 2024",
  "description": "Questionnaire d'évaluation des enseignements",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "questions": [
    {
      "id": "uuid",
      "texte": "La qualité de l'enseignement",
      "type": "ECHELLE",
      "ordre": 1,
      "obligatoire": true,
      "questionnaireId": "uuid"
    },
    {
      "id": "uuid",
      "texte": "Commentaires additionnels",
      "type": "TEXTE_LIBRE",
      "ordre": 2,
      "obligatoire": false,
      "questionnaireId": "uuid"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/questionnaires \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Évaluation Enseignement 2024",
    "description": "Questionnaire standard",
    "questions": [
      {
        "texte": "Qualité de l'\''enseignement (1-5)",
        "type": "ECHELLE",
        "ordre": 1,
        "obligatoire": true
      },
      {
        "texte": "Commentaires",
        "type": "TEXTE_LIBRE",
        "ordre": 2,
        "obligatoire": false
      }
    ]
  }'
```

---

### 2. Get All Questionnaires

**GET** `/api/v1/questionnaires`

Retrieves all questionnaires with pagination, search, and filtering.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search in titre and description
- `sortBy` (optional, default: "titre"): Sort field (titre, createdAt)
- `sortOrder` (optional, default: "ASC"): Sort order (ASC, DESC)

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "titre": "Évaluation Enseignement 2024",
      "description": "Questionnaire d'évaluation",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "questions": [
        {
          "id": "uuid",
          "texte": "Qualité de l'enseignement",
          "type": "ECHELLE",
          "ordre": 1,
          "obligatoire": true
        }
      ]
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Examples**:
```bash
# Get all questionnaires
GET /api/v1/questionnaires

# Search questionnaires
GET /api/v1/questionnaires?search=enseignement

# Paginate and sort
GET /api/v1/questionnaires?page=1&limit=20&sortBy=createdAt&sortOrder=DESC
```

---

### 3. Get Questionnaire by ID

**GET** `/api/v1/questionnaires/:id`

Retrieves a single questionnaire with all questions.

**Authentication**: Required
**Authorization**: Any authenticated user

**URL Parameters**:
- `id`: Questionnaire UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "titre": "Évaluation Enseignement 2024",
  "description": "Questionnaire d'évaluation des enseignements",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "questions": [
    {
      "id": "uuid",
      "texte": "La qualité de l'enseignement",
      "type": "ECHELLE",
      "ordre": 1,
      "obligatoire": true,
      "questionnaireId": "uuid"
    },
    {
      "id": "uuid",
      "texte": "La clarté des explications",
      "type": "ECHELLE",
      "ordre": 2,
      "obligatoire": true,
      "questionnaireId": "uuid"
    },
    {
      "id": "uuid",
      "texte": "Commentaires additionnels",
      "type": "TEXTE_LIBRE",
      "ordre": 3,
      "obligatoire": false,
      "questionnaireId": "uuid"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Questionnaire not found

---

### 4. Update Questionnaire

**PATCH** `/api/v1/questionnaires/:id`

Updates a questionnaire's information.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Questionnaire UUID

**Request Body** (all fields optional):
```json
{
  "titre": "string (2-200 chars)",
  "description": "string"
}
```

**Note**: To update questions, use separate question management endpoints (not implemented in current controller).

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "titre": "Évaluation Enseignement 2024 - Mise à jour",
  "description": "Updated description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Questionnaire not found

---

### 5. Delete Questionnaire

**DELETE** `/api/v1/questionnaires/:id`

Deletes a questionnaire and all associated questions.

**Authentication**: Required
**Authorization**: ADMIN only

**URL Parameters**:
- `id`: Questionnaire UUID

**Success Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN role
- `404 Not Found`: Questionnaire not found
- `400 Bad Request`: Cannot delete questionnaire used in active campagnes

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/questionnaires/uuid \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Questionnaire Entity
```typescript
{
  id: string;              // UUID
  titre: string;           // 2-200 chars
  description?: string;    // Optional
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];  // Array of questions
}
```

### Question Entity
```typescript
{
  id: string;              // UUID
  texte: string;           // Question text
  type: QuestionType;      // ECHELLE or TEXTE_LIBRE
  ordre: number;           // Question order (1, 2, 3...)
  obligatoire: boolean;    // Required or optional
  questionnaireId: string; // FK to Questionnaire
  createdAt: Date;
  updatedAt: Date;
}
```

### QuestionType Enum
```typescript
enum QuestionType {
  ECHELLE = 'ECHELLE',        // Scale question (1-5 rating)
  TEXTE_LIBRE = 'TEXTE_LIBRE' // Free text comment
}
```

### CreateQuestionnaireDto
```typescript
{
  titre: string;           // Required, 2-200 chars
  description?: string;    // Optional
  questions: CreateQuestionDto[];  // Array of questions
}
```

### CreateQuestionDto
```typescript
{
  texte: string;           // Required, question text
  type: QuestionType;      // Required, ECHELLE or TEXTE_LIBRE
  ordre: number;           // Required, unique within questionnaire
  obligatoire?: boolean;   // Optional, default: true
}
```

### UpdateQuestionnaireDto
```typescript
{
  titre?: string;          // Optional, 2-200 chars
  description?: string;    // Optional
}
```

---

## Business Rules

1. **Question order**: Questions must have unique ordre values within a questionnaire
2. **Question types**:
   - **ECHELLE**: Rating scale question (typically 1-5)
   - **TEXTE_LIBRE**: Free text comment field
3. **Required questions**: By default, all questions are obligatoire (required)
4. **Cascade delete**: Deleting a questionnaire deletes all associated questions
5. **Active usage**: Cannot delete questionnaire used in active evaluation campagnes

---

## Question Types Explained

### ECHELLE (Scale Question)
- Used for quantitative evaluation
- Students provide a rating (1-5)
- Example: "La qualité de l'enseignement (1-5)"
- Results can be aggregated statistically

### TEXTE_LIBRE (Free Text)
- Used for qualitative feedback
- Students provide text comments
- Example: "Commentaires additionnels sur le cours"
- Results displayed as text in reports

---

## Events Emitted

- `questionnaire.created`: When a new questionnaire is created
- `questionnaire.updated`: When a questionnaire is updated
- `questionnaire.deleted`: When a questionnaire is deleted

---

## Related Modules

- **Campagnes**: Campagnes use questionnaires for evaluations
- **Reponses**: Student responses to questionnaire questions

---

## Use Cases

### 1. Create standard evaluation questionnaire
```bash
POST /api/v1/questionnaires
{
  "titre": "Évaluation Standard Enseignement",
  "description": "Questionnaire utilisé pour toutes les évaluations",
  "questions": [
    {
      "texte": "Qualité de l'enseignement (1-5)",
      "type": "ECHELLE",
      "ordre": 1,
      "obligatoire": true
    },
    {
      "texte": "Clarté des explications (1-5)",
      "type": "ECHELLE",
      "ordre": 2,
      "obligatoire": true
    },
    {
      "texte": "Disponibilité de l'enseignant (1-5)",
      "type": "ECHELLE",
      "ordre": 3,
      "obligatoire": true
    },
    {
      "texte": "Commentaires libres",
      "type": "TEXTE_LIBRE",
      "ordre": 4,
      "obligatoire": false
    }
  ]
}
```

### 2. List all available questionnaires
```bash
GET /api/v1/questionnaires
```

### 3. Get questionnaire for display in campagne
```bash
GET /api/v1/questionnaires/questionnaire-uuid
```
