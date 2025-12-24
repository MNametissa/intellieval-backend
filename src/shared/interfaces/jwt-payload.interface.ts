import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  filiereId: string | null;
}
