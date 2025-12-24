import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Filiere } from './entities/filiere.entity';
import { FilieresController } from './filieres.controller';
import { FilieresService } from './filieres.service';
import { FilieresRepository } from './filieres.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Filiere])],
  controllers: [FilieresController],
  providers: [FilieresService, FilieresRepository],
  exports: [FilieresService, FilieresRepository],
})
export class FilieresModule {}
