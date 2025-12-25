# Analytics Module API Documentation

Base URL: `/api/v1/analytics`

## Overview

Analytics and dashboard module providing aggregated statistics, charts, and insights from evaluation data.

## Endpoints

### 1. Get Overview Analytics

**GET** `/api/v1/analytics/overview`

Retrieves high-level overview statistics across the platform.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**Query Parameters** (all optional):
- `campagneId`: Filter by specific campagne UUID
- `dateDebut`: Filter evaluations from this date (ISO 8601)
- `dateFin`: Filter evaluations until this date (ISO 8601)

**Success Response** (200 OK):
```json
{
  "totalEvaluations": 1250,
  "totalMatieres": 45,
  "totalEnseignants": 32,
  "totalEtudiants": 850,
  "moyenneGenerale": 4.2,
  "tauxParticipation": 78.5,
  "evaluationsParStatut": {
    "PLANIFIEE": 5,
    "EN_COURS": 8,
    "TERMINEE": 32
  },
  "topMatieres": [
    {
      "matiereId": "uuid",
      "nom": "Programmation Orientée Objet",
      "code": "INF201",
      "moyenne": 4.8,
      "totalEvaluations": 95
    },
    {
      "matiereId": "uuid",
      "nom": "Bases de Données",
      "code": "INF301",
      "moyenne": 4.6,
      "totalEvaluations": 87
    }
  ],
  "topEnseignants": [
    {
      "enseignantId": "uuid",
      "name": "Dr. Dupont",
      "moyenne": 4.7,
      "totalEvaluations": 120
    },
    {
      "enseignantId": "uuid",
      "name": "Prof. Martin",
      "moyenne": 4.5,
      "totalEvaluations": 98
    }
  ]
}
```

**Examples**:
```bash
# Get overall platform analytics
GET /api/v1/analytics/overview

# Filter by date range
GET /api/v1/analytics/overview?dateDebut=2024-01-01&dateFin=2024-06-30

# Filter by specific campagne
GET /api/v1/analytics/overview?campagneId=campagne-uuid
```

---

### 2. Get Department Analytics

**GET** `/api/v1/analytics/department/:id`

Retrieves analytics for a specific department.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**URL Parameters**:
- `id`: Department UUID

**Query Parameters** (all optional):
- `dateDebut`: Filter from this date
- `dateFin`: Filter until this date

