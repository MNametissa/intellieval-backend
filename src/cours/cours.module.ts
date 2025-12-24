import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CoursService } from './cours.service';
import { CoursController } from './cours.controller';
import { CoursRepository } from './cours.repository';
import { Cours } from './entities/cours.entity';
import { Matiere } from '../matieres/entities/matiere.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cours, Matiere]),
    MulterModule.register({
      dest: './uploads/cours',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
      },
    }),
  ],
  controllers: [CoursController],
  providers: [CoursService, CoursRepository],
  exports: [CoursService],
})
export class CoursModule {}
