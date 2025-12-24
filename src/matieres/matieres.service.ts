import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Matiere } from './entities/matiere.entity';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';
import { FilterMatiereDto } from './dto/filter-matiere.dto';
import {
  MatiereCreatedEvent,
  MatiereUpdatedEvent,
  MatiereDeletedEvent,
  MatiereEnseignantAssignedEvent,
  MatiereEnseignantUnassignedEvent,
} from '../shared/events/matiere.events';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../shared/enums/user-role.enum';

@Injectable()
export class MatieresService {
  constructor(
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createMatiereDto: CreateMatiereDto): Promise<Matiere> {
    const existingMatiere = await this.matiereRepository.findOne({
      where: { code: createMatiereDto.code },
    });

    if (existingMatiere) {
      throw new ConflictException(
        `Matiere with code ${createMatiereDto.code} already exists`,
      );
    }

    const { enseignantIds, ...matiereData } = createMatiereDto;

    const matiere = this.matiereRepository.create(matiereData);

    if (enseignantIds && enseignantIds.length > 0) {
      const enseignants = await this.userRepository.find({
        where: enseignantIds.map((id) => ({ id, role: UserRole.ENSEIGNANT })),
      });

      if (enseignants.length !== enseignantIds.length) {
        throw new BadRequestException(
          'One or more enseignant IDs are invalid',
        );
      }

      matiere.enseignants = enseignants;
    }

    const savedMatiere = await this.matiereRepository.save(matiere);

    this.eventEmitter.emit(
      'matiere.created',
      new MatiereCreatedEvent(
        savedMatiere.id,
        savedMatiere.code,
        savedMatiere.nom,
        savedMatiere.departmentId,
        savedMatiere.filiereId,
      ),
    );

    if (enseignantIds && enseignantIds.length > 0) {
      for (const enseignantId of enseignantIds) {
        this.eventEmitter.emit(
          'matiere.enseignant.assigned',
          new MatiereEnseignantAssignedEvent(savedMatiere.id, enseignantId),
        );
      }
    }

    return savedMatiere;
  }

  async findAll(filterDto: FilterMatiereDto): Promise<{
    data: Matiere[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, departmentId, filiereId, enseignantId, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.matiereRepository
      .createQueryBuilder('matiere')
      .leftJoinAndSelect('matiere.department', 'department')
      .leftJoinAndSelect('matiere.filiere', 'filiere')
      .leftJoinAndSelect('matiere.enseignants', 'enseignants');

    if (search) {
      queryBuilder.andWhere(
        '(matiere.code LIKE :search OR matiere.nom LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (departmentId) {
      queryBuilder.andWhere('matiere.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (filiereId) {
      queryBuilder.andWhere('matiere.filiereId = :filiereId', { filiereId });
    }

    if (enseignantId) {
      queryBuilder.andWhere('enseignants.id = :enseignantId', {
        enseignantId,
      });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('matiere.createdAt', 'DESC')
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Matiere> {
    const matiere = await this.matiereRepository.findOne({
      where: { id },
      relations: ['department', 'filiere', 'enseignants'],
    });

    if (!matiere) {
      throw new NotFoundException(`Matiere with ID ${id} not found`);
    }

    return matiere;
  }

  async update(
    id: string,
    updateMatiereDto: UpdateMatiereDto,
  ): Promise<Matiere> {
    const matiere = await this.findOne(id);

    if (updateMatiereDto.code && updateMatiereDto.code !== matiere.code) {
      const existingMatiere = await this.matiereRepository.findOne({
        where: { code: updateMatiereDto.code },
      });

      if (existingMatiere) {
        throw new ConflictException(
          `Matiere with code ${updateMatiereDto.code} already exists`,
        );
      }
    }

    const { enseignantIds, ...matiereData } = updateMatiereDto;

    Object.assign(matiere, matiereData);

    if (enseignantIds !== undefined) {
      if (enseignantIds.length > 0) {
        const enseignants = await this.userRepository.find({
          where: enseignantIds.map((enseignantId) => ({
            id: enseignantId,
            role: UserRole.ENSEIGNANT,
          })),
        });

        if (enseignants.length !== enseignantIds.length) {
          throw new BadRequestException(
            'One or more enseignant IDs are invalid',
          );
        }

        matiere.enseignants = enseignants;
      } else {
        matiere.enseignants = [];
      }
    }

    const savedMatiere = await this.matiereRepository.save(matiere);

    this.eventEmitter.emit(
      'matiere.updated',
      new MatiereUpdatedEvent(
        savedMatiere.id,
        savedMatiere.code,
        savedMatiere.nom,
        savedMatiere.departmentId,
        savedMatiere.filiereId,
      ),
    );

    return savedMatiere;
  }

  async remove(id: string): Promise<void> {
    const matiere = await this.findOne(id);

    await this.matiereRepository.remove(matiere);

    this.eventEmitter.emit(
      'matiere.deleted',
      new MatiereDeletedEvent(matiere.id, matiere.code),
    );
  }

  async assignEnseignant(
    matiereId: string,
    enseignantId: string,
  ): Promise<Matiere> {
    const matiere = await this.matiereRepository.findOne({
      where: { id: matiereId },
      relations: ['enseignants'],
    });

    if (!matiere) {
      throw new NotFoundException(`Matiere with ID ${matiereId} not found`);
    }

    const enseignant = await this.userRepository.findOne({
      where: { id: enseignantId, role: UserRole.ENSEIGNANT },
    });

    if (!enseignant) {
      throw new NotFoundException(
        `Enseignant with ID ${enseignantId} not found`,
      );
    }

    const isAlreadyAssigned = matiere.enseignants.some(
      (ens) => ens.id === enseignantId,
    );

    if (isAlreadyAssigned) {
      throw new ConflictException(
        'Enseignant is already assigned to this matiere',
      );
    }

    matiere.enseignants.push(enseignant);
    const savedMatiere = await this.matiereRepository.save(matiere);

    this.eventEmitter.emit(
      'matiere.enseignant.assigned',
      new MatiereEnseignantAssignedEvent(matiereId, enseignantId),
    );

    return savedMatiere;
  }

  async unassignEnseignant(
    matiereId: string,
    enseignantId: string,
  ): Promise<Matiere> {
    const matiere = await this.matiereRepository.findOne({
      where: { id: matiereId },
      relations: ['enseignants'],
    });

    if (!matiere) {
      throw new NotFoundException(`Matiere with ID ${matiereId} not found`);
    }

    const enseignantIndex = matiere.enseignants.findIndex(
      (ens) => ens.id === enseignantId,
    );

    if (enseignantIndex === -1) {
      throw new NotFoundException(
        'Enseignant is not assigned to this matiere',
      );
    }

    matiere.enseignants.splice(enseignantIndex, 1);
    const savedMatiere = await this.matiereRepository.save(matiere);

    this.eventEmitter.emit(
      'matiere.enseignant.unassigned',
      new MatiereEnseignantUnassignedEvent(matiereId, enseignantId),
    );

    return savedMatiere;
  }
}
