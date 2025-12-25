import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repository: jest.Mocked<AnalyticsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: AnalyticsRepository,
          useValue: {
            getOverviewStats: jest.fn(),
            getDepartmentStats: jest.fn(),
            getFiliereStatsByDepartment: jest.fn(),
            getFiliereStats: jest.fn(),
            getMatiereStatsByFiliere: jest.fn(),
            getTrends: jest.fn(),
            generateParticipationChart: jest.fn(),
            generateAverageRatingsChart: jest.fn(),
            generateDepartmentComparisonChart: jest.fn(),
            generateFiliereComparisonChart: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    repository = module.get(AnalyticsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return overview statistics without charts', async () => {
      const mockStats = {
        totalCampagnes: 10,
        activeCampagnes: 5,
        totalReponses: 100,
        averageRating: 4.2,
        participationRate: 0.75,
      };

      repository.getOverviewStats.mockResolvedValue(mockStats);

      const result = await service.getOverview({ includeCharts: false });

      expect(result).toEqual({ stats: mockStats });
      expect(repository.getOverviewStats).toHaveBeenCalledWith({ includeCharts: false });
    });

    it('should return overview statistics with charts', async () => {
      const mockStats = {
        totalCampagnes: 10,
        activeCampagnes: 5,
        totalReponses: 100,
        averageRating: 4.2,
        participationRate: 0.75,
      };

      const mockCharts = {
        participation: { labels: ['Jan', 'Feb'], data: [10, 20] },
        ratings: { labels: ['Dept1', 'Dept2'], data: [4.5, 4.2] },
      };

      repository.getOverviewStats.mockResolvedValue(mockStats);
      repository.generateParticipationChart = jest.fn().mockResolvedValue(mockCharts.participation);
      repository.generateAverageRatingsChart = jest.fn().mockResolvedValue(mockCharts.ratings);

      const result = await service.getOverview({ includeCharts: true });

      expect(result.stats).toEqual(mockStats);
      expect(result.charts).toBeDefined();
    });
  });

  describe('getDepartmentAnalytics', () => {
    it('should return department analytics', async () => {
      const mockDepartment = {
        id: 'dept-1',
        nom: 'Informatique',
        totalReponses: 50,
        averageRating: 4.3,
        participationRate: 0.8,
      };

      const mockFilieres = {
        data: [
          { id: 'fil-1', name: 'L3 Info', totalReponses: 25, averageRating: 4.5 },
          { id: 'fil-2', name: 'M1 Info', totalReponses: 25, averageRating: 4.1 },
        ],
        total: 2,
      };

      repository.getDepartmentStats.mockResolvedValue(mockDepartment);
      repository.getFiliereStatsByDepartment.mockResolvedValue(mockFilieres);

      const result = await service.getDepartmentAnalytics('dept-1', {});

      expect(result).toEqual({
        department: mockDepartment,
        filieres: mockFilieres.data,
        pagination: {
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    });

    it('should return null if department not found', async () => {
      repository.getDepartmentStats.mockResolvedValue(null);

      const result = await service.getDepartmentAnalytics('invalid-dept', {});

      expect(result).toBeNull();
      expect(repository.getFiliereStatsByDepartment).not.toHaveBeenCalled();
    });
  });

  describe('getFiliereAnalytics', () => {
    it('should return filiere analytics', async () => {
      const mockFiliere = {
        id: 'fil-1',
        name: 'L3 Info',
        totalReponses: 30,
        averageRating: 4.4,
        participationRate: 0.85,
      };

      const mockMatieres = {
        data: [
          { id: 'mat-1', nom: 'Math', averageRating: 4.6 },
          { id: 'mat-2', nom: 'Info', averageRating: 4.2 },
        ],
        total: 2,
      };

      repository.getFiliereStats.mockResolvedValue(mockFiliere);
      repository.getMatiereStatsByFiliere.mockResolvedValue(mockMatieres);

      const result = await service.getFiliereAnalytics('fil-1', {});

      expect(result).toEqual({
        filiere: mockFiliere,
        matieres: mockMatieres.data,
        pagination: {
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    });

    it('should return null if filiere not found', async () => {
      repository.getFiliereStats.mockResolvedValue(null);

      const result = await service.getFiliereAnalytics('invalid-fil', {});

      expect(result).toBeNull();
    });
  });

  describe('getTrends', () => {
    it('should return trend data', async () => {
      const mockTrends = {
        period: 'monthly',
        data: [
          { date: '2024-01', participation: 80, averageRating: 4.2 },
          { date: '2024-02', participation: 85, averageRating: 4.3 },
        ],
      };

      repository.getTrends.mockResolvedValue(mockTrends);

      const result = await service.getTrends({ period: 'monthly' });

      expect(result).toEqual(mockTrends);
      expect(repository.getTrends).toHaveBeenCalledWith({ period: 'monthly' });
    });
  });
});
