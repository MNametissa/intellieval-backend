import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatieresService } from './matieres.service';
import { MatieresController } from './matieres.controller';
import { Matiere } from './entities/matiere.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Matiere, User])],
  providers: [MatieresService],
  controllers: [MatieresController],
  exports: [MatieresService],
})
export class MatieresModule {}
