import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilieresRepository } from './filieres.repository';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { FilterFiliereDto } from './dto/filter-filiere.dto';
import {
  FiliereCreatedEvent,
  FiliereUpdatedEvent,
  FiliereDeletedEvent,
} from '../shared/events/filiere.events';

@Injectable()
export class FilieresService {
  constructor(
    private readonly repository: FilieresRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createFiliereDto: CreateFiliereDto) {
    const existingFiliere = await this.repository.findByNameAndDepartment(
      createFiliereDto.name,
      createFiliereDto.departmentId,
    );

    if (existingFiliere) {
      throw new ConflictException(
        'Une filière avec ce nom existe déjà dans ce département',
      );
    }

    const filiere = await this.repository.create(createFiliereDto);

    this.eventEmitter.emit(
      'filiere.created',
      new FiliereCreatedEvent(
        filiere.id,
        filiere.name,
        filiere.departmentId,
        filiere.createdAt,
      ),
    );

    return filiere;
  }

  async findAll(filterDto: FilterFiliereDto) {
    return this.repository.findAll(filterDto);
  }

  async findOne(id: string) {
    const filiere = await this.repository.findById(id);

    if (!filiere) {
      throw new NotFoundException('Filière non trouvée');
    }

    return filiere;
  }

  async update(id: string, updateFiliereDto: UpdateFiliereDto) {
    await this.findOne(id);

    if (updateFiliereDto.name && updateFiliereDto.departmentId) {
      const existingFiliere = await this.repository.findByNameAndDepartment(
        updateFiliereDto.name,
        updateFiliereDto.departmentId,
      );

      if (existingFiliere && existingFiliere.id !== id) {
        throw new ConflictException(
          'Une filière avec ce nom existe déjà dans ce département',
        );
      }
    }

    const updated = await this.repository.update(id, updateFiliereDto);

    if (!updated) {
      throw new NotFoundException('Filière non trouvée après mise à jour');
    }

    this.eventEmitter.emit(
      'filiere.updated',
      new FiliereUpdatedEvent(
        updated.id,
        updated.name,
        updated.departmentId,
        updated.updatedAt,
      ),
    );

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.repository.delete(id);

    this.eventEmitter.emit(
      'filiere.deleted',
      new FiliereDeletedEvent(id, new Date()),
    );
  }
}
