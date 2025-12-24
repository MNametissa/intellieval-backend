import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '../../shared/enums/user-role.enum';
import { UserStatus } from '../../shared/enums/user-status.enum';

// Re-export for backwards compatibility
export { UserRole, UserStatus };

@Entity('users')
@Index(['email'], { unique: true })
@Index(['matricule'], { unique: true, where: 'matricule IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string;

  @Column({ type: 'uuid', name: 'filiere_id', nullable: true })
  filiereId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  matricule: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
