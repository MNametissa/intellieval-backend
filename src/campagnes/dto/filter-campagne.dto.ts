import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampagneStatut } from '../../shared/enums/campagne-statut.enum';

export class FilterCampagneDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CampagneStatut)
  statut?: CampagneStatut;

  @IsOptional()
  @IsUUID()
  questionnaireId?: string;

  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @IsOptional()
  @IsUUID()
  enseignantId?: string;

  @IsOptional()
  @IsDateString()
  dateDebutMin?: string;

  @IsOptional()
  @IsDateString()
  dateDebutMax?: string;

  @IsOptional()
  @IsDateString()
  dateFinMin?: string;

  @IsOptional()
  @IsDateString()
  dateFinMax?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
