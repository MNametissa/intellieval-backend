import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

export class FilterFiliereDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Le terme de recherche doit être une chaîne de caractères' })
  search?: string;

  @IsOptional()
  @IsUUID('4', { message: "L'ID du département doit être un UUID valide" })
  departmentId?: string;
}
