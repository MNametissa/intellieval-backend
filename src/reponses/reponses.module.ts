import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReponsesService } from './reponses.service';
import { ReponsesController } from './reponses.controller';
import { ReponsesRepository } from './reponses.repository';
import { Reponse } from './entities/reponse.entity';
import { Campagne } from '../campagnes/entities/campagne.entity';
import { Question } from '../questionnaires/entities/question.entity';
import { Matiere } from '../matieres/entities/matiere.entity';
import { User } from '../users/entities/user.entity';
import { Filiere } from '../filieres/entities/filiere.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reponse,
      Campagne,
      Question,
      Matiere,
      User,
      Filiere,
    ]),
  ],
  providers: [
    ReponsesService,
    ReponsesRepository,
  ],
  controllers: [ReponsesController],
})
export class ReponsesModule {}