**Success Response** (200 OK):
```json
{
  "departmentId": "uuid",
  "department": {
    "id": "uuid",
    "name": "Informatique",
    "description": "Département d'Informatique"
  },
  "totalEvaluations": 450,
  "totalFilieres": 5,
  "totalMatieres": 25,
  "totalEnseignants": 12,
  "moyenneDepartement": 4.3,
  "statistiquesParFiliere": [
    {
      "filiereId": "uuid",
      "name": "Génie Logiciel",
      "totalEvaluations": 180,
      "moyenne": 4.4,
      "totalMatieres": 12
    },
    {
      "filiereId": "uuid",
      "name": "Réseaux et Télécommunications",
      "totalEvaluations": 150,
      "moyenne": 4.2,
      "totalMatieres": 10
    }
  ],
  "evolutionTemporelle": [
    {
      "periode": "2024-01",
      "moyenne": 4.1,
      "totalEvaluations": 85
    },
    {
      "periode": "2024-02",
      "moyenne": 4.3,
      "totalEvaluations": 92
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Department not found

**Example**:
```bash
GET /api/v1/analytics/department/dept-uuid?dateDebut=2024-01-01
```

---

### 3. Get Filiere Analytics

**GET** `/api/v1/analytics/filiere/:id`

Retrieves analytics for a specific filiere.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**URL Parameters**:
- `id`: Filiere UUID

**Query Parameters** (all optional):
- `dateDebut`: Filter from this date
- `dateFin`: Filter until this date

**Success Response** (200 OK):
```json
{
  "filiereId": "uuid",
  "filiere": {
    "id": "uuid",
    "name": "Génie Logiciel",
    "department": {
      "id": "uuid",
      "name": "Informatique"
    }
  },
  "totalEvaluations": 180,
  "totalMatieres": 12,
  "totalEtudiants": 85,
  "moyenneFiliere": 4.4,
  "tauxParticipation": 82.3,
  "statistiquesParMatiere": [
    {
      "matiereId": "uuid",
      "nom": "Programmation Orientée Objet",
      "code": "INF201",
      "moyenne": 4.8,
      "totalEvaluations": 78,
      "enseignants": [
        {
          "id": "uuid",
          "name": "Dr. Dupont",
          "moyenne": 4.8
        }
      ]
    },
    {
      "matiereId": "uuid",
      "nom": "Structures de Données",
      "code": "INF202",
      "moyenne": 4.2,
      "totalEvaluations": 75,
      "enseignants": [
        {
          "id": "uuid",
          "name": "Prof. Martin",
          "moyenne": 4.2
        }
      ]
    }
  ],
  "distributionNotes": {
    "1": 5,
    "2": 12,
    "3": 35,
    "4": 68,
    "5": 60
  }
}
```

**Error Responses**:
- `404 Not Found`: Filiere not found

**Example**:
```bash
GET /api/v1/analytics/filiere/filiere-uuid
```

---

### 4. Get Trends

**GET** `/api/v1/analytics/trends`

Retrieves trend data over time for visualizations.

**Authentication**: Required
**Authorization**: ADMIN or ENSEIGNANT

**Query Parameters** (all optional):
- `matiereId`: Filter by matiere
- `filiereId`: Filter by filiere
- `departmentId`: Filter by department
- `dateDebut`: Start date
- `dateFin`: End date
- `granularity`: Time granularity (month, week, day) - default: month

**Success Response** (200 OK):
```json
{
  "trends": [
    {
      "periode": "2024-01",
      "moyenne": 4.1,
      "totalEvaluations": 145,
      "tauxParticipation": 75.2
    },
    {
      "periode": "2024-02",
      "moyenne": 4.3,
      "totalEvaluations": 168,
      "tauxParticipation": 78.5
    },
    {
      "periode": "2024-03",
      "moyenne": 4.2,
      "totalEvaluations": 152,
      "tauxParticipation": 76.8
    }
  ],
  "globalTrend": "increasing",
  "percentageChange": 2.4
}
```

**Examples**:
```bash
# Get monthly trends for entire platform
GET /api/v1/analytics/trends?granularity=month

# Get trends for specific matiere
GET /api/v1/analytics/trends?matiereId=matiere-uuid

