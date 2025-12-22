import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId: string;
  filiereId: string | null;
  iat?: number;
  exp?: number;
}
