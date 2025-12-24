import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { FilterDepartmentDto } from './dto/filter-department.dto';
import { PaginatedResult } from '../shared/dto/pagination.dto';

@Injectable()
export class DepartmentsRepository {
  constructor(
    @InjectRepository(Department)
    private readonly repository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.repository.create(createDepartmentDto);
    return this.repository.save(department);
  }

  async findAll(
    filterDto: FilterDepartmentDto,
  ): Promise<PaginatedResult<Department>> {
    const { page = 1, limit = 10, search } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('department');

    if (search) {
      queryBuilder.where('department.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy('department.name', 'ASC').skip(skip).take(limit);

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

  async findById(id: string): Promise<Department | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Department | null> {
    return this.repository.findOne({ where: { name } });
  }

  async update(
    id: string,
    updateData: Partial<Department>,
  ): Promise<Department | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
