import { IsOptional, IsDateString, IsUUID, IsInt, Min, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsFilterDto {
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

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
  @IsUUID()
  campagneId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeCharts?: boolean = false;

  @IsOptional()
  @IsEnum(['pie', 'bar', 'line', 'all'])
  chartType?: 'pie' | 'bar' | 'line' | 'all' = 'all';
}
