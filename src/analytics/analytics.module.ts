import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { User } from '../users/entities/user.entity';
import { Matiere } from '../matieres/entities/matiere.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';
import { Reponse } from '../reponses/entities/reponse.entity';
import { Department } from '../departments/entities/department.entity';
import { Filiere } from '../filieres/entities/filiere.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Matiere,
      Questionnaire,
      Reponse,
      Department,
      Filiere,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}
