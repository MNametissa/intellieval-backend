import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateReponseDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ValidateIf((o) => o.commentaire === null || o.commentaire === undefined)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  noteEtoiles?: number;

  @ValidateIf((o) => o.noteEtoiles === null || o.noteEtoiles === undefined)
  @IsString()
  @IsOptional()
  commentaire?: string;
}
