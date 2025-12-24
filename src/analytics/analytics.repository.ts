import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Matiere } from '../matieres/entities/matiere.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';
import { Reponse } from '../reponses/entities/reponse.entity';
import { Department } from '../departments/entities/department.entity';
import { Filiere } from '../filieres/entities/filiere.entity';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import {
  OverviewStatsDto,
  DepartmentStatsDto,
  FiliereStatsDto,
  MatiereStatsDto,
  TrendDataDto,
} from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Reponse)
    private readonly reponseRepository: Repository<Reponse>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Filiere)
    private readonly filiereRepository: Repository<Filiere>,
  ) {}

  async getOverviewStats(filters: AnalyticsFilterDto): Promise<OverviewStatsDto> {
    // Total students
    const totalEtudiants = await this.userRepository.count({
      where: { role: UserRole.ETUDIANT },
    });

    // Total teachers
    const totalEnseignants = await this.userRepository.count({
      where: { role: UserRole.ENSEIGNANT },
    });

    // Total subjects (matieres)
    const totalMatieres = await this.matiereRepository.count();

    // Note: totalCours removed since there's no cours entity in reponses
    const totalCours = 0;

    // Total questionnaires
    const totalQuestionnaires = await this.questionnaireRepository.count();

    // Build reponse query with filters - reponse has direct matiere and filiere relations
    let reponseQuery = this.reponseRepository
      .createQueryBuilder('reponse')
      .innerJoin('reponse.question', 'question')
      .innerJoin('question.questionnaire', 'questionnaire')
      .leftJoin('reponse.matiere', 'matiere')
      .innerJoin('reponse.filiere', 'filiere');

    if (filters.dateDebut) {
      reponseQuery = reponseQuery.andWhere('reponse.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      reponseQuery = reponseQuery.andWhere('reponse.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    if (filters.departmentId) {
      reponseQuery = reponseQuery.andWhere('filiere.departmentId = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    if (filters.filiereId) {
      reponseQuery = reponseQuery.andWhere('filiere.id = :filiereId', {
        filiereId: filters.filiereId,
      });
    }

    if (filters.matiereId) {
      reponseQuery = reponseQuery.andWhere('matiere.id = :matiereId', {
        matiereId: filters.matiereId,
      });
    }

    const totalReponses = await reponseQuery.getCount();

    // Calculate average evaluation (noteEtoiles)
    const avgResult = await reponseQuery
      .select('AVG(CAST(reponse.noteEtoiles AS DECIMAL(10,2)))', 'moyenne')
      .getRawOne();

    const moyenneGlobale = avgResult?.moyenne
      ? parseFloat(parseFloat(avgResult.moyenne).toFixed(2))
      : 0;

    // Calculate participation rate
    const tauxParticipation =
      totalQuestionnaires > 0 && totalEtudiants > 0
        ? parseFloat(
            (
              (totalReponses / (totalQuestionnaires * totalEtudiants)) *
              100
            ).toFixed(2),
          )
        : 0;

    return {
      totalEtudiants,
      totalEnseignants,
      totalMatieres,
      totalCours,
      totalQuestionnaires,
      totalReponses,
      tauxParticipation,
      moyenneGlobale,
    };
  }

  async getDepartmentStats(
    departmentId: string,
    filters: AnalyticsFilterDto,
  ): Promise<DepartmentStatsDto | null> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      return null;
    }

    // Count students in department
    const nombreEtudiants = await this.userRepository.count({
      where: {
        role: UserRole.ETUDIANT,
        departmentId: department.id,
      },
    });

    // Count teachers in department
    const nombreEnseignants = await this.userRepository.count({
      where: {
        role: UserRole.ENSEIGNANT,
        departmentId: department.id,
      },
    });

    // Count filieres in department
    const nombreFilieres = await this.filiereRepository.count({
      where: { departmentId: department.id },
    });

    // Count matieres in department
    const nombreMatieres = await this.matiereRepository.count({
      where: { departmentId: department.id },
    });

    // Get responses for this department
    let reponseQuery = this.reponseRepository
      .createQueryBuilder('reponse')
      .innerJoin('reponse.question', 'question')
      .innerJoin('question.questionnaire', 'questionnaire')
      .innerJoin('reponse.filiere', 'filiere')
      .where('filiere.departmentId = :departmentId', { departmentId });

    if (filters.dateDebut) {
      reponseQuery = reponseQuery.andWhere('reponse.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      reponseQuery = reponseQuery.andWhere('reponse.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    const totalReponses = await reponseQuery.getCount();

    // Calculate average
    const avgResult = await reponseQuery
      .select('AVG(CAST(reponse.noteEtoiles AS DECIMAL(10,2)))', 'moyenne')
      .getRawOne();

    const moyenneEvaluations = avgResult?.moyenne
      ? parseFloat(parseFloat(avgResult.moyenne).toFixed(2))
      : 0;

    // Calculate participation rate
    const totalQuestionnaires = await this.questionnaireRepository.count();
    const tauxParticipation =
      totalQuestionnaires > 0 && nombreEtudiants > 0
        ? parseFloat(
            (
              (totalReponses / (totalQuestionnaires * nombreEtudiants)) *
              100
            ).toFixed(2),
          )
        : 0;

    return {
      departmentId: department.id,
      departmentName: department.name,
      nombreEtudiants,
      nombreEnseignants,
      nombreFilieres,
      nombreMatieres,
      tauxParticipation,
      moyenneEvaluations,
    };
  }

  async getFiliereStatsByDepartment(
    departmentId: string,
    filters: AnalyticsFilterDto,
  ): Promise<{ data: FiliereStatsDto[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.filiereRepository
      .createQueryBuilder('filiere')
      .where('filiere.departmentId = :departmentId', { departmentId });

    if (filters.search) {
      query = query.andWhere('filiere.name LIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    const total = await query.getCount();
    const filieres = await query.skip(offset).take(limit).getMany();

    const data: FiliereStatsDto[] = [];

    for (const filiere of filieres) {
      // Get department name
      const department = await this.departmentRepository.findOne({
        where: { id: filiere.departmentId },
      });

      // Count students in filiere
      const nombreEtudiants = await this.userRepository.count({
        where: {
          role: UserRole.ETUDIANT,
          filiereId: filiere.id,
        },
      });

      // Count matieres in filiere
      const nombreMatieres = await this.matiereRepository.count({
        where: { filiereId: filiere.id },
      });

      // Get responses for this filiere
      let reponseQuery = this.reponseRepository
        .createQueryBuilder('reponse')
        .innerJoin('reponse.question', 'question')
        .innerJoin('question.questionnaire', 'questionnaire')
        .where('reponse.filiereId = :filiereId', { filiereId: filiere.id });

      if (filters.dateDebut) {
        reponseQuery = reponseQuery.andWhere(
          'reponse.createdAt >= :dateDebut',
          { dateDebut: filters.dateDebut },
        );
      }

      if (filters.dateFin) {
        reponseQuery = reponseQuery.andWhere('reponse.createdAt <= :dateFin', {
          dateFin: filters.dateFin,
        });
      }

      const totalReponses = await reponseQuery.getCount();

      // Calculate average
      const avgResult = await reponseQuery
        .select('AVG(CAST(reponse.noteEtoiles AS DECIMAL(10,2)))', 'moyenne')
        .getRawOne();

      const moyenneEvaluations = avgResult?.moyenne
        ? parseFloat(parseFloat(avgResult.moyenne).toFixed(2))
        : 0;

      // Calculate participation rate
      const totalQuestionnaires = await this.questionnaireRepository.count();
      const tauxParticipation =
        totalQuestionnaires > 0 && nombreEtudiants > 0
          ? parseFloat(
              (
                (totalReponses / (totalQuestionnaires * nombreEtudiants)) *
                100
              ).toFixed(2),
            )
          : 0;

      data.push({
        filiereId: filiere.id,
        filiereName: filiere.name,
        departmentName: department?.name || '',
        nombreEtudiants,
        nombreMatieres,
        tauxParticipation,
        moyenneEvaluations,
      });
    }

    return { data, total };
  }

  async getFiliereStats(
    filiereId: string,
    filters: AnalyticsFilterDto,
  ): Promise<FiliereStatsDto | null> {
    const filiere = await this.filiereRepository.findOne({
      where: { id: filiereId },
    });

    if (!filiere) {
      return null;
    }

    // Get department
    const department = await this.departmentRepository.findOne({
      where: { id: filiere.departmentId },
    });

    // Count students in filiere
    const nombreEtudiants = await this.userRepository.count({
      where: {
        role: UserRole.ETUDIANT,
        filiereId: filiere.id,
      },
    });

    // Count matieres in filiere
    const nombreMatieres = await this.matiereRepository.count({
      where: { filiereId: filiere.id },
    });

    // Get responses for this filiere
    let reponseQuery = this.reponseRepository
      .createQueryBuilder('reponse')
      .innerJoin('reponse.question', 'question')
      .innerJoin('question.questionnaire', 'questionnaire')
      .where('reponse.filiereId = :filiereId', { filiereId });

    if (filters.dateDebut) {
      reponseQuery = reponseQuery.andWhere('reponse.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      reponseQuery = reponseQuery.andWhere('reponse.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    const totalReponses = await reponseQuery.getCount();

    // Calculate average
    const avgResult = await reponseQuery
      .select('AVG(CAST(reponse.noteEtoiles AS DECIMAL(10,2)))', 'moyenne')
      .getRawOne();

    const moyenneEvaluations = avgResult?.moyenne
      ? parseFloat(parseFloat(avgResult.moyenne).toFixed(2))
      : 0;

    // Calculate participation rate
    const totalQuestionnaires = await this.questionnaireRepository.count();
    const tauxParticipation =
      totalQuestionnaires > 0 && nombreEtudiants > 0
        ? parseFloat(
            (
              (totalReponses / (totalQuestionnaires * nombreEtudiants)) *
              100
            ).toFixed(2),
          )
        : 0;

    return {
      filiereId: filiere.id,
      filiereName: filiere.name,
      departmentName: department?.name || '',
      nombreEtudiants,
      nombreMatieres,
      tauxParticipation,
      moyenneEvaluations,
    };
  }

  async getMatiereStatsByFiliere(
    filiereId: string,
    filters: AnalyticsFilterDto,
  ): Promise<{ data: MatiereStatsDto[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.matiereRepository
      .createQueryBuilder('matiere')
      .leftJoinAndSelect('matiere.enseignants', 'enseignant')
      .leftJoinAndSelect('matiere.filiere', 'filiere')
      .where('matiere.filiereId = :filiereId', { filiereId });

    if (filters.search) {
      query = query.andWhere(
        '(matiere.nom LIKE :search OR matiere.code LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const total = await query.getCount();
    const matieres = await query.skip(offset).take(limit).getMany();

    const data: MatiereStatsDto[] = [];

    for (const matiere of matieres) {
      // Get first enseignant name
      const enseignantName =
        matiere.enseignants && matiere.enseignants.length > 0
          ? matiere.enseignants[0].name
          : 'Non assigné';

      // Count students in filiere (matiere's filiere)
      const nombreEtudiants = matiere.filiereId
        ? await this.userRepository.count({
            where: {
              role: UserRole.ETUDIANT,
              filiereId: matiere.filiereId,
            },
          })
        : 0;

      // Get responses for this matiere
      let reponseQuery = this.reponseRepository
        .createQueryBuilder('reponse')
        .innerJoin('reponse.question', 'question')
        .innerJoin('question.questionnaire', 'questionnaire')
        .where('reponse.matiereId = :matiereId', { matiereId: matiere.id });

      if (filters.dateDebut) {
        reponseQuery = reponseQuery.andWhere(
          'reponse.createdAt >= :dateDebut',
          { dateDebut: filters.dateDebut },
        );
      }

      if (filters.dateFin) {
        reponseQuery = reponseQuery.andWhere('reponse.createdAt <= :dateFin', {
          dateFin: filters.dateFin,
        });
      }

      const nombreReponses = await reponseQuery.getCount();

      // Calculate average
      const avgResult = await reponseQuery
        .select('AVG(CAST(reponse.noteEtoiles AS DECIMAL(10,2)))', 'moyenne')
        .getRawOne();

      const moyenneEvaluation = avgResult?.moyenne
        ? parseFloat(parseFloat(avgResult.moyenne).toFixed(2))
        : 0;

      // Calculate participation rate
      const totalQuestionnaires = await this.questionnaireRepository.count();
      const tauxParticipation =
        totalQuestionnaires > 0 && nombreEtudiants > 0
          ? parseFloat(
              (
                (nombreReponses / (totalQuestionnaires * nombreEtudiants)) *
                100
              ).toFixed(2),
            )
          : 0;

      data.push({
        matiereId: matiere.id,
        matiereNom: matiere.nom,
        enseignantName,
        filiereName: matiere.filiere?.name || '',
        nombreEtudiants,
        nombreReponses,
        tauxParticipation,
        moyenneEvaluation,
      });
    }

    return { data, total };
  }

  async getTrends(
    filters: AnalyticsFilterDto,
  ): Promise<{ data: TrendDataDto[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Build query with date grouping
    let query = this.reponseRepository
      .createQueryBuilder('reponse')
      .innerJoin('reponse.question', 'question')
      .innerJoin('question.questionnaire', 'questionnaire')
      .leftJoin('reponse.matiere', 'matiere')
      .innerJoin('reponse.filiere', 'filiere')
      .select('DATE_FORMAT(reponse.createdAt, "%Y-%m")', 'period')
      .addSelect('COUNT(reponse.id)', 'nombreReponses')
      .addSelect(
        'AVG(CAST(reponse.noteEtoiles AS DECIMAL(10,2)))',
        'moyenneEvaluation',
      )
      .groupBy('period')
      .orderBy('period', 'DESC');

    if (filters.dateDebut) {
      query = query.andWhere('reponse.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      query = query.andWhere('reponse.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    if (filters.departmentId) {
      query = query.andWhere('filiere.departmentId = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    if (filters.filiereId) {
      query = query.andWhere('filiere.id = :filiereId', {
        filiereId: filters.filiereId,
      });
    }

    if (filters.matiereId) {
      query = query.andWhere('matiere.id = :matiereId', {
        matiereId: filters.matiereId,
      });
    }

    const results = await query.getRawMany();
    const total = results.length;

    // Get total students for participation rate calculation
    const totalEtudiants = await this.userRepository.count({
      where: { role: UserRole.ETUDIANT },
    });

    const totalQuestionnaires = await this.questionnaireRepository.count();

    const data: TrendDataDto[] = results.slice(offset, offset + limit).map((row) => {
      const nombreReponses = parseInt(row.nombreReponses);
      const moyenneEvaluation = row.moyenneEvaluation
        ? parseFloat(parseFloat(row.moyenneEvaluation).toFixed(2))
        : 0;

      const tauxParticipation =
        totalQuestionnaires > 0 && totalEtudiants > 0
          ? parseFloat(
              (
                (nombreReponses / (totalQuestionnaires * totalEtudiants)) *
                100
              ).toFixed(2),
            )
          : 0;

      return {
        period: row.period,
        nombreReponses,
        tauxParticipation,
        moyenneEvaluation,
      };
    });

    return { data, total };
  }
}
