import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reponse } from './entities/reponse.entity';
import { ReponsesRepository } from './reponses.repository';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { FilterReponseDto } from './dto/filter-reponse.dto';
import { Campagne } from '../campagnes/entities/campagne.entity';
import { Question } from '../questionnaires/entities/question.entity';
import { Matiere } from '../matieres/entities/matiere.entity';
import { User } from '../users/entities/user.entity';
import { Filiere } from '../filieres/entities/filiere.entity';
import { CampagneStatut } from '../shared/enums/campagne-statut.enum';
import { QuestionType } from '../shared/enums/question-type.enum';
import {
  ReponseSubmittedEvent,
  CampagneCompletedByStudentEvent,
} from '../shared/events/reponse.events';

@Injectable()
export class ReponsesService {
  constructor(
    private readonly repository: ReponsesRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Campagne)
    private readonly campagneRepository: Repository<Campagne>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Filiere)
    private readonly filiereRepository: Repository<Filiere>,
  ) {}

  async submitEvaluation(
    submitDto: SubmitEvaluationDto,
  ): Promise<{ success: boolean; message: string }> {
    const {
      campagneId,
      filiereId,
      matiereId,
      enseignantId,
      reponses,
    } = submitDto;

    // Validate campagne exists and is active
    const campagne = await this.campagneRepository.findOne({
      where: { id: campagneId },
      relations: ['questionnaire', 'questionnaire.questions', 'matieres', 'enseignants'],
    });

    if (!campagne) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campagne.statut !== CampagneStatut.ACTIVE) {
      throw new BadRequestException(
        'Cette campagne n\'est pas active actuellement',
      );
    }

    // Validate filiere exists
    const filiere = await this.filiereRepository.findOne({
      where: { id: filiereId },
    });

    if (!filiere) {
      throw new NotFoundException('Filière non trouvée');
    }

    // Validate targeting: must provide either matiereId OR enseignantId
    if ((!matiereId && !enseignantId) || (matiereId && enseignantId)) {
      throw new BadRequestException(
        'Vous devez évaluer soit une matière, soit un enseignant',
      );
    }

    // If matiere evaluation
    if (matiereId) {
      const matiere = await this.matiereRepository.findOne({
        where: { id: matiereId },
        relations: ['filiere'],
      });

      if (!matiere) {
        throw new NotFoundException('Matière non trouvée');
      }

      // Verify matiere is in campaign
      const isMatiereInCampagne = campagne.matieres.some(
        (m) => m.id === matiereId,
      );
      if (!isMatiereInCampagne) {
        throw new ForbiddenException(
          'Cette matière ne fait pas partie de la campagne',
        );
      }

      // Verify student's filiere matches matiere's filiere
      if (matiere.filiereId !== filiereId) {
        throw new ForbiddenException(
          'Vous ne pouvez évaluer que les matières de votre filière',
        );
      }
    }

    // If enseignant evaluation
    if (enseignantId) {
      const enseignant = await this.userRepository.findOne({
        where: { id: enseignantId },
      });

      if (!enseignant) {
        throw new NotFoundException('Enseignant non trouvé');
      }

      // Verify enseignant is in campaign
      const isEnseignantInCampagne = campagne.enseignants.some(
        (e) => e.id === enseignantId,
      );
      if (!isEnseignantInCampagne) {
        throw new ForbiddenException(
          'Cet enseignant ne fait pas partie de la campagne',
        );
      }
    }

    // Validate all questions exist and belong to the questionnaire
    const questionIds = reponses.map((r) => r.questionId);
    const questions = await this.questionRepository.find({
      where: { questionnaireId: campagne.questionnaireId },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Validate each reponse
    for (const reponseDto of reponses) {
      const question = questionMap.get(reponseDto.questionId);

      if (!question) {
        throw new BadRequestException(
          `Question ${reponseDto.questionId} non trouvée dans ce questionnaire`,
        );
      }

      // Validate response type matches question type
      if (question.type === QuestionType.ETOILES) {
        if (
          reponseDto.noteEtoiles === null ||
          reponseDto.noteEtoiles === undefined
        ) {
          throw new BadRequestException(
            `La question "${question.texte}" nécessite une note en étoiles`,
          );
        }
      } else if (question.type === QuestionType.COMMENTAIRE) {
        if (!reponseDto.commentaire) {
          throw new BadRequestException(
            `La question "${question.texte}" nécessite un commentaire`,
          );
        }
      }

      // Check if obligatoire
      if (question.obligatoire) {
        if (
          question.type === QuestionType.ETOILES &&
          !reponseDto.noteEtoiles
        ) {
          throw new BadRequestException(
            `La question "${question.texte}" est obligatoire`,
          );
        }
        if (
          question.type === QuestionType.COMMENTAIRE &&
          !reponseDto.commentaire
        ) {
          throw new BadRequestException(
            `La question "${question.texte}" est obligatoire`,
          );
        }
      }
    }

    // Save all reponses (anonymous - no user tracking!)
    const savedReponses: Reponse[] = [];

    for (const reponseDto of reponses) {
      const reponse = await this.repository.create({
        campagneId,
        questionId: reponseDto.questionId,
        filiereId,
        matiereId: matiereId || null,
        enseignantId: enseignantId || null,
        noteEtoiles: reponseDto.noteEtoiles || null,
        commentaire: reponseDto.commentaire || null,
      });

      savedReponses.push(reponse);

      // Emit event for each response
      this.eventEmitter.emit(
        'reponse.submitted',
        new ReponseSubmittedEvent(
          reponse.id,
          campagneId,
          reponse.questionId,
          filiereId,
          matiereId || null,
          enseignantId || null,
          reponse.createdAt,
        ),
      );
    }

    // Emit campagne completion event
    this.eventEmitter.emit(
      'campagne.completed.by.student',
      new CampagneCompletedByStudentEvent(
        campagneId,
        filiereId,
        new Date(),
      ),
    );

    return {
      success: true,
      message: 'Évaluation soumise avec succès. Merci pour votre participation!',
    };
  }

  async findAll(filterDto: FilterReponseDto): Promise<{
    data: Reponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      campagneId,
      questionId,
      filiereId,
      matiereId,
      enseignantId,
      dateMin,
      dateMax,
      page = 1,
      limit = 10,
    } = filterDto;

    const queryBuilder = this.repository
      .getRepository()
      .createQueryBuilder('reponse')
      .leftJoinAndSelect('reponse.campagne', 'campagne')
      .leftJoinAndSelect('reponse.question', 'question')
      .leftJoinAndSelect('reponse.filiere', 'filiere')
      .leftJoinAndSelect('reponse.matiere', 'matiere')
      .leftJoinAndSelect('reponse.enseignant', 'enseignant');

    if (campagneId) {
      queryBuilder.andWhere('reponse.campagneId = :campagneId', {
        campagneId,
      });
    }

    if (questionId) {
      queryBuilder.andWhere('reponse.questionId = :questionId', {
        questionId,
      });
    }

    if (filiereId) {
      queryBuilder.andWhere('reponse.filiereId = :filiereId', { filiereId });
    }

    if (matiereId) {
      queryBuilder.andWhere('reponse.matiereId = :matiereId', { matiereId });
    }

    if (enseignantId) {
      queryBuilder.andWhere('reponse.enseignantId = :enseignantId', {
        enseignantId,
      });
    }

    if (dateMin) {
      queryBuilder.andWhere('reponse.createdAt >= :dateMin', {
        dateMin: new Date(dateMin),
      });
    }

    if (dateMax) {
      queryBuilder.andWhere('reponse.createdAt <= :dateMax', {
        dateMax: new Date(dateMax),
      });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('reponse.createdAt', 'DESC')
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStatisticsByMatiere(matiereId: string): Promise<any> {
    const reponses = await this.repository
      .getRepository()
      .createQueryBuilder('reponse')
      .leftJoinAndSelect('reponse.question', 'question')
      .where('reponse.matiereId = :matiereId', { matiereId })
      .andWhere('reponse.noteEtoiles IS NOT NULL')
      .getMany();

    if (reponses.length === 0) {
      return {
        matiereId,
        totalReponses: 0,
        moyenneGlobale: null,
        statistiquesParQuestion: [],
      };
    }

    // Calculate average by question
    const questionStats = new Map<string, {
      questionId: string;
      questionTexte: string;
      notes: number[];
      moyenne: number;
      count: number;
    }>();

    reponses.forEach((reponse) => {
      if (reponse.noteEtoiles) {
        const key = reponse.questionId;
        if (!questionStats.has(key)) {
          questionStats.set(key, {
            questionId: reponse.questionId,
            questionTexte: reponse.question.texte,
            notes: [],
            moyenne: 0,
            count: 0,
          });
        }
        const stats = questionStats.get(key)!;
        stats.notes.push(reponse.noteEtoiles);
        stats.count++;
      }
    });

    // Calculate averages
    const statistiquesParQuestion = Array.from(questionStats.values()).map(
      (stat) => ({
        questionId: stat.questionId,
        questionTexte: stat.questionTexte,
        moyenne: stat.notes.reduce((a, b) => a + b, 0) / stat.notes.length,
        count: stat.count,
        distribution: {
          '1': stat.notes.filter((n) => n === 1).length,
          '2': stat.notes.filter((n) => n === 2).length,
          '3': stat.notes.filter((n) => n === 3).length,
          '4': stat.notes.filter((n) => n === 4).length,
          '5': stat.notes.filter((n) => n === 5).length,
        },
      }),
    );

    const moyenneGlobale =
      statistiquesParQuestion.reduce((sum, q) => sum + q.moyenne, 0) /
      statistiquesParQuestion.length;

    return {
      matiereId,
      totalReponses: reponses.length,
      moyenneGlobale: parseFloat(moyenneGlobale.toFixed(2)),
      statistiquesParQuestion,
    };
  }

  async getStatisticsByEnseignant(enseignantId: string): Promise<any> {
    const reponses = await this.repository
      .getRepository()
      .createQueryBuilder('reponse')
      .leftJoinAndSelect('reponse.question', 'question')
      .where('reponse.enseignantId = :enseignantId', { enseignantId })
      .andWhere('reponse.noteEtoiles IS NOT NULL')
      .getMany();

    if (reponses.length === 0) {
      return {
        enseignantId,
        totalReponses: 0,
        moyenneGlobale: null,
        statistiquesParQuestion: [],
      };
    }

    // Same logic as matiere
    const questionStats = new Map<string, {
      questionId: string;
      questionTexte: string;
      notes: number[];
      moyenne: number;
      count: number;
    }>();

    reponses.forEach((reponse) => {
      if (reponse.noteEtoiles) {
        const key = reponse.questionId;
        if (!questionStats.has(key)) {
          questionStats.set(key, {
            questionId: reponse.questionId,
            questionTexte: reponse.question.texte,
            notes: [],
            moyenne: 0,
            count: 0,
          });
        }
        const stats = questionStats.get(key)!;
        stats.notes.push(reponse.noteEtoiles);
        stats.count++;
      }
    });

    const statistiquesParQuestion = Array.from(questionStats.values()).map(
      (stat) => ({
        questionId: stat.questionId,
        questionTexte: stat.questionTexte,
        moyenne: stat.notes.reduce((a, b) => a + b, 0) / stat.notes.length,
        count: stat.count,
        distribution: {
          '1': stat.notes.filter((n) => n === 1).length,
          '2': stat.notes.filter((n) => n === 2).length,
          '3': stat.notes.filter((n) => n === 3).length,
          '4': stat.notes.filter((n) => n === 4).length,
          '5': stat.notes.filter((n) => n === 5).length,
        },
      }),
    );

    const moyenneGlobale =
      statistiquesParQuestion.reduce((sum, q) => sum + q.moyenne, 0) /
      statistiquesParQuestion.length;

    return {
      enseignantId,
      totalReponses: reponses.length,
      moyenneGlobale: parseFloat(moyenneGlobale.toFixed(2)),
      statistiquesParQuestion,
    };
  }

  async getCommentairesByMatiere(matiereId: string): Promise<string[]> {
    const reponses = await this.repository
      .getRepository()
      .createQueryBuilder('reponse')
      .where('reponse.matiereId = :matiereId', { matiereId })
      .andWhere('reponse.commentaire IS NOT NULL')
      .andWhere('reponse.commentaire != :empty', { empty: '' })
      .getMany();

    return reponses
      .map((r) => r.commentaire)
      .filter((c): c is string => c !== null);
  }

  async getCommentairesByEnseignant(enseignantId: string): Promise<string[]> {
    const reponses = await this.repository
      .getRepository()
      .createQueryBuilder('reponse')
      .where('reponse.enseignantId = :enseignantId', { enseignantId })
      .andWhere('reponse.commentaire IS NOT NULL')
      .andWhere('reponse.commentaire != :empty', { empty: '' })
      .getMany();

    return reponses
      .map((r) => r.commentaire)
      .filter((c): c is string => c !== null);
  }
}
