import { UserRole, UserStatus } from '../../users/entities/user.entity';

export class AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  filiereId: string | null;
  matricule: string | null;
  status: UserStatus;
}

export class AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}
