# Reponses Module API Documentation

Base URL: `/api/v1/reponses`

## Overview

**CRITICAL**: This module handles anonymous student evaluations. Students submit evaluations WITHOUT authentication to ensure complete anonymity.

## Endpoints

### 1. Submit Anonymous Evaluation (PUBLIC)

**POST** `/api/v1/reponses/submit`

**ANONYMOUS ENDPOINT** - Students submit evaluations without authentication.

**Authentication**: NOT REQUIRED (Public endpoint)

**Request Body**:
```json
{
  "campagneId": "uuid (required)",
  "matiereId": "uuid (required)",
  "enseignantId": "uuid (required)",
  "reponses": [
    {
      "questionId": "uuid (required)",
      "valeur": "number (1-5, for ECHELLE questions)",
      "commentaire": "string (for TEXTE_LIBRE questions)"
    }
  ]
}
```

**Success Response** (201 Created):
```json
{
  "message": "Évaluation soumise avec succès",
  "evaluationId": "uuid"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (missing required fields, invalid values)
- `404 Not Found`: Campagne, matiere, enseignant, or question not found
- `403 Forbidden`: Campagne not active (not EN_COURS status)

**Example**:
```bash
# NO AUTHENTICATION HEADER - This is anonymous!
curl -X POST http://localhost:3000/api/v1/reponses/submit \
  -H "Content-Type: application/json" \
  -d '{
    "campagneId": "campagne-uuid",
    "matiereId": "matiere-uuid",
    "enseignantId": "enseignant-uuid",
    "reponses": [
      {
        "questionId": "question-1-uuid",
        "valeur": 5
      },
      {
        "questionId": "question-2-uuid",
        "valeur": 4
      },
      {
        "questionId": "question-3-uuid",
        "commentaire": "Excellent cours, très clair et bien structuré"
      }
    ]
  }'
```

---

### 2. Get All Responses (ADMIN ONLY)

**GET** `/api/v1/reponses`

Retrieves all evaluation responses with filters and pagination.

**Authentication**: Required
**Authorization**: ADMIN only

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `campagneId` (optional): Filter by campagne UUID
- `matiereId` (optional): Filter by matiere UUID
- `enseignantId` (optional): Filter by enseignant UUID
- `filiereId` (optional): Filter by filiere UUID

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "campagneId": "uuid",
      "matiereId": "uuid",
      "enseignantId": "uuid",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "campagne": {
        "id": "uuid",
        "titre": "Évaluation Semestre 1"
      },
      "matiere": {
        "id": "uuid",
        "nom": "Programmation Orientée Objet",
        "code": "INF201"
      },
      "enseignant": {
        "id": "uuid",
        "name": "Dr. Dupont"
      },
      "reponses": [
        {
          "id": "uuid",
          "questionId": "uuid",
          "valeur": 5,
          "commentaire": null,
          "question": {
            "id": "uuid",
            "texte": "Qualité de l'enseignement",
            "type": "ECHELLE"
          }
        },
        {
          "id": "uuid",
          "questionId": "uuid",
          "valeur": null,
          "commentaire": "Très bon cours",
          "question": {
            "id": "uuid",
            "texte": "Commentaires",
            "type": "TEXTE_LIBRE"
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

**Examples**:
```bash
# Get all responses
GET /api/v1/reponses

# Filter by campagne
GET /api/v1/reponses?campagneId=campagne-uuid

# Filter by enseignant
GET /api/v1/reponses?enseignantId=enseignant-uuid