# Get trends for specific period
GET /api/v1/analytics/trends?dateDebut=2024-01-01&dateFin=2024-06-30
```

---

## Data Models

### AnalyticsFilterDto
```typescript
{
  campagneId?: string;     // Filter by campagne
  matiereId?: string;      // Filter by matiere
  filiereId?: string;      // Filter by filiere
  departmentId?: string;   // Filter by department
  dateDebut?: Date;        // Start date
  dateFin?: Date;          // End date
  granularity?: 'month' | 'week' | 'day';  // For trends
}
```

### OverviewAnalytics
```typescript
{
  totalEvaluations: number;
  totalMatieres: number;
  totalEnseignants: number;
  totalEtudiants: number;
  moyenneGenerale: number;
  tauxParticipation: number;
  evaluationsParStatut: {
    PLANIFIEE: number;
    EN_COURS: number;
    TERMINEE: number;
  };
  topMatieres: MatiereStats[];
  topEnseignants: EnseignantStats[];
}
```

### DepartmentAnalytics
```typescript
{
  departmentId: string;
  department: Department;
  totalEvaluations: number;
  totalFilieres: number;
  totalMatieres: number;
  totalEnseignants: number;
  moyenneDepartement: number;
  statistiquesParFiliere: FiliereStats[];
  evolutionTemporelle: TrendPoint[];
}
```

### FiliereAnalytics
```typescript
{
  filiereId: string;
  filiere: Filiere;
  totalEvaluations: number;
  totalMatieres: number;
  totalEtudiants: number;
  moyenneFiliere: number;
  tauxParticipation: number;
  statistiquesParMatiere: MatiereStats[];
  distributionNotes: { [key: string]: number };
}
```

### TrendPoint
```typescript
{
  periode: string;          // "2024-01", "2024-W05", "2024-01-15"
  moyenne: number;
  totalEvaluations: number;
  tauxParticipation: number;
}
```

---

## Business Rules

### 1. Access Control
- **ADMIN**: Can view all analytics
- **ENSEIGNANT**: Can view analytics for:
  - Matieres they teach
  - Their own performance
  - Department/filiere they belong to

### 2. Data Aggregation
- Real-time calculation from evaluation responses
- Cached for performance on large datasets
- Automatically refreshed when new evaluations submitted

### 3. Privacy
- Individual student responses never shown
- Minimum threshold for showing statistics (e.g., 5+ responses)
- Aggregated data only

### 4. Statistical Calculations
- **Moyenne**: Average of all scale responses
- **Taux de participation**: (Completed evaluations / Total students) × 100
- **Distribution**: Count of each rating (1-5)
- **Trends**: Time-series aggregation by period

---

## Chart Visualizations

### Recommended Chart Types

1. **Overview Dashboard**:
   - Bar chart: Top matieres by moyenne
   - Bar chart: Top enseignants by moyenne
   - Pie chart: Evaluations by status
   - KPI cards: Total counts and averages

2. **Department Analytics**:
   - Bar chart: Filieres comparison
   - Line chart: Evolution over time
   - Gauge chart: Average score

3. **Filiere Analytics**:
   - Bar chart: Matieres comparison
   - Histogram: Grade distribution
   - Line chart: Participation rate over time

4. **Trends**:
   - Line chart: Average over time
   - Area chart: Evaluation count over time
   - Multi-line: Compare multiple entities

---

## Performance Considerations

1. **Caching**: Analytics results cached for 15 minutes
2. **Indexing**: Database indexes on foreign keys and dates
3. **Pagination**: Large result sets paginated
4. **Async calculation**: Heavy aggregations run in background

---

## Events Emitted

- `analytics.calculated`: When analytics are recalculated
- `analytics.cache.cleared`: When cache is invalidated

---

## Related Modules

- **Reponses**: Source data for all analytics
- **Campagnes**: Campaign-based filtering
- **Matieres**: Subject-based analytics
- **Departments**: Department-level aggregation
- **Filieres**: Program-level aggregation
- **Exports**: Export analytics data

---

## Use Cases

### 1. Admin views platform overview
```bash
GET /api/v1/analytics/overview
```

### 2. Department head views department performance
```bash
GET /api/v1/analytics/department/dept-uuid?dateDebut=2024-01-01
```

### 3. Program coordinator views filiere analytics
```bash
GET /api/v1/analytics/filiere/filiere-uuid
```

### 4. Track improvement trends over semester
```bash
GET /api/v1/analytics/trends?dateDebut=2024-01-01&dateFin=2024-06-30&granularity=month
```

### 5. Compare matiere performance
```bash
GET /api/v1/analytics/trends?matiereId=matiere1-uuid
GET /api/v1/analytics/trends?matiereId=matiere2-uuid
```

---

## Example Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  Overview Analytics                                  │
├─────────────────────────────────────────────────────┤
│  Total Evaluations: 1,250    Avg Score: 4.2/5      │
│  Total Matieres: 45          Participation: 78.5%   │
├─────────────────────────────────────────────────────┤
│  Top Performing Matieres          Top Enseignants   │
│  [Bar Chart]                      [Bar Chart]       │
├─────────────────────────────────────────────────────┤
│  Evaluation Trends Over Time                        │
│  [Line Chart showing monthly averages]              │
├─────────────────────────────────────────────────────┤
│  Department Comparison                              │
│  [Multi-bar chart comparing departments]            │
└─────────────────────────────────────────────────────┘
```
