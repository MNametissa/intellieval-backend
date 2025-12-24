import { IsString, IsEnum, IsInt, IsBoolean, IsNotEmpty, Min } from 'class-validator';
import { QuestionType } from '../../shared/enums/question-type.enum';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  texte: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @IsInt()
  @Min(1)
  ordre: number;

  @IsBoolean()
  obligatoire: boolean = false;
}
