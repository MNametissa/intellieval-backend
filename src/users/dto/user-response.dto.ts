import { UserRole, UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  filiereId: string | null;
  matricule: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
