import { IsOptional, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterCoursDto {
  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @IsOptional()
  @IsUUID()
  filiereId?: string;

  @IsOptional()
  @IsUUID()
  enseignantId?: string;

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
  limit?: number = 10;
}
