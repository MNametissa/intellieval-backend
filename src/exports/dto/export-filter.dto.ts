import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
}

export enum ExportType {
  REPONSES = 'reponses',
  STATISTIQUES = 'statistiques',
  CAMPAGNES = 'campagnes',
}

export class ExportFilterDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.EXCEL;

  @IsOptional()
  @IsEnum(ExportType)
  type?: ExportType = ExportType.REPONSES;

  // Filtres de période
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  // Filtres hiérarchiques
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  filiereId?: string;

  @IsOptional()
  @IsString()
  matiereId?: string;

  @IsOptional()
  @IsString()
  enseignantId?: string;

  @IsOptional()
  @IsString()
  campagneId?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  // Recherche
  @IsOptional()
  @IsString()
  search?: string;

  // Options d'export
  @IsOptional()
  includeComments?: boolean = true;

  @IsOptional()
  includeCharts?: boolean = true;

  @IsOptional()
  includeRawData?: boolean = false;
}
