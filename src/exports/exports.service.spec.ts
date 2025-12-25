import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ReponsesRepository } from '../reponses/reponses.repository';
import { CampagnesRepository } from '../campagnes/campagnes.repository';
import { AnalyticsRepository } from '../analytics/analytics.repository';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';
import { TestDataFactory } from '../common/test-utils/test-data.factory';

describe('ExportsService', () => {
  let service: ExportsService;
  let reponsesRepository: ReturnType<typeof createMockRepository>;
  let campagnesRepository: ReturnType<typeof createMockRepository>;
  let analyticsRepository: jest.Mocked<any>;

  beforeEach(async () => {
    reponsesRepository = createMockRepository();
    campagnesRepository = createMockRepository();
    analyticsRepository = {
      getChartData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsService,
        {
          provide: ReponsesRepository,
          useValue: reponsesRepository,
        },
        {
          provide: CampagnesRepository,
          useValue: campagnesRepository,
        },
        {
          provide: AnalyticsRepository,
          useValue: analyticsRepository,
        },
      ],
    }).compile();

    service = module.get<ExportsService>(ExportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportReponsesToExcel', () => {
    it('should export reponses to Excel format', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne();
      const mockReponses = [
        { id: 'rep-1', etudiantId: 'user-1', reponses: [{ questionId: 'q1', reponse: 5 }] },
        { id: 'rep-2', etudiantId: 'user-2', reponses: [{ questionId: 'q1', reponse: 4 }] },
      ];

      campagnesRepository.findOne.mockResolvedValue(mockCampagne);
      reponsesRepository.find.mockResolvedValue(mockReponses);

      const result = await service.exportReponsesToExcel('campagne-1');

      expect(campagnesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'campagne-1' },
        relations: ['questionnaire'],
      });
      expect(reponsesRepository.find).toHaveBeenCalledWith({
        where: { campagneId: 'campagne-1' },
        relations: ['etudiant', 'enseignant', 'matiere'],
      });
      expect(result).toBeDefined();
      expect(result.buffer).toBeDefined();
      expect(result.filename).toContain('.xlsx');
    });

    it('should throw NotFoundException if campagne not found', async () => {
      campagnesRepository.findOne.mockResolvedValue(null);

      await expect(service.exportReponsesToExcel('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportReponsesToCSV', () => {
    it('should export reponses to CSV format', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne();
      const mockReponses = [
        { id: 'rep-1', etudiantId: 'user-1', reponses: [{ questionId: 'q1', reponse: 5 }] },
      ];

      campagnesRepository.findOne.mockResolvedValue(mockCampagne);
      reponsesRepository.find.mockResolvedValue(mockReponses);

      const result = await service.exportReponsesToCSV('campagne-1');

      expect(result).toBeDefined();
      expect(result.content).toContain('Étudiant');
      expect(result.filename).toContain('.csv');
      expect(result.mimeType).toBe('text/csv');
    });

    it('should throw NotFoundException if campagne not found', async () => {
      campagnesRepository.findOne.mockResolvedValue(null);

      await expect(service.exportReponsesToCSV('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportReponsesToPDF', () => {
    it('should export reponses to PDF format', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne();
      const mockReponses = [
        { id: 'rep-1', etudiantId: 'user-1', etudiant: { name: 'John' }, reponses: [{ questionId: 'q1', reponse: 5 }] },
      ];

      campagnesRepository.findOne.mockResolvedValue(mockCampagne);
      reponsesRepository.find.mockResolvedValue(mockReponses);

      const result = await service.exportReponsesToPDF('campagne-1');

      expect(result).toBeDefined();
      expect(result.buffer).toBeDefined();
      expect(result.filename).toContain('.pdf');
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should throw NotFoundException if campagne not found', async () => {
      campagnesRepository.findOne.mockResolvedValue(null);

      await expect(service.exportReponsesToPDF('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportChartData', () => {
    it('should export chart data to Excel', async () => {
      const mockChartData = {
        labels: ['Dept1', 'Dept2'],
        datasets: [
          { label: 'Participation', data: [80, 90] },
          { label: 'Average Rating', data: [4.2, 4.5] },
        ],
      };

      analyticsRepository.getChartData.mockResolvedValue(mockChartData);

      const result = await service.exportChartData({ chartType: 'participation' });

      expect(analyticsRepository.getChartData).toHaveBeenCalledWith({ chartType: 'participation' });
      expect(result).toBeDefined();
      expect(result.buffer).toBeDefined();
      expect(result.filename).toContain('chart');
      expect(result.filename).toContain('.xlsx');
    });

    it('should handle empty chart data', async () => {
      analyticsRepository.getChartData.mockResolvedValue({
        labels: [],
        datasets: [],
      });

      const result = await service.exportChartData({ chartType: 'empty' });

      expect(result).toBeDefined();
      expect(result.buffer).toBeDefined();
    });
  });

  describe('getExportFormats', () => {
    it('should return available export formats', () => {
      const formats = service.getExportFormats();

      expect(formats).toEqual({
        reponses: ['excel', 'csv', 'pdf'],
        charts: ['excel', 'csv', 'png'],
        analytics: ['excel', 'csv', 'pdf'],
      });
    });
  });
});
