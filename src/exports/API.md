# Exports Module API Documentation

Base URL: `/api/v1/exports`

## Overview

Data export module for generating Excel, CSV, and PDF reports from evaluation data and analytics.

## Endpoints

### 1. Export Evaluation Responses

**POST** `/api/v1/exports/reponses`

Exports evaluation responses to Excel, CSV, or PDF format.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT (filtered to their matieres)

**Query Parameters**:
- `format`: Export format (excel, csv, pdf) - required
- `campagneId` (optional): Filter by campagne
- `matiereId` (optional): Filter by matiere
- `enseignantId` (optional): Filter by enseignant (auto-applied for ENSEIGNANT role)
- `filiereId` (optional): Filter by filiere
- `dateDebut` (optional): Filter from this date
- `dateFin` (optional): Filter until this date

**Success Response** (200 OK):
```json
{
  "success": true,
  "filename": "export_reponses_20240115_143022.xlsx",
  "downloadUrl": "/api/v1/exports/download/export_reponses_20240115_143022.xlsx",
  "fileSize": 45678,
  "recordCount": 120,
  "expiresAt": "2024-01-16T14:30:22.000Z"
}
```

**Export Contents** (Excel/CSV):
- Evaluation ID
- Campagne title
- Matiere name and code
- Enseignant name
- Submission date
- Question text
- Response value (1-5) or comment
- Question type

**Export Contents** (PDF):
- Summary statistics
- Detailed responses by matiere
- Charts and graphs
- Professional formatting

**Examples**:
```bash
# Export all responses to Excel
POST /api/v1/exports/reponses?format=excel

# Export filtered responses to CSV
POST /api/v1/exports/reponses?format=csv&matiereId=matiere-uuid&dateDebut=2024-01-01

# Export to PDF
POST /api/v1/exports/reponses?format=pdf&campagneId=campagne-uuid
```

---

### 2. Export Statistics

**POST** `/api/v1/exports/statistiques`

Exports aggregated statistics and analytics.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**Query Parameters**:
- `format`: Export format (excel, csv, pdf) - required
- `matiereId` (optional): Filter by matiere
- `enseignantId` (optional): Filter by enseignant
- `filiereId` (optional): Filter by filiere
- `departmentId` (optional): Filter by department
- `dateDebut` (optional): Filter from this date
- `dateFin` (optional): Filter until this date

**Success Response** (200 OK):
```json
{
  "success": true,
  "filename": "export_statistiques_20240115_143022.xlsx",
  "downloadUrl": "/api/v1/exports/download/export_statistiques_20240115_143022.xlsx",
  "fileSize": 34567,
  "expiresAt": "2024-01-16T14:30:22.000Z"
}
```

**Export Contents**:
- Summary statistics by matiere
- Average scores per question
- Grade distribution
- Participation rates
- Top/bottom performing courses
- Trend analysis
- Charts (Excel/PDF only)

**Examples**:
```bash
# Export department statistics
POST /api/v1/exports/statistiques?format=excel&departmentId=dept-uuid

# Export enseignant performance report
POST /api/v1/exports/statistiques?format=pdf&enseignantId=enseignant-uuid
```

---

### 3. Download Export File

**GET** `/api/v1/exports/download/:filename`

Downloads a previously generated export file.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**URL Parameters**:
- `filename`: The filename returned from export endpoint

**Query Parameters**:
- `filename`: Alternative way to pass filename (deprecated)

**Success Response** (200 OK):
- Returns file stream with appropriate headers
- Content-Type based on file format
- Content-Disposition: attachment

**Response Headers**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="export_reponses_20240115_143022.xlsx"
Content-Length: 45678
```

**Error Responses**:
- `404 Not Found`: File not found or expired
- `403 Forbidden`: Not authorized to download this file

**Example**:
```bash
curl -X GET http://localhost:3000/api/v1/exports/download/export_reponses_20240115_143022.xlsx \
  -H "Authorization: Bearer <token>" \
  --output report.xlsx
```

---

### 4. Get Chart Data

**GET** `/api/v1/exports/charts`

Retrieves chart-ready data for frontend visualizations.

**Authentication**: Required
**Authorization**: ADMIN, ENSEIGNANT, or ETUDIANT

**Query Parameters**:
- `campagneId` (optional): Filter by campagne
- `matiereId` (optional): Filter by matiere
- `enseignantId` (optional): Filter by enseignant
- `filiereId` (optional): Filter by filiere (auto-applied for ETUDIANT)
- `dateDebut` (optional): Filter from this date
- `dateFin` (optional): Filter until this date

**Access Rules**:
- **ADMIN**: All data
- **ENSEIGNANT**: Only their matieres
- **ETUDIANT**: Only their filiere's aggregated data

**Success Response** (200 OK):
```json
{
  "charts": {
    "averageByMatiere": {
      "type": "bar",
      "labels": ["POO", "Bases de Données", "Réseaux"],
      "data": [4.8, 4.3, 4.1],
      "title": "Moyenne par Matière"
    },
    "distributionNotes": {
      "type": "pie",
      "labels": ["1", "2", "3", "4", "5"],
      "data": [5, 12, 35, 68, 60],
      "title": "Distribution des Notes"
    },
    "evolutionTemporelle": {
      "type": "line",
      "labels": ["Jan 2024", "Fév 2024", "Mar 2024"],
      "datasets": [
        {
          "label": "Moyenne",
          "data": [4.1, 4.3, 4.2]
        },
        {
          "label": "Participation (%)",
          "data": [75, 78, 76]
        }
      ],
      "title": "Évolution dans le temps"
    },
    "topEnseignants": {
      "type": "horizontalBar",
      "labels": ["Dr. Dupont", "Prof. Martin", "Dr. Leroy"],
      "data": [4.8, 4.6, 4.5],
      "title": "Top Enseignants"
    },
    "participationRate": {
      "type": "gauge",
      "value": 78.5,
      "min": 0,
      "max": 100,
      "title": "Taux de Participation"
    }
  }
}
```

**Example**:
```bash
# Get charts for a specific campagne
GET /api/v1/exports/charts?campagneId=campagne-uuid

