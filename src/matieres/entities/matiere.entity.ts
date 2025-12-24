import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Filiere } from '../../filieres/entities/filiere.entity';
import { User } from '../../users/entities/user.entity';

@Entity('matieres')
@Index(['code'], { unique: true })
export class Matiere {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ type: 'uuid', name: 'filiere_id', nullable: true })
  filiereId: string | null;

  @ManyToOne(() => Filiere, { nullable: true })
  @JoinColumn({ name: 'filiere_id' })
  filiere: Filiere | null;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'matiere_enseignants',
    joinColumn: { name: 'matiere_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'enseignant_id', referencedColumnName: 'id' },
  })
  enseignants: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
