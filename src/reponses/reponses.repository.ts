import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reponse } from './entities/reponse.entity';

@Injectable()
export class ReponsesRepository {
  constructor(
    @InjectRepository(Reponse)
    private readonly repository: Repository<Reponse>,
  ) {}

  async create(reponse: Partial<Reponse>): Promise<Reponse> {
    const entity = this.repository.create(reponse);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<Reponse | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['campagne', 'question', 'filiere', 'matiere', 'enseignant'],
    });
  }

  async findAll(): Promise<Reponse[]> {
    return this.repository.find({
      relations: ['campagne', 'question', 'filiere', 'matiere', 'enseignant'],
      order: { createdAt: 'DESC' },
    });
  }

  async countByCampagneAndMatiere(
    campagneId: string,
    matiereId: string,
  ): Promise<number> {
    return this.repository.count({
      where: { campagneId, matiereId },
    });
  }

  async countByCampagneAndEnseignant(
    campagneId: string,
    enseignantId: string,
  ): Promise<number> {
    return this.repository.count({
      where: { campagneId, enseignantId },
    });
  }

  getRepository(): Repository<Reponse> {
    return this.repository;
  }
}
