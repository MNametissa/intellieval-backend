import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './entities/user.entity';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
} from '../shared/events/user.events';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingEmail = await this.repository.emailExists(
      createUserDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    if (createUserDto.matricule) {
      const existingMatricule = await this.repository.matriculeExists(
        createUserDto.matricule,
      );
      if (existingMatricule) {
        throw new ConflictException('Matricule already exists');
      }
    }

    if (createUserDto.role === UserRole.ETUDIANT && !createUserDto.filiereId) {
      throw new BadRequestException('Students must have a filiereId');
    }

    if (
      createUserDto.role === UserRole.ETUDIANT &&
      !createUserDto.matricule
    ) {
      throw new BadRequestException('Students must have a matricule');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.repository.create({
      ...createUserDto,
      password: hashedPassword,
      filiereId:
        createUserDto.role === UserRole.ETUDIANT
          ? createUserDto.filiereId
          : null,
      matricule:
        createUserDto.role === UserRole.ETUDIANT
          ? createUserDto.matricule
          : null,
    });

    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(
        user.id,
        user.email,
        user.name,
        user.role,
        user.departmentId,
        user.filiereId,
        user.matricule,
        user.createdAt,
      ),
    );

    const { password, ...result } = user;
    return result;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.repository.findAll();
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async findByRole(role: UserRole): Promise<UserResponseDto[]> {
    const users = await this.repository.findByRole(role);
    return users.map(({ password, ...user }) => user);
  }

  async findByDepartment(departmentId: string): Promise<UserResponseDto[]> {
    const users = await this.repository.findByDepartment(departmentId);
    return users.map(({ password, ...user }) => user);
  }

  async findByFiliere(filiereId: string): Promise<UserResponseDto[]> {
    const users = await this.repository.findByFiliere(filiereId);
    return users.map(({ password, ...user }) => user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.repository.emailExists(
        updateUserDto.email,
      );
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (
      updateUserDto.matricule &&
      updateUserDto.matricule !== user.matricule
    ) {
      const existingMatricule = await this.repository.matriculeExists(
        updateUserDto.matricule,
      );
      if (existingMatricule) {
        throw new ConflictException('Matricule already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.repository.update(id, updateUserDto);

    if (!updated) {
      throw new NotFoundException('User not found after update');
    }

    const updatedFields = Object.keys(updateUserDto);
    this.eventEmitter.emit(
      'user.updated',
      new UserUpdatedEvent(updated.id, updated.email, updatedFields, new Date()),
    );

    const { password, ...result } = updated;
    return result;
  }

  async remove(id: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.repository.delete(id);

    this.eventEmitter.emit(
      'user.deleted',
      new UserDeletedEvent(id, user.role, new Date()),
    );
  }
}
