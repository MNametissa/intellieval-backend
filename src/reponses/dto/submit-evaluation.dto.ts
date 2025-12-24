import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReponseDto } from './create-reponse.dto';

export class SubmitEvaluationDto {
  @IsUUID()
  @IsNotEmpty()
  campagneId: string;

  @IsUUID()
  @IsNotEmpty()
  filiereId: string;

  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @IsOptional()
  @IsUUID()
  enseignantId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReponseDto)
  @ArrayMinSize(1)
  reponses: CreateReponseDto[];
}
