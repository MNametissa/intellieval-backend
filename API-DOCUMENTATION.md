# IntelliEval Backend API Documentation

Complete API documentation for the IntelliEval backend application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Modules](#modules)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

IntelliEval is an anonymous evaluation platform for academic institutions built with NestJS following a modular monolith architecture.

**Key Features**:
- Anonymous student evaluations
- Role-based access control (ADMIN, ENSEIGNANT, ETUDIANT)
- Course material management
- Real-time analytics and dashboards
- Data export (Excel, CSV, PDF)
- In-app and email notifications
- Event-driven communication between modules

---

## Architecture

### Modular Monolith Pattern
- Each feature module is completely independent
- Modules communicate ONLY via events (no direct imports)
- Each module has its own documentation in `src/[module]/API.md`

### Technology Stack
- **Framework**: NestJS 11.x
- **Language**: TypeScript (strict mode)
- **Database**: MySQL + TypeORM
- **Authentication**: JWT (@nestjs/jwt + @nestjs/passport)
- **Events**: @nestjs/event-emitter
- **Validation**: class-validator

---

## Authentication

### JWT Authentication
All endpoints (except public ones) require JWT authentication.

**Login**:
```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN"
  }
}
```

**Using the token**:
```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/api/v1/users
```

### User Roles

1. **ADMIN**: Full system access, user management, all CRUD operations
2. **ENSEIGNANT**: Upload cours, view their evaluation statistics
3. **ETUDIANT**: Submit anonymous evaluations, download cours for their filiere

---

## Base URL

**Development**: `http://localhost:3000/api/v1`
**Production**: `https://your-domain.com/api/v1`

---

## Modules

### Core Modules

#### 1. [Auth Module](src/auth/API.md)
Authentication and authorization.

**Endpoints**:
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile

---

#### 2. [Users Module](src/users/API.md)
User management with bulk import functionality.

**Endpoints**:
- `POST /users` - Create user
- `GET /users` - List users (with filters)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/import/template` - Download import template
- `POST /users/import/preview` - Preview import
- `POST /users/import` - Import users from Excel

---

#### 3. [Departments Module](src/departments/API.md)
Academic department management.

**Endpoints**:
- `POST /departments` - Create department
- `GET /departments` - List departments (paginated, searchable)
- `GET /departments/:id` - Get department
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

---

#### 4. [Filieres Module](src/filieres/API.md)
Academic program/track management.

**Endpoints**:
- `POST /filieres` - Create filiere
- `GET /filieres` - List filieres (paginated, searchable)
- `GET /filieres/:id` - Get filiere
- `PATCH /filieres/:id` - Update filiere
- `DELETE /filieres/:id` - Delete filiere

---

#### 5. [Matieres Module](src/matieres/API.md)
Course/subject management with enseignant assignment.

**Endpoints**:
- `POST /matieres` - Create matiere
- `GET /matieres` - List matieres (paginated, searchable)
- `GET /matieres/:id` - Get matiere
- `PATCH /matieres/:id` - Update matiere
- `DELETE /matieres/:id` - Delete matiere
- `POST /matieres/:id/enseignants` - Assign enseignant
- `DELETE /matieres/:id/enseignants/:enseignantId` - Unassign enseignant

---

#### 6. [Questionnaires Module](src/questionnaires/API.md)
Evaluation questionnaire management.

**Endpoints**:
- `POST /questionnaires` - Create questionnaire with questions
- `GET /questionnaires` - List questionnaires
- `GET /questionnaires/:id` - Get questionnaire
- `PATCH /questionnaires/:id` - Update questionnaire
- `DELETE /questionnaires/:id` - Delete questionnaire

---

#### 7. [Campagnes Module](src/campagnes/API.md)
Evaluation campaign scheduling and management.

**Endpoints**:
- `POST /campagnes` - Create campagne
- `GET /campagnes` - List campagnes (paginated, filterable)
- `GET /campagnes/:id` - Get campagne
- `PATCH /campagnes/:id` - Update campagne
- `DELETE /campagnes/:id` - Delete campagne

---

### Evaluation Modules

#### 8. [Reponses Module](src/reponses/API.md) ⭐ CRITICAL
**Anonymous evaluation submission and statistics.**

**Key Features**:
- **Anonymous submission** (no authentication required)
- Real-time aggregation
- Statistical analysis

**Endpoints**:
- `POST /reponses/submit` - **PUBLIC** Submit anonymous evaluation
- `GET /reponses` - List responses (ADMIN only)
- `GET /reponses/statistiques/matiere/:id` - Matiere statistics
- `GET /reponses/statistiques/enseignant/:id` - Enseignant statistics
- `GET /reponses/commentaires/matiere/:id` - Matiere comments
- `GET /reponses/commentaires/enseignant/:id` - Enseignant comments

---

### Content Modules

#### 9. [Cours Module](src/cours/API.md)
Course material upload and download with access control.

**Endpoints**:
- `POST /cours/upload` - Upload course material
- `GET /cours` - List cours (filtered by access)
- `GET /cours/:id` - Get cours details
- `GET /cours/:id/download` - Download file
- `PATCH /cours/:id` - Update cours metadata
- `DELETE /cours/:id` - Delete cours

---

### Analytics & Reporting Modules

#### 10. [Analytics Module](src/analytics/API.md)
Platform analytics and dashboards.

**Endpoints**:
- `GET /analytics/overview` - Platform overview statistics
- `GET /analytics/department/:id` - Department analytics
- `GET /analytics/filiere/:id` - Filiere analytics
- `GET /analytics/trends` - Trend analysis over time

---

#### 11. [Exports Module](src/exports/API.md)
Data export to Excel, CSV, and PDF.

**Endpoints**:
- `POST /exports/reponses` - Export evaluation responses
- `POST /exports/statistiques` - Export statistics
- `GET /exports/download/:filename` - Download generated file
- `GET /exports/charts` - Get chart-ready data
- `POST /exports/clean` - Clean old export files (ADMIN)

---

### Communication Modules

#### 12. [Notifications Module](src/notifications/API.md)
In-app notifications.

**Endpoints**:
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications` - Delete all notifications

---

## Common Patterns

### Pagination

Most list endpoints support pagination:

**Query Parameters**:
```
?page=1&limit=10
```

**Response Format**:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### Filtering

**By text search**:
```
?search=keyword
```

**By relationship**:
```
?departmentId=uuid
?filiereId=uuid
?matiereId=uuid
```

**By date range**:
```
?dateDebut=2024-01-01
?dateFin=2024-12-31
```

---

### Sorting

**Query Parameters**:
```
?sortBy=createdAt&sortOrder=DESC
```

**Common sort fields**:
- `name` / `nom` / `titre`
- `createdAt`
- `updatedAt`
- `code`

**Sort orders**:
- `ASC` - Ascending
- `DESC` - Descending

---

### File Upload

**Content-Type**: `multipart/form-data`

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/cours/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "titre=Course Title" \
  -F "matiereId=uuid"
```

---

### File Download

**Response Headers**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 12345
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/v1/cours/:id/download \
  -H "Authorization: Bearer <token>" \
  --output downloaded-file.pdf
```

---

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `413 Payload Too Large` - File too large
- `422 Unprocessable Entity` - Invalid data
- `500 Internal Server Error` - Server error

### Validation Errors

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limiting

**Not currently implemented**, but recommended:

- `/auth/login`: 5 requests per minute per IP
- `/reponses/submit`: 10 requests per minute per IP
- Other endpoints: 100 requests per minute per user

---

## Data Models

### Common Field Types

- **UUID**: `"123e4567-e89b-12d3-a456-426614174000"`
- **Date**: ISO 8601 format `"2024-01-15T10:30:00.000Z"`
- **Email**: `"user@example.com"`
- **Role**: `"ADMIN" | "ENSEIGNANT" | "ETUDIANT"`

### Timestamps

All entities include:
```typescript
{
  createdAt: Date;  // Creation timestamp
  updatedAt: Date;  // Last update timestamp
}
```

---

## Security

### Authentication
- JWT tokens with 24-hour expiration
- Password hashing with bcrypt
- Token required for all protected endpoints

### Authorization
- Role-based access control (RBAC)
- Guards prevent unauthorized access
- Enseignants restricted to their own data
- Students restricted to their filiere

### Anonymous Evaluations
- No authentication for `/reponses/submit`
- No user ID stored
- Complete anonymity guaranteed

### File Upload Security
- MIME type validation
- File size limits
- Path traversal prevention
- Virus scanning (recommended, not implemented)

---

## Events System

Modules communicate via events:

### Event Naming Convention
`[domain].[action]` (lowercase, dot-separated)

**Examples**:
- `user.created`
- `campagne.started`
- `cours.uploaded`
- `evaluation.submitted`

### Common Events

- `user.created` → Send welcome email
- `campagne.started` → Notify students
- `campagne.ended` → Notify enseignants
- `cours.uploaded` → Notify students
- `evaluation.submitted` → Update statistics

---

## Testing the API

### Using cURL

**Login**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intellieval.com","password":"password123"}'
```

**List users**:
```bash
TOKEN="your-jwt-token"
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import collection from `postman/` directory (if available)
2. Set environment variable `{{baseUrl}}` = `http://localhost:3000/api/v1`
3. Set `{{token}}` after login

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new request
3. Set Authorization → Bearer Token
4. Use `{{token}}` variable

---

## Environment Variables

Required environment variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=intellieval

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3001

# File Upload
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR=./uploads

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@intellieval.com
SMTP_PASS=password
SMTP_FROM=IntelliEval <noreply@intellieval.com>
```

---

## Development

### Running the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/[module]/database/migrations/[Name]

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Module Documentation Links

- [Auth](src/auth/API.md) - Authentication
- [Users](src/users/API.md) - User management
- [Departments](src/departments/API.md) - Departments
- [Filieres](src/filieres/API.md) - Academic programs
- [Matieres](src/matieres/API.md) - Courses
- [Questionnaires](src/questionnaires/API.md) - Evaluation forms
- [Campagnes](src/campagnes/API.md) - Evaluation campaigns
- [Reponses](src/reponses/API.md) - Anonymous evaluations ⭐
- [Cours](src/cours/API.md) - Course materials
- [Analytics](src/analytics/API.md) - Dashboards
- [Exports](src/exports/API.md) - Data export
- [Notifications](src/notifications/API.md) - User notifications

---

## Support

For issues, bugs, or questions:
- Check module-specific documentation in `src/[module]/API.md`
- Review architectural rules in `rules.md`
- See application details in `app-details.md`
- Check NestJS documentation at https://docs.nestjs.com

---

## Version

**API Version**: 1.0.0
**Last Updated**: 2024-01-15
**NestJS Version**: 11.x
**Node Version**: 18.x or higher

---

## License

Proprietary - IntelliEval Platform
