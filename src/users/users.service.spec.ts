import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { DepartmentsRepository } from '../departments/departments.repository';
import { FilieresRepository } from '../filieres/filieres.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TestDataFactory } from '../common/test-utils/test-data.factory';
import { createMockRepository } from '../common/test-utils/mock-repository.factory';
import { UserRole } from './entities/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: ReturnType<typeof createMockRepository>;
  let departmentsRepository: ReturnType<typeof createMockRepository>;
  let filieresRepository: ReturnType<typeof createMockRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    usersRepository = {
      ...createMockRepository(),
      emailExists: jest.fn(),
      matriculeExists: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByMatricule: jest.fn(),
      findByRole: jest.fn(),
      findByDepartment: jest.fn(),
      findByFiliere: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulkCreate: jest.fn(),
    };
    departmentsRepository = createMockRepository();
    filieresRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
        {
          provide: DepartmentsRepository,
          useValue: departmentsRepository,
        },
        {
          provide: FilieresRepository,
          useValue: filieresRepository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.ETUDIANT,
      departmentId: 'dept-id',
      filiereId: 'filiere-id',
      matricule: 'ETU001',
    };

    it('should successfully create a user', async () => {
      // Arrange
      const mockDepartment = TestDataFactory.createMockDepartment();
      const mockFiliere = TestDataFactory.createMockFiliere();
      const mockUser = TestDataFactory.createMockUser();

      usersRepository.emailExists.mockResolvedValue(false);
      departmentsRepository.findOneBy.mockResolvedValue(mockDepartment);
      filieresRepository.findOneBy.mockResolvedValue(mockFiliere);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(usersRepository.emailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(departmentsRepository.findOneBy).toHaveBeenCalledWith({ id: createUserDto.departmentId });
      expect(filieresRepository.findOneBy).toHaveBeenCalledWith({ id: createUserDto.filiereId });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      usersRepository.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if department does not exist', async () => {
      // Arrange
      usersRepository.emailExists.mockResolvedValue(false);
      departmentsRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(NotFoundException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if filiere does not exist', async () => {
      // Arrange
      const mockDepartment = TestDataFactory.createMockDepartment();
      usersRepository.emailExists.mockResolvedValue(false);
      departmentsRepository.findOneBy.mockResolvedValue(mockDepartment);
      filieresRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(NotFoundException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should create admin without department and filiere', async () => {
      // Arrange
      const adminDto = {
        ...createUserDto,
        role: UserRole.ADMIN,
        departmentId: undefined,
        filiereId: undefined,
      };
      const mockAdmin = TestDataFactory.createMockAdmin();

      usersRepository.emailExists.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersRepository.create.mockResolvedValue(mockAdmin);

      // Act
      const result = await service.create(adminDto);

      // Assert
      expect(departmentsRepository.findOneBy).not.toHaveBeenCalled();
      expect(filieresRepository.findOneBy).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated users with filters', async () => {
      // Arrange
      const mockUsers = [
        TestDataFactory.createMockUser(),
        TestDataFactory.createMockUser({ id: 'user-2', email: 'user2@example.com' }),
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 2]),
      };

      usersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findAll({
        page: 1,
        limit: 10,
        role: UserRole.ETUDIANT,
        search: 'test',
      });

      // Assert
      expect(result).toEqual({
        data: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should return all users without filters', async () => {
      // Arrange
      const mockUsers = [TestDataFactory.createMockUser()];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 1]),
      };

      usersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Arrange
      const mockUser = TestDataFactory.createMockUser();
      usersRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(mockUser.id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      usersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should successfully update a user', async () => {
      // Arrange
      const mockUser = TestDataFactory.createMockUser();
      const updatedUser = { ...mockUser, ...updateUserDto };

      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(mockUser.id, updateUserDto);

      // Assert
      expect(usersRepository.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.updated',
        expect.objectContaining({
          userId: mockUser.id,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      usersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('invalid-id', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should hash password if password is being updated', async () => {
      // Arrange
      const mockUser = TestDataFactory.createMockUser();
      const updateWithPassword = { password: 'newpassword123' };

      usersRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      usersRepository.update.mockResolvedValue(mockUser);

      // Act
      await service.update(mockUser.id, updateWithPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('remove', () => {
    it('should successfully delete a user', async () => {
      // Arrange
      const mockUser = TestDataFactory.createMockUser();
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.delete.mockResolvedValue(true);

      // Act
      await service.remove(mockUser.id);

      // Assert
      expect(usersRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.deleted',
        expect.objectContaining({
          userId: mockUser.id,
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      usersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
