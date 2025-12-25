import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReponsesService } from './reponses.service';
import { ReponsesRepository } from './reponses.repository';
import { CampagnesRepository } from '../campagnes/campagnes.repository';
import { QuestionnairesRepository } from '../questionnaires/questionnaires.repository';
import { SubmitReponseDto } from './dto/submit-reponse.dto';
import { TestDataFactory } from '../common/test-utils/test-data.factory';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';

describe('ReponsesService', () => {
  let service: ReponsesService;
  let repository: ReturnType<typeof createMockRepository>;
  let campagnesRepository: ReturnType<typeof createMockRepository>;
  let questionnairesRepository: ReturnType<typeof createMockRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    repository = createMockRepository();
    campagnesRepository = createMockRepository();
    questionnairesRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReponsesService,
        {
          provide: ReponsesRepository,
          useValue: repository,
        },
        {
          provide: CampagnesRepository,
          useValue: campagnesRepository,
        },
        {
          provide: QuestionnairesRepository,
          useValue: questionnairesRepository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReponsesService>(ReponsesService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submit', () => {
    const submitDto: SubmitReponseDto = {
      campagneId: 'campagne-id',
      enseignantId: 'enseignant-id',
      matiereId: 'matiere-id',
      reponses: [
        { questionId: 'q1', reponse: 5 },
        { questionId: 'q2', reponse: 4 },
      ],
    };

    const mockUser = { userId: 'user-id', role: 'ETUDIANT' };

    it('should successfully submit a reponse', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne({
        statut: 'active',
        dateDebut: new Date('2024-01-01'),
        dateFin: new Date('2024-12-31'),
      });
      const mockQuestionnaire = TestDataFactory.createMockQuestionnaire();

      campagnesRepository.findOneBy.mockResolvedValue(mockCampagne);
      questionnairesRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
      repository.findOne.mockResolvedValue(null); // No existing response
      repository.save.mockResolvedValue({ id: 'reponse-id', ...submitDto } as any);

      const result = await service.submit(submitDto, mockUser);

      expect(campagnesRepository.findOneBy).toHaveBeenCalledWith({ id: submitDto.campagneId });
      expect(repository.findOne).toHaveBeenCalled(); // Check for existing response
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'reponse.submitted',
        expect.objectContaining({
          reponseId: 'reponse-id',
        }),
      );
    });

    it('should throw NotFoundException if campagne does not exist', async () => {
      campagnesRepository.findOneBy.mockResolvedValue(null);

      await expect(service.submit(submitDto, mockUser)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if campagne is not active', async () => {
      const inactiveCampagne = TestDataFactory.createMockCampagne({ statut: 'completed' });
      campagnesRepository.findOneBy.mockResolvedValue(inactiveCampagne);

      await expect(service.submit(submitDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if campagne has not started', async () => {
      const futureCampagne = TestDataFactory.createMockCampagne({
        statut: 'active',
        dateDebut: new Date('2025-01-01'),
        dateFin: new Date('2025-12-31'),
      });
      campagnesRepository.findOneBy.mockResolvedValue(futureCampagne);

      await expect(service.submit(submitDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if campagne has ended', async () => {
      const expiredCampagne = TestDataFactory.createMockCampagne({
        statut: 'active',
        dateDebut: new Date('2023-01-01'),
        dateFin: new Date('2023-12-31'),
      });
      campagnesRepository.findOneBy.mockResolvedValue(expiredCampagne);

      await expect(service.submit(submitDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already submitted response', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne({
        statut: 'active',
        dateDebut: new Date('2024-01-01'),
        dateFin: new Date('2024-12-31'),
      });
      const mockQuestionnaire = TestDataFactory.createMockQuestionnaire();
      const existingReponse = { id: 'existing-id' };

      campagnesRepository.findOneBy.mockResolvedValue(mockCampagne);
      questionnairesRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
      repository.findOne.mockResolvedValue(existingReponse as any);

      await expect(service.submit(submitDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated reponses with filters', async () => {
      const mockReponses = [
        { id: 'rep-1', campagneId: 'camp-1', etudiantId: 'user-1' },
        { id: 'rep-2', campagneId: 'camp-1', etudiantId: 'user-2' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReponses, 2]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        campagneId: 'camp-1',
      });

      expect(result).toEqual({
        data: mockReponses,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    const mockUser = { userId: 'user-id', role: 'ETUDIANT' };

    it('should return a reponse for admin', async () => {
      const mockReponse = { id: 'rep-1', etudiantId: 'other-user' };
      const adminUser = { userId: 'admin-id', role: 'ADMIN' };

      repository.findOne.mockResolvedValue(mockReponse as any);

      const result = await service.findOne('rep-1', adminUser);

      expect(result).toEqual(mockReponse);
    });

    it('should return own reponse for etudiant', async () => {
      const mockReponse = { id: 'rep-1', etudiantId: 'user-id' };

      repository.findOne.mockResolvedValue(mockReponse as any);

      const result = await service.findOne('rep-1', mockUser);

      expect(result).toEqual(mockReponse);
    });

    it('should throw ForbiddenException if etudiant tries to access another reponse', async () => {
      const mockReponse = { id: 'rep-1', etudiantId: 'other-user' };

      repository.findOne.mockResolvedValue(mockReponse as any);

      await expect(service.findOne('rep-1', mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if reponse not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
