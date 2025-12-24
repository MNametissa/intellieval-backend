import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Filiere } from './entities/filiere.entity';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { FilterFiliereDto } from './dto/filter-filiere.dto';
import { PaginatedResult } from '../shared/dto/pagination.dto';

@Injectable()
export class FilieresRepository {
  constructor(
    @InjectRepository(Filiere)
    private readonly repository: Repository<Filiere>,
  ) {}

  async create(createFiliereDto: CreateFiliereDto): Promise<Filiere> {
    const filiere = this.repository.create(createFiliereDto);
    return this.repository.save(filiere);
  }

  async findAll(
    filterDto: FilterFiliereDto,
  ): Promise<PaginatedResult<Filiere>> {
    const { page = 1, limit = 10, search, departmentId } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('filiere');

    if (search) {
      queryBuilder.where('filiere.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (departmentId) {
      if (search) {
        queryBuilder.andWhere('filiere.departmentId = :departmentId', {
          departmentId,
        });
      } else {
        queryBuilder.where('filiere.departmentId = :departmentId', {
          departmentId,
        });
      }
    }

    queryBuilder.orderBy('filiere.name', 'ASC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Filiere | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByDepartment(departmentId: string): Promise<Filiere[]> {
    return this.repository.find({
      where: { departmentId },
      order: { name: 'ASC' },
    });
  }

  async findByNameAndDepartment(
    name: string,
    departmentId: string,
  ): Promise<Filiere | null> {
    return this.repository.findOne({
      where: { name, departmentId },
    });
  }

  async update(
    id: string,
    updateData: Partial<Filiere>,
  ): Promise<Filiere | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
