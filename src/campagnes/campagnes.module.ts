import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampagnesService } from './campagnes.service';
import { CampagnesController } from './campagnes.controller';
import { CampagnesRepository } from './campagnes.repository';
import { Campagne } from './entities/campagne.entity';
import { Matiere } from '../matieres/entities/matiere.entity';
import { User } from '../users/entities/user.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campagne, Matiere, User, Questionnaire]),
  ],
  providers: [CampagnesService, CampagnesRepository],
  controllers: [CampagnesController],
  exports: [CampagnesService],
})
export class CampagnesModule {}
