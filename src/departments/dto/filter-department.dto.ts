import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

export class FilterDepartmentDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Le terme de recherche doit être une chaîne de caractères' })
  search?: string;
}
