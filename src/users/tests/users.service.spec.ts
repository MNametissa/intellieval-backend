import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { UserRole, UserStatus } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.ETUDIANT,
    departmentId: 'dept-123',
    filiereId: 'fil-123',
    matricule: 'MAT2024001',
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByRole: jest.fn(),
      findByDepartment: jest.fn(),
      findByFiliere: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      emailExists: jest.fn(),
      matriculeExists: jest.fn(),
      bulkCreate: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: UserRole.ETUDIANT,
        departmentId: 'dept-123',
        filiereId: 'fil-123',
        matricule: 'MAT2024001',
      };

      repository.emailExists.mockResolvedValue(false);
      repository.matriculeExists.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.emailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.matriculeExists).toHaveBeenCalledWith(
        createUserDto.matricule,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(repository.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(Object),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: UserRole.ETUDIANT,
        departmentId: 'dept-123',
        filiereId: 'fil-123',
        matricule: 'MAT2024001',
      };

      repository.emailExists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if matricule already exists', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: UserRole.ETUDIANT,
        departmentId: 'dept-123',
        filiereId: 'fil-123',
        matricule: 'MAT2024001',
      };

      repository.emailExists.mockResolvedValue(false);
      repository.matriculeExists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user and emit event', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue(true);

      await service.remove(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.deleted',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
