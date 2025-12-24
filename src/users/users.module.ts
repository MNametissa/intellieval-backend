import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { Filiere } from '../filieres/entities/filiere.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersImportService } from './users-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department, Filiere])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersImportService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
