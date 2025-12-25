import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampagnesService } from './campagnes.service';
import { CampagnesRepository } from './campagnes.repository';
import { QuestionnairesRepository } from '../questionnaires/questionnaires.repository';
import { CreateCampagneDto } from './dto/create-campagne.dto';
import { UpdateCampagneDto } from './dto/update-campagne.dto';
import { TestDataFactory } from '../common/test-utils/test-data.factory';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';

describe('CampagnesService', () => {
  let service: CampagnesService;
  let repository: ReturnType<typeof createMockRepository>;
  let questionnairesRepository: ReturnType<typeof createMockRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    repository = createMockRepository();
    questionnairesRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampagnesService,
        {
          provide: CampagnesRepository,
          useValue: repository,
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

    service = module.get<CampagnesService>(CampagnesService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateCampagneDto = {
      titre: 'Campagne Test',
      description: 'Description test',
      dateDebut: new Date('2024-01-01'),
      dateFin: new Date('2024-12-31'),
      questionnaireId: 'questionnaire-id',
      departmentIds: ['dept-1'],
      filiereIds: ['filiere-1'],
      matiereIds: ['matiere-1'],
    };

    it('should successfully create a campagne', async () => {
      const mockQuestionnaire = TestDataFactory.createMockQuestionnaire();
      const mockCampagne = TestDataFactory.createMockCampagne();

      questionnairesRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
      repository.save.mockResolvedValue(mockCampagne);

      const result = await service.create(createDto);

      expect(questionnairesRepository.findOneBy).toHaveBeenCalledWith({ id: createDto.questionnaireId });
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'campagne.created',
        expect.objectContaining({
          campagneId: mockCampagne.id,
        }),
      );
      expect(result).toEqual(mockCampagne);
    });

    it('should throw NotFoundException if questionnaire does not exist', async () => {
      questionnairesRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if dateFin is before dateDebut', async () => {
      const invalidDto = {
        ...createDto,
        dateDebut: new Date('2024-12-31'),
        dateFin: new Date('2024-01-01'),
      };

      const mockQuestionnaire = TestDataFactory.createMockQuestionnaire();
      questionnairesRepository.findOneBy.mockResolvedValue(mockQuestionnaire);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated campagnes with filters', async () => {
      const mockCampagnes = [
        TestDataFactory.createMockCampagne(),
        TestDataFactory.createMockCampagne({ id: 'campagne-2', titre: 'Campagne 2' }),
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockCampagnes, 2]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        statut: 'active',
        search: 'test',
      });

      expect(result).toEqual({
        data: mockCampagnes,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a campagne by id', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne();
      repository.findOne.mockResolvedValue(mockCampagne);

      const result = await service.findOne(mockCampagne.id);

      expect(result).toEqual(mockCampagne);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockCampagne.id },
        relations: ['questionnaire', 'departments', 'filieres', 'matieres'],
      });
    });

    it('should throw NotFoundException if campagne not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCampagneDto = {
      titre: 'Campagne Updated',
      statut: 'completed',
    };

    it('should successfully update a campagne', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne();
      const updatedCampagne = { ...mockCampagne, ...updateDto };

      repository.findOne.mockResolvedValue(mockCampagne);
      repository.save.mockResolvedValue(updatedCampagne);

      const result = await service.update(mockCampagne.id, updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'campagne.updated',
        expect.objectContaining({
          campagneId: mockCampagne.id,
        }),
      );
      expect(result).toEqual(updatedCampagne);
    });

    it('should throw NotFoundException if campagne not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a campagne', async () => {
      const mockCampagne = TestDataFactory.createMockCampagne();
      repository.findOne.mockResolvedValue(mockCampagne);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockCampagne.id);

      expect(repository.delete).toHaveBeenCalledWith(mockCampagne.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'campagne.deleted',
        expect.objectContaining({
          campagneId: mockCampagne.id,
        }),
      );
    });

    it('should throw NotFoundException if campagne not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
