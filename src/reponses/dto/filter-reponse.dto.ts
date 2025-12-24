import {
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterReponseDto {
  @IsOptional()
  @IsUUID()
  campagneId?: string;

  @IsOptional()
  @IsUUID()
  questionId?: string;

  @IsOptional()
  @IsUUID()
  filiereId?: string;

  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @IsOptional()
  @IsUUID()
  enseignantId?: string;

  @IsOptional()
  @IsDateString()
  dateMin?: string;

  @IsOptional()
  @IsDateString()
  dateMax?: string;

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
