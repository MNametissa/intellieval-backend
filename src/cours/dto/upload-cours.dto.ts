import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UploadCoursDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  matiereId: string;
}
