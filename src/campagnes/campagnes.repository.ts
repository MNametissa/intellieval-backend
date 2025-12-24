import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campagne } from './entities/campagne.entity';

@Injectable()
export class CampagnesRepository {
  constructor(
    @InjectRepository(Campagne)
    private readonly repository: Repository<Campagne>,
  ) {}

  async create(campagne: Partial<Campagne>): Promise<Campagne> {
    const entity = this.repository.create(campagne);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<Campagne | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['questionnaire', 'matieres', 'enseignants'],
    });
  }

  async findAll(): Promise<Campagne[]> {
    return this.repository.find({
      relations: ['questionnaire', 'matieres', 'enseignants'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Campagne>): Promise<Campagne | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async save(campagne: Campagne): Promise<Campagne> {
    return this.repository.save(campagne);
  }

  getRepository(): Repository<Campagne> {
    return this.repository;
  }
}
