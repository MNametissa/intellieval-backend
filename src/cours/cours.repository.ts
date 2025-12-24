import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cours } from './entities/cours.entity';

@Injectable()
export class CoursRepository {
  constructor(
    @InjectRepository(Cours)
    private readonly repository: Repository<Cours>,
  ) {}

  async create(coursData: Partial<Cours>): Promise<Cours> {
    const cours = this.repository.create(coursData);
    return this.repository.save(cours);
  }

  async findById(id: string): Promise<Cours | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['matiere', 'matiere.filiere', 'enseignant'],
    });
  }

  async findAll(
    filters: {
      matiereId?: string;
      filiereId?: string;
      enseignantId?: string;
      search?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<[Cours[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('cours')
      .leftJoinAndSelect('cours.matiere', 'matiere')
      .leftJoinAndSelect('matiere.filiere', 'filiere')
      .leftJoinAndSelect('cours.enseignant', 'enseignant');

    if (filters.matiereId) {
      queryBuilder.andWhere('cours.matiere_id = :matiereId', {
        matiereId: filters.matiereId,
      });
    }

    if (filters.filiereId) {
      queryBuilder.andWhere('matiere.filiere_id = :filiereId', {
        filiereId: filters.filiereId,
      });
    }

    if (filters.enseignantId) {
      queryBuilder.andWhere('cours.enseignant_id = :enseignantId', {
        enseignantId: filters.enseignantId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(cours.titre LIKE :search OR cours.description LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder
      .orderBy('cours.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  async update(id: string, updateData: Partial<Cours>): Promise<Cours | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  getRepository(): Repository<Cours> {
    return this.repository;
  }
}
