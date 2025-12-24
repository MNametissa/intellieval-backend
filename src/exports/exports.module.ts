import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { ExportsRepository } from './exports.repository';
import { Reponse } from '../reponses/entities/reponse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reponse])],
  controllers: [ExportsController],
  providers: [ExportsService, ExportsRepository],
  exports: [ExportsService],
})
export class ExportsModule {}
