import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateCampagneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  dateDebut: string;

  @IsDateString()
  @IsNotEmpty()
  dateFin: string;

  @IsUUID()
  @IsNotEmpty()
  questionnaireId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(0)
  @IsOptional()
  matiereIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(0)
  @IsOptional()
  enseignantIds?: string[];
}
