import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CampagneStatut } from '../../shared/enums/campagne-statut.enum';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';
import { Matiere } from '../../matieres/entities/matiere.entity';
import { User } from '../../users/entities/user.entity';

@Entity('campagnes')
export class Campagne {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp', name: 'date_debut' })
  dateDebut: Date;

  @Column({ type: 'timestamp', name: 'date_fin' })
  dateFin: Date;

  @Column({
    type: 'enum',
    enum: CampagneStatut,
    default: CampagneStatut.INACTIVE,
  })
  statut: CampagneStatut;

  @Column({ type: 'uuid', name: 'questionnaire_id' })
  questionnaireId: string;

  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;

  @ManyToMany(() => Matiere)
  @JoinTable({
    name: 'campagne_matieres',
    joinColumn: {
      name: 'campagne_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'matiere_id',
      referencedColumnName: 'id',
    },
  })
  matieres: Matiere[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'campagne_enseignants',
    joinColumn: {
      name: 'campagne_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'enseignant_id',
      referencedColumnName: 'id',
    },
  })
  enseignants: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
