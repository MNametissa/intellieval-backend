import { IsString, IsNotEmpty, MaxLength, MinLength, IsUUID } from 'class-validator';

export class CreateFiliereDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom ne peut pas dépasser 255 caractères' })
  name: string;

  @IsUUID('4', { message: "L'ID du département doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID du département est requis" })
  departmentId: string;
}
