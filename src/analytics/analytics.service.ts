import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import {
  AnalyticsOverviewDto,
  AnalyticsDepartmentDto,
  AnalyticsFiliereDto,
  AnalyticsTrendsDto,
  ChartDataDto,
} from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getOverview(filters: AnalyticsFilterDto): Promise<AnalyticsOverviewDto> {
    const stats = await this.repository.getOverviewStats(filters);

    const result: AnalyticsOverviewDto = { stats };

    if (filters.includeCharts) {
      result.charts = await this.generateOverviewCharts(filters);
    }

    return result;
  }

  async getDepartmentAnalytics(
    departmentId: string,
    filters: AnalyticsFilterDto,
  ): Promise<AnalyticsDepartmentDto | null> {
    const department = await this.repository.getDepartmentStats(departmentId, filters);

    if (!department) {
      return null;
    }

    const { data: filieres, total } = await this.repository.getFiliereStatsByDepartment(
      departmentId,
      filters,
    );

    const result: AnalyticsDepartmentDto = {
      department,
      filieres,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    };

    if (filters.includeCharts) {
      result.charts = await this.generateDepartmentCharts(departmentId, filters);
    }

    return result;
  }

  async getFiliereAnalytics(
    filiereId: string,
    filters: AnalyticsFilterDto,
  ): Promise<AnalyticsFiliereDto | null> {
    const filiere = await this.repository.getFiliereStats(filiereId, filters);

    if (!filiere) {
      return null;
    }

    const { data: matieres, total } = await this.repository.getMatiereStatsByFiliere(
      filiereId,
      filters,
    );

    const result: AnalyticsFiliereDto = {
      filiere,
      matieres,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    };

    if (filters.includeCharts) {
      result.charts = await this.generateFiliereCharts(filiereId, filters);
    }

    return result;
  }

  async getTrends(filters: AnalyticsFilterDto): Promise<AnalyticsTrendsDto> {
    const { data: trends, total } = await this.repository.getTrends(filters);

    const result: AnalyticsTrendsDto = {
      trends,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    };

    if (filters.includeCharts) {
      result.charts = await this.generateTrendCharts(filters);
    }

    return result;
  }

  private async generateOverviewCharts(filters: AnalyticsFilterDto) {
    const stats = await this.repository.getOverviewStats(filters);

    const charts: any = {};

    if (filters.chartType === 'pie' || filters.chartType === 'all') {
      charts.participationDistribution = {
        type: 'pie',
        labels: ['Réponses', 'Attendues'],
        datasets: [
          {
            label: 'Distribution de participation',
            data: [
              stats.totalReponses,
              Math.max(0, stats.totalQuestionnaires * stats.totalEtudiants - stats.totalReponses),
            ],
            backgroundColor: ['#4CAF50', '#FFC107'],
          },
        ],
      } as ChartDataDto;
    }

    if (filters.chartType === 'bar' || filters.chartType === 'all') {
      charts.evaluationAverages = {
        type: 'bar',
        labels: ['Moyenne Globale'],
        datasets: [
          {
            label: 'Moyenne des évaluations',
            data: [stats.moyenneGlobale],
            backgroundColor: ['#2196F3'],
          },
        ],
      } as ChartDataDto;
    }

    return charts;
  }

  private async generateDepartmentCharts(departmentId: string, filters: AnalyticsFilterDto) {
    const { data: filieres } = await this.repository.getFiliereStatsByDepartment(
      departmentId,
      { ...filters, page: 1, limit: 100 },
    );

    const charts: any = {};

    if (filters.chartType === 'bar' || filters.chartType === 'all') {
      charts.filiereComparison = {
        type: 'bar',
        labels: filieres.map((f) => f.filiereName),
        datasets: [
          {
            label: 'Moyenne des évaluations par filière',
            data: filieres.map((f) => f.moyenneEvaluations),
            backgroundColor: filieres.map(() => '#2196F3'),
          },
        ],
      } as ChartDataDto;
    }

    if (filters.chartType === 'line' || filters.chartType === 'all') {
      charts.participationTrends = {
        type: 'line',
        labels: filieres.map((f) => f.filiereName),
        datasets: [
          {
            label: 'Taux de participation par filière',
            data: filieres.map((f) => f.tauxParticipation),
            borderColor: '#4CAF50',
            fill: false,
          },
        ],
      } as ChartDataDto;
    }

    return charts;
  }

  private async generateFiliereCharts(filiereId: string, filters: AnalyticsFilterDto) {
    const { data: matieres } = await this.repository.getMatiereStatsByFiliere(
      filiereId,
      { ...filters, page: 1, limit: 100 },
    );

    const charts: any = {};

    if (filters.chartType === 'bar' || filters.chartType === 'all') {
      charts.matiereComparison = {
        type: 'bar',
        labels: matieres.map((m) => m.matiereNom),
        datasets: [
          {
            label: 'Moyenne des évaluations par matière',
            data: matieres.map((m) => m.moyenneEvaluation),
            backgroundColor: matieres.map(() => '#2196F3'),
          },
        ],
      } as ChartDataDto;
    }

    if (filters.chartType === 'line' || filters.chartType === 'all') {
      charts.participationTrends = {
        type: 'line',
        labels: matieres.map((m) => m.matiereNom),
        datasets: [
          {
            label: 'Taux de participation par matière',
            data: matieres.map((m) => m.tauxParticipation),
            borderColor: '#4CAF50',
            fill: false,
          },
        ],
      } as ChartDataDto;
    }

    return charts;
  }

  private async generateTrendCharts(filters: AnalyticsFilterDto) {
    const { data: trends } = await this.repository.getTrends({
      ...filters,
      page: 1,
      limit: 12,
    });

    const charts: any = {};

    if (filters.chartType === 'line' || filters.chartType === 'all') {
      charts.participationTrend = {
        type: 'line',
        labels: trends.map((t) => t.period),
        datasets: [
          {
            label: 'Taux de participation',
            data: trends.map((t) => t.tauxParticipation),
            borderColor: '#4CAF50',
            fill: false,
          },
        ],
      } as ChartDataDto;

      charts.evaluationTrend = {
        type: 'line',
        labels: trends.map((t) => t.period),
        datasets: [
          {
            label: 'Moyenne des évaluations',
            data: trends.map((t) => t.moyenneEvaluation),
            borderColor: '#2196F3',
            fill: false,
          },
        ],
      } as ChartDataDto;
    }

    return charts;
  }
}
