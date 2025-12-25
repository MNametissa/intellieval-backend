import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilieresService } from './filieres.service';
import { FilieresRepository } from './filieres.repository';
import { DepartmentsRepository } from '../departments/departments.repository';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { TestDataFactory } from '../common/test-utils/test-data.factory';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';

describe('FilieresService', () => {
  let service: FilieresService;
  let repository: ReturnType<typeof createMockRepository>;
  let departmentsRepository: ReturnType<typeof createMockRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    repository = {
      ...createMockRepository(),
      findByNameAndDepartment: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
    };
    departmentsRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilieresService,
        {
          provide: FilieresRepository,
          useValue: repository,
        },
        {
          provide: DepartmentsRepository,
          useValue: departmentsRepository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilieresService>(FilieresService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateFiliereDto = {
      code: 'L3INFO',
      name: 'Licence 3 Informatique',
      description: 'Licence 3 en Informatique',
      departmentId: 'dept-id',
    };

    it('should successfully create a filiere', async () => {
      const mockDepartment = TestDataFactory.createMockDepartment();
      const mockFiliere = TestDataFactory.createMockFiliere();

      repository.findByNameAndDepartment.mockResolvedValue(null);
      departmentsRepository.findOneBy.mockResolvedValue(mockDepartment);
      repository.create.mockResolvedValue(mockFiliere);

      const result = await service.create(createDto);

      expect(repository.findByNameAndDepartment).toHaveBeenCalledWith(createDto.name, createDto.departmentId);
      expect(departmentsRepository.findOneBy).toHaveBeenCalledWith({ id: createDto.departmentId });
      expect(repository.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'filiere.created',
        expect.objectContaining({
          filiereId: mockFiliere.id,
        }),
      );
      expect(result).toEqual(mockFiliere);
    });

    it('should throw ConflictException if name already exists in department', async () => {
      const existingFiliere = TestDataFactory.createMockFiliere();
      repository.findByNameAndDepartment.mockResolvedValue(existingFiliere);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if department does not exist', async () => {
      repository.findByNameAndDepartment.mockResolvedValue(null);
      departmentsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated filieres with filters', async () => {
      const mockFilieres = [
        TestDataFactory.createMockFiliere(),
        TestDataFactory.createMockFiliere({ id: 'filiere-2', code: 'M1INFO', name: 'Master 1 Informatique' }),
      ];

      const mockResult = {
        data: mockFilieres,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      repository.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        departmentId: 'dept-id',
        search: 'info',
      });

      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        departmentId: 'dept-id',
        search: 'info',
      });
    });
  });

  describe('findOne', () => {
    it('should return a filiere by id', async () => {
      const mockFiliere = TestDataFactory.createMockFiliere();
      repository.findById.mockResolvedValue(mockFiliere);

      const result = await service.findOne(mockFiliere.id);

      expect(result).toEqual(mockFiliere);
      expect(repository.findById).toHaveBeenCalledWith(mockFiliere.id);
    });

    it('should throw NotFoundException if filiere not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateFiliereDto = {
      name: 'Licence 3 Informatique et Réseaux',
    };

    it('should successfully update a filiere', async () => {
      const mockFiliere = TestDataFactory.createMockFiliere();
      const updatedFiliere = { ...mockFiliere, ...updateDto };

      repository.findById.mockResolvedValue(mockFiliere);
      repository.update.mockResolvedValue(updatedFiliere);

      const result = await service.update(mockFiliere.id, updateDto);

      expect(repository.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'filiere.updated',
        expect.objectContaining({
          filiereId: mockFiliere.id,
        }),
      );
      expect(result).toEqual(updatedFiliere);
    });

    it('should throw NotFoundException if filiere not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a filiere', async () => {
      const mockFiliere = TestDataFactory.createMockFiliere();
      repository.findById.mockResolvedValue(mockFiliere);
      repository.delete.mockResolvedValue(true);

      await service.remove(mockFiliere.id);

      expect(repository.delete).toHaveBeenCalledWith(mockFiliere.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'filiere.deleted',
        expect.objectContaining({
          filiereId: mockFiliere.id,
        }),
      );
    });

    it('should throw NotFoundException if filiere not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