# Paginate
GET /api/v1/reponses?page=2&limit=20
```

---

### 3. Get Statistics by Matiere

**GET** `/api/v1/reponses/statistiques/matiere/:matiereId`

Retrieves aggregated statistics for a matiere.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT (ENSEIGNANT must teach the matiere)

**URL Parameters**:
- `matiereId`: Matiere UUID

**Success Response** (200 OK):
```json
{
  "matiereId": "uuid",
  "matiere": {
    "nom": "Programmation Orientée Objet",
    "code": "INF201"
  },
  "totalEvaluations": 45,
  "statistiquesParQuestion": [
    {
      "questionId": "uuid",
      "question": {
        "texte": "Qualité de l'enseignement",
        "type": "ECHELLE"
      },
      "moyenne": 4.2,
      "min": 2,
      "max": 5,
      "count": 45,
      "distribution": {
        "1": 0,
        "2": 2,
        "3": 8,
        "4": 15,
        "5": 20
      }
    },
    {
      "questionId": "uuid",
      "question": {
        "texte": "Clarté des explications",
        "type": "ECHELLE"
      },
      "moyenne": 4.5,
      "min": 3,
      "max": 5,
      "count": 45,
      "distribution": {
        "1": 0,
        "2": 0,
        "3": 5,
        "4": 10,
        "5": 30
      }
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: ENSEIGNANT trying to access matiere they don't teach
- `404 Not Found`: Matiere not found

---

### 4. Get Statistics by Enseignant

**GET** `/api/v1/reponses/statistiques/enseignant/:enseignantId`

Retrieves aggregated statistics for an enseignant across all their matieres.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT (ENSEIGNANT can only view their own stats)

**URL Parameters**:
- `enseignantId`: Enseignant UUID

**Success Response** (200 OK):
```json
{
  "enseignantId": "uuid",
  "enseignant": {
    "name": "Dr. Dupont",
    "email": "dupont@example.com"
  },
  "totalEvaluations": 120,
  "moyenneGenerale": 4.3,
  "statistiquesParMatiere": [
    {
      "matiereId": "uuid",
      "matiere": {
        "nom": "Programmation Orientée Objet",
        "code": "INF201"
      },
      "totalEvaluations": 45,
      "moyenneMatiere": 4.2
    },
    {
      "matiereId": "uuid",
      "matiere": {
        "nom": "Bases de Données",
        "code": "INF301"
      },
      "totalEvaluations": 75,
      "moyenneMatiere": 4.4
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: ENSEIGNANT trying to access another enseignant's stats
- `404 Not Found`: Enseignant not found

---

### 5. Get Comments by Matiere

**GET** `/api/v1/reponses/commentaires/matiere/:matiereId`

Retrieves all text comments for a matiere.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**URL Parameters**:
- `matiereId`: Matiere UUID

**Success Response** (200 OK):
```json
{
  "matiereId": "uuid",
  "matiere": {
    "nom": "Programmation Orientée Objet",
    "code": "INF201"
  },
  "commentaires": [
    {
      "questionId": "uuid",
      "question": {
        "texte": "Commentaires additionnels",
        "type": "TEXTE_LIBRE"
      },
      "commentaire": "Excellent cours, très bien expliqué",
      "createdAt": "2024-01-20T10:30:00.000Z"
    },
    {
      "questionId": "uuid",
      "question": {
        "texte": "Suggestions d'amélioration",
        "type": "TEXTE_LIBRE"
      },
      "commentaire": "Plus d'exercices pratiques seraient appréciés",
      "createdAt": "2024-01-20T11:15:00.000Z"
    }
  ]
}
```

---

### 6. Get Comments by Enseignant

**GET** `/api/v1/reponses/commentaires/enseignant/:enseignantId`

Retrieves all text comments for an enseignant across all their matieres.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT (own comments only)

**URL Parameters**:
- `enseignantId`: Enseignant UUID

**Success Response** (200 OK):
```json
{
  "enseignantId": "uuid",
  "enseignant": {
    "name": "Dr. Dupont",
    "email": "dupont@example.com"
  },
  "commentaires": [
    {
      "matiereId": "uuid",
      "matiere": {
        "nom": "Programmation Orientée Objet",
        "code": "INF201"
      },
      "questionId": "uuid",
      "question": {
        "texte": "Commentaires",
        "type": "TEXTE_LIBRE"
      },
      "commentaire": "Très bon enseignant, disponible et à l'écoute",
      "createdAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `403 Forbidden`: ENSEIGNANT trying to access another's comments

---

## Data Models

### Evaluation Entity
```typescript
{
  id: string;              // UUID
  campagneId: string;      // FK to Campagne
  matiereId: string;       // FK to Matiere
  enseignantId: string;    // FK to User (ENSEIGNANT)
  createdAt: Date;
  campagne?: Campagne;
  matiere?: Matiere;
  enseignant?: User;
  reponses?: ReponseItem[];
}
```

### ReponseItem Entity
```typescript
{
  id: string;              // UUID
  evaluationId: string;    // FK to Evaluation
  questionId: string;      // FK to Question
  valeur?: number;         // 1-5 for ECHELLE questions
  commentaire?: string;    // Text for TEXTE_LIBRE questions
  createdAt: Date;
  question?: Question;
}
```

### SubmitEvaluationDto
```typescript
{
  campagneId: string;      // Required
  matiereId: string;       // Required
  enseignantId: string;    // Required
  reponses: ReponseItemDto[];  // Required, at least 1 response
}
```

### ReponseItemDto
```typescript
{
  questionId: string;      // Required
  valeur?: number;         // Optional, 1-5 for ECHELLE
  commentaire?: string;    // Optional, for TEXTE_LIBRE
}
```

---

## Business Rules

### 1. Anonymity (CRITICAL)
- **NO user authentication** required for submission
- **NO user ID** stored with evaluations
- **NO IP tracking** or identification
- Students submit completely anonymously
- Ensures honest, unbiased feedback

### 2. Validation Rules
- Campagne must be EN_COURS status
- ECHELLE questions: valeur must be 1-5
- TEXTE_LIBRE questions: commentaire required if question is obligatoire
- All obligatoire questions must be answered

### 3. Access Control
- **Submit**: Public (anonymous)
- **View all responses**: ADMIN only
- **View statistics**: ADMIN or teaching ENSEIGNANT
- **View comments**: ADMIN or teaching ENSEIGNANT
- ENSEIGNANT can only view their own data

### 4. Statistical Aggregation
- Real-time calculation of averages
- Distribution charts for scale questions
- Min/max values for analysis
- Comment compilation for qualitative feedback

---

## Events Emitted

- `evaluation.submitted`: When a student submits an evaluation
- `evaluation.statistics.updated`: When statistics are recalculated

---

## Related Modules

- **Campagnes**: Evaluations submitted during campagnes
- **Questionnaires**: Questions being evaluated
- **Matieres**: Courses being evaluated
- **Users**: Enseignants being evaluated
- **Analytics**: Uses evaluation data for dashboards
- **Exports**: Exports evaluation data

---

## Security & Privacy

### Anonymity Guarantees
1. No authentication token required
2. No user ID stored in database
3. No IP address logging
4. No session tracking
5. No cookies set

### Data Access Restrictions
- Students cannot view any evaluation data
- Enseignants can only view aggregate statistics, not individual responses
- Only ADMIN can view individual responses
- Comments shown without any identifying information

---

## Use Cases

### 1. Student submits anonymous evaluation
```bash
# NO Authorization header!
POST /api/v1/reponses/submit
{
  "campagneId": "campagne-uuid",
  "matiereId": "matiere-uuid",
  "enseignantId": "enseignant-uuid",
  "reponses": [
    {
      "questionId": "q1-uuid",
      "valeur": 5
    },
    {
      "questionId": "q2-uuid",
      "valeur": 4
    },
    {
      "questionId": "q3-uuid",
      "commentaire": "Excellent cours!"
    }
  ]
}
```

### 2. Enseignant views their own statistics
```bash
GET /api/v1/reponses/statistiques/enseignant/their-own-uuid
Authorization: Bearer <enseignant-token>
```

### 3. Admin views all evaluations for a matiere
```bash
GET /api/v1/reponses?matiereId=matiere-uuid
Authorization: Bearer <admin-token>
```

### 4. View comments for quality improvement
```bash
GET /api/v1/reponses/commentaires/matiere/matiere-uuid
Authorization: Bearer <token>
```
