import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);
    return this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'name',
        'password',
        'role',
        'departmentId',
        'filiereId',
        'matricule',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByMatricule(matricule: string): Promise<User | null> {
    return this.repository.findOne({ where: { matricule } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.repository.find({ where: { role } });
  }

  async findByDepartment(departmentId: string): Promise<User[]> {
    return this.repository.find({ where: { departmentId } });
  }

  async findByFiliere(filiereId: string): Promise<User[]> {
    return this.repository.find({ where: { filiereId } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.repository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async matriculeExists(matricule: string): Promise<boolean> {
    const count = await this.repository.count({ where: { matricule } });
    return count > 0;
  }

  async bulkCreate(users: CreateUserDto[]): Promise<User[]> {
    const userEntities = this.repository.create(users);
    return this.repository.save(userEntities);
  }
}
