export class ChartDataDto {
  type: 'pie' | 'bar' | 'line';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export class OverviewStatsDto {
  totalEtudiants: number;
  totalEnseignants: number;
  totalMatieres: number;
  totalCours: number;
  totalQuestionnaires: number;
  totalReponses: number;
  tauxParticipation: number;
  moyenneGlobale: number;
}

export class DepartmentStatsDto {
  departmentId: string;
  departmentName: string;
  nombreEtudiants: number;
  nombreEnseignants: number;
  nombreFilieres: number;
  nombreMatieres: number;
  tauxParticipation: number;
  moyenneEvaluations: number;
}

export class FiliereStatsDto {
  filiereId: string;
  filiereName: string;
  departmentName: string;
  nombreEtudiants: number;
  nombreMatieres: number;
  tauxParticipation: number;
  moyenneEvaluations: number;
}

export class MatiereStatsDto {
  matiereId: string;
  matiereNom: string;
  enseignantName: string;
  filiereName: string;
  nombreEtudiants: number;
  nombreReponses: number;
  tauxParticipation: number;
  moyenneEvaluation: number;
}

export class TrendDataDto {
  period: string;
  nombreReponses: number;
  tauxParticipation: number;
  moyenneEvaluation: number;
}

export class AnalyticsOverviewDto {
  stats: OverviewStatsDto;
  charts?: {
    participationDistribution?: ChartDataDto;
    evaluationAverages?: ChartDataDto;
    trends?: ChartDataDto;
  };
}

export class AnalyticsDepartmentDto {
  department: DepartmentStatsDto;
  filieres: FiliereStatsDto[];
  charts?: {
    filiereComparison?: ChartDataDto;
    participationTrends?: ChartDataDto;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AnalyticsFiliereDto {
  filiere: FiliereStatsDto;
  matieres: MatiereStatsDto[];
  charts?: {
    matiereComparison?: ChartDataDto;
    participationTrends?: ChartDataDto;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AnalyticsTrendsDto {
  trends: TrendDataDto[];
  charts?: {
    participationTrend?: ChartDataDto;
    evaluationTrend?: ChartDataDto;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
