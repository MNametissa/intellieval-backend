import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignEnseignantDto {
  @IsUUID()
  @IsNotEmpty()
  enseignantId: string;
}
