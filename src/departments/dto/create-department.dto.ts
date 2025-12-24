import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom ne peut pas dépasser 255 caractères' })
  name: string;
}
