import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Matiere } from '../../matieres/entities/matiere.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cours')
@Index(['matiereId'])
@Index(['enseignantId'])
@Index(['titre'])
export class Cours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  @Column({ type: 'varchar', length: 100, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 50, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Column({ type: 'uuid', name: 'matiere_id' })
  matiereId: string;

  @ManyToOne(() => Matiere)
  @JoinColumn({ name: 'matiere_id' })
  matiere: Matiere;

  @Column({ type: 'uuid', name: 'enseignant_id' })
  enseignantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'enseignant_id' })
  enseignant: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