# Get charts for a filiere (student view)
GET /api/v1/exports/charts?filiereId=filiere-uuid
```

---

### 5. Clean Old Export Files

**POST** `/api/v1/exports/clean`

Removes old export files from storage (files older than 24 hours).

**Authentication**: Required
**Authorization**: ADMIN only

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Fichiers anciens supprimés",
  "filesDeleted": 15,
  "spaceFreed": 4567890
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/exports/clean \
  -H "Authorization: Bearer <admin-token>"
```

---

## Data Models

### ExportFilterDto
```typescript
{
  format: 'excel' | 'csv' | 'pdf';  // Required for export endpoints
  campagneId?: string;
  matiereId?: string;
  enseignantId?: string;
  filiereId?: string;
  departmentId?: string;
  dateDebut?: Date;
  dateFin?: Date;
}
```

### ExportResult
```typescript
{
  success: boolean;
  filename: string;
  downloadUrl: string;
  fileSize: number;
  recordCount?: number;
  expiresAt: Date;
}
```

### ChartData
```typescript
{
  type: 'bar' | 'pie' | 'line' | 'horizontalBar' | 'gauge';
  labels: string[];
  data: number[] | Dataset[];
  title: string;
  options?: ChartOptions;
}
```

---

## Supported Export Formats

### 1. Excel (.xlsx)
- **Features**:
  - Multiple sheets (summary, details, charts)
  - Formatted headers and cells
  - Embedded charts and graphs
  - Color-coded data
  - Auto-sized columns

- **Use Cases**:
  - Detailed analysis in Excel
  - Further data manipulation
  - Professional reports

### 2. CSV (.csv)
- **Features**:
  - Simple comma-separated values
  - One sheet only
  - No formatting
  - Universal compatibility

- **Use Cases**:
  - Import into other systems
  - Database import
  - Simple data extraction

### 3. PDF (.pdf)
- **Features**:
  - Professional layout
  - Embedded charts
  - Summary statistics
  - Read-only format
  - Print-ready

- **Use Cases**:
  - Official reports
  - Sharing with stakeholders
  - Archiving
  - Presentations

---

## File Storage and Cleanup

### Storage Location
- Files stored in `exports/` directory
- Organized by date: `exports/YYYY-MM-DD/`
- Unique filenames with timestamp

### Automatic Cleanup
- Files expire after 24 hours
- Automatic cleanup runs daily
- Manual cleanup via `/exports/clean` endpoint

### File Naming Convention
```
export_{type}_{YYYYMMDD}_{HHMMSS}.{ext}

Examples:
- export_reponses_20240115_143022.xlsx
- export_statistiques_20240115_150530.pdf
- export_charts_20240115_162145.csv
```

---

## Business Rules

### 1. Access Control
- **ADMIN**: Can export all data
- **ENSEIGNANT**: Can export data for their matieres only
- **ETUDIANT**: Can view charts for their filiere only

### 2. Data Filtering
- ENSEIGNANT role: Auto-filter by enseignantId
- ETUDIANT role: Auto-filter by filiereId
- All date filters inclusive

### 3. File Limits
- Maximum file size: 100MB
- Maximum records per export: 10,000
- Pagination for large datasets

### 4. Privacy
- Individual student identities never exported
- Aggregated data only in student-accessible charts
- Comments anonymized

---

## Chart Types Explained

### Bar Chart
- Compare categories
- Example: Average by matiere

### Pie Chart
- Show proportions
- Example: Grade distribution

### Line Chart
- Show trends over time
- Example: Monthly averages

### Horizontal Bar Chart
- Rank items
- Example: Top enseignants

### Gauge Chart
- Show single metric with range
- Example: Participation rate

---

## Events Emitted

- `export.generated`: When export file is created
- `export.downloaded`: When file is downloaded
- `export.expired`: When file is deleted (cleanup)

---

## Related Modules

- **Reponses**: Source data for exports
- **Analytics**: Statistics for export
- **Campagnes**: Campaign-based filtering
- **Matieres**: Subject-based filtering

---

## Use Cases

### 1. Admin exports all evaluation data
```bash
POST /api/v1/exports/reponses?format=excel
```

### 2. Enseignant exports their performance report
```bash
POST /api/v1/exports/statistiques?format=pdf&enseignantId=their-uuid
```

### 3. Department head exports department statistics
```bash
POST /api/v1/exports/statistiques?format=excel&departmentId=dept-uuid
```

### 4. Frontend displays charts
```bash
GET /api/v1/exports/charts?filiereId=filiere-uuid
```

### 5. Download generated report
```bash
GET /api/v1/exports/download/export_reponses_20240115_143022.xlsx
```

---

## Performance Optimization

1. **Async Generation**: Large exports processed in background
2. **Caching**: Chart data cached for 5 minutes
3. **Streaming**: Large files streamed to prevent memory issues
4. **Compression**: Excel files use compression
5. **Cleanup**: Automatic removal of old files

---

## Error Handling

### Common Errors

**No Data Available**:
```json
{
  "statusCode": 404,
  "message": "Aucune donnée disponible pour les filtres spécifiés"
}
```

**File Generation Failed**:
```json
{
  "statusCode": 500,
  "message": "Erreur lors de la génération du fichier"
}
```

**File Expired**:
```json
{
  "statusCode": 404,
  "message": "Le fichier a expiré ou n'existe pas"
}
```
