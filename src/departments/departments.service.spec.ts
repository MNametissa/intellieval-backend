import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DepartmentsService } from './departments.service';
import { DepartmentsRepository } from './departments.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { TestDataFactory } from '../common/test-utils/test-data.factory';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repository: ReturnType<typeof createMockRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: DepartmentsRepository,
          useValue: repository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateDepartmentDto = {
      code: 'INFO',
      nom: 'Informatique',
      description: 'Département Informatique',
    };

    it('should successfully create a department', async () => {
      const mockDepartment = TestDataFactory.createMockDepartment();

      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue(mockDepartment);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: createDto.code },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'department.created',
        expect.objectContaining({
          departmentId: mockDepartment.id,
        }),
      );
      expect(result).toEqual(mockDepartment);
    });

    it('should throw ConflictException if code already exists', async () => {
      const existingDepartment = TestDataFactory.createMockDepartment();
      repository.findOne.mockResolvedValue(existingDepartment);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated departments with search', async () => {
      const mockDepartments = [
        TestDataFactory.createMockDepartment(),
        TestDataFactory.createMockDepartment({ id: 'dept-2', code: 'MATH', nom: 'Mathématiques' }),
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockDepartments, 2]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'info',
      });

      expect(result).toEqual({
        data: mockDepartments,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should return all departments without filters', async () => {
      const mockDepartments = [TestDataFactory.createMockDepartment()];
      const mockQueryBuilder = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockDepartments, 1]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockDepartments);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      const mockDepartment = TestDataFactory.createMockDepartment();
      repository.findOneBy.mockResolvedValue(mockDepartment);

      const result = await service.findOne(mockDepartment.id);

      expect(result).toEqual(mockDepartment);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockDepartment.id });
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateDepartmentDto = {
      nom: 'Informatique et Réseaux',
    };

    it('should successfully update a department', async () => {
      const mockDepartment = TestDataFactory.createMockDepartment();
      const updatedDepartment = { ...mockDepartment, ...updateDto };

      repository.findOneBy.mockResolvedValue(mockDepartment);
      repository.save.mockResolvedValue(updatedDepartment);

      const result = await service.update(mockDepartment.id, updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'department.updated',
        expect.objectContaining({
          departmentId: mockDepartment.id,
        }),
      );
      expect(result).toEqual(updatedDepartment);
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a department', async () => {
      const mockDepartment = TestDataFactory.createMockDepartment();
      repository.findOneBy.mockResolvedValue(mockDepartment);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockDepartment.id);

      expect(repository.delete).toHaveBeenCalledWith(mockDepartment.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'department.deleted',
        expect.objectContaining({
          departmentId: mockDepartment.id,
        }),
      );
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
