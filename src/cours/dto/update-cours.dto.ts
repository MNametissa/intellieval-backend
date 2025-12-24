import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCoursDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
