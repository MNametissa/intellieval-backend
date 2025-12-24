import { PartialType } from '@nestjs/mapped-types';
import { CreateCampagneDto } from './create-campagne.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CampagneStatut } from '../../shared/enums/campagne-statut.enum';

export class UpdateCampagneDto extends PartialType(CreateCampagneDto) {
  @IsOptional()
  @IsEnum(CampagneStatut)
  statut?: CampagneStatut;
}
