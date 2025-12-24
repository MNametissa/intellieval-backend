import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Campagne } from '../../campagnes/entities/campagne.entity';
import { Question } from '../../questionnaires/entities/question.entity';
import { Matiere } from '../../matieres/entities/matiere.entity';
import { User } from '../../users/entities/user.entity';
import { Filiere } from '../../filieres/entities/filiere.entity';

@Entity('reponses')
@Index(['campagneId', 'questionId'])
@Index(['campagneId', 'matiereId'])
@Index(['campagneId', 'enseignantId'])
@Index(['filiereId'])
export class Reponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'campagne_id' })
  campagneId: string;

  @ManyToOne(() => Campagne)
  @JoinColumn({ name: 'campagne_id' })
  campagne: Campagne;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'uuid', name: 'filiere_id' })
  filiereId: string;

  @ManyToOne(() => Filiere)
  @JoinColumn({ name: 'filiere_id' })
  filiere: Filiere;

  @Column({ type: 'uuid', name: 'matiere_id', nullable: true })
  matiereId: string | null;

  @ManyToOne(() => Matiere, { nullable: true })
  @JoinColumn({ name: 'matiere_id' })
  matiere: Matiere | null;

  @Column({ type: 'uuid', name: 'enseignant_id', nullable: true })
  enseignantId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'enseignant_id' })
  enseignant: User | null;

  @Column({ type: 'int', nullable: true })
  noteEtoiles: number | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
