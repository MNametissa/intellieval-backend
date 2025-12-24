import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DepartmentsRepository } from './departments.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { FilterDepartmentDto } from './dto/filter-department.dto';
import {
  DepartmentCreatedEvent,
  DepartmentUpdatedEvent,
  DepartmentDeletedEvent,
} from '../shared/events/department.events';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly repository: DepartmentsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.repository.findByName(
      createDepartmentDto.name,
    );

    if (existingDepartment) {
      throw new ConflictException('Un département avec ce nom existe déjà');
    }

    const department = await this.repository.create(createDepartmentDto);

    this.eventEmitter.emit(
      'department.created',
      new DepartmentCreatedEvent(
        department.id,
        department.name,
        department.createdAt,
      ),
    );

    return department;
  }

  async findAll(filterDto: FilterDepartmentDto) {
    return this.repository.findAll(filterDto);
  }

  async findOne(id: string) {
    const department = await this.repository.findById(id);

    if (!department) {
      throw new NotFoundException('Département non trouvé');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

    if (updateDepartmentDto.name) {
      const existingDepartment = await this.repository.findByName(
        updateDepartmentDto.name,
      );

      if (existingDepartment && existingDepartment.id !== id) {
        throw new ConflictException('Un département avec ce nom existe déjà');
      }
    }

    const updated = await this.repository.update(id, updateDepartmentDto);

    if (!updated) {
      throw new NotFoundException(
        'Département non trouvé après mise à jour',
      );
    }

    this.eventEmitter.emit(
      'department.updated',
      new DepartmentUpdatedEvent(updated.id, updated.name, updated.updatedAt),
    );

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.repository.delete(id);

    this.eventEmitter.emit(
      'department.deleted',
      new DepartmentDeletedEvent(id, new Date()),
    );
  }
}
