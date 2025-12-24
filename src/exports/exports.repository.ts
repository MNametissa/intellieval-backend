import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reponse } from '../reponses/entities/reponse.entity';
import { ExportFilterDto } from './dto/export-filter.dto';
import {
  StatistiqueExportDto,
  ReponseExportDto,
} from './dto/export-result.dto';

@Injectable()
export class ExportsRepository {
  constructor(
    @InjectRepository(Reponse)
    private readonly reponseRepository: Repository<Reponse>,
  ) {}

  /**
   * Récupère les statistiques agrégées pour export
   */
  async getStatistiquesForExport(
    filters: ExportFilterDto,
  ): Promise<StatistiqueExportDto[]> {
    const queryBuilder = this.reponseRepository
      .createQueryBuilder('reponse')
      .leftJoinAndSelect('reponse.question', 'question')
      .leftJoinAndSelect('reponse.campagne', 'campagne')
      .leftJoinAndSelect('reponse.matiere', 'matiere')
      .leftJoinAndSelect('reponse.enseignant', 'enseignant')
      .leftJoinAndSelect('reponse.filiere', 'filiere');

    // Apply filters
    if (filters.campagneId) {
      queryBuilder.andWhere('campagne.id = :campagneId', {
        campagneId: filters.campagneId,
      });
    }

    if (filters.matiereId) {
      queryBuilder.andWhere('matiere.id = :matiereId', {
        matiereId: filters.matiereId,
      });
    }

    if (filters.enseignantId) {
      queryBuilder.andWhere('enseignant.id = :enseignantId', {
        enseignantId: filters.enseignantId,
      });
    }

    if (filters.filiereId) {
      queryBuilder.andWhere('filiere.id = :filiereId', {
        filiereId: filters.filiereId,
      });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('department.id = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    if (filters.dateDebut) {
      queryBuilder.andWhere('reponse.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      queryBuilder.andWhere('reponse.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(matiere.titre LIKE :search OR enseignant.name LIKE :search OR filiere.nom LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const reponses = await queryBuilder.getMany();

    // Group by matiere and calculate statistics
    const statsMap = new Map<string, StatistiqueExportDto>();

    for (const reponse of reponses) {
      if (!reponse.matiere) continue; // Skip if no matiere

      const matiereId = reponse.matiere.id;

      if (!statsMap.has(matiereId)) {
        statsMap.set(matiereId, {
          matiereId,
          matiereTitre: reponse.matiere.nom,
          enseignantNom: reponse.enseignant?.name || '',
          filiereNom: reponse.filiere.name,
          departmentNom: reponse.filiere.departmentId || '',
          nombreReponses: 0,
          moyenneGlobale: 0,
          moyennesParQuestion: [],
          commentaires: [],
        });
      }

      const stats = statsMap.get(matiereId)!;
      stats.nombreReponses++;

      // Add comment if exists
      if (reponse.commentaire && filters.includeComments) {
        stats.commentaires?.push(reponse.commentaire);
      }

      // Calculate averages for étoiles questions
      if (reponse.noteEtoiles !== null && reponse.noteEtoiles !== undefined) {
        let questionStat = stats.moyennesParQuestion.find(
          (q) => q.questionId === reponse.question.id,
        );

        if (!questionStat) {
          questionStat = {
            questionId: reponse.question.id,
            questionTexte: reponse.question.texte,
            moyenne: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };
          stats.moyennesParQuestion.push(questionStat);
        }

        // Update distribution
        questionStat.distribution[reponse.noteEtoiles] =
          (questionStat.distribution[reponse.noteEtoiles] || 0) + 1;
      }
    }

    // Calculate final averages
    for (const stats of statsMap.values()) {
      for (const questionStat of stats.moyennesParQuestion) {
        const totalNotes = Object.entries(questionStat.distribution).reduce(
          (sum, [note, count]) => sum + parseInt(note) * count,
          0,
        );
        const totalResponses = Object.values(questionStat.distribution).reduce(
          (sum, count) => sum + count,
          0,
        );
        questionStat.moyenne =
          totalResponses > 0 ? totalNotes / totalResponses : 0;
      }

      // Calculate global average
      if (stats.moyennesParQuestion.length > 0) {
        stats.moyenneGlobale =
          stats.moyennesParQuestion.reduce(
            (sum, q) => sum + q.moyenne,
            0,
          ) / stats.moyennesParQuestion.length;
      }
    }

    return Array.from(statsMap.values());
  }

  /**
   * Récupère les réponses brutes pour export
   */
  async getReponsesForExport(
    filters: ExportFilterDto,
  ): Promise<ReponseExportDto[]> {
    const queryBuilder = this.reponseRepository
      .createQueryBuilder('reponse')
      .leftJoinAndSelect('reponse.question', 'question')
      .leftJoinAndSelect('reponse.campagne', 'campagne')
      .leftJoinAndSelect('reponse.matiere', 'matiere')
      .leftJoinAndSelect('reponse.enseignant', 'enseignant')
      .leftJoinAndSelect('reponse.filiere', 'filiere');

    // Apply same filters as above
    if (filters.campagneId) {
      queryBuilder.andWhere('campagne.id = :campagneId', {
        campagneId: filters.campagneId,
      });
    }

    if (filters.matiereId) {
      queryBuilder.andWhere('matiere.id = :matiereId', {
        matiereId: filters.matiereId,
      });
    }

    if (filters.enseignantId) {
      queryBuilder.andWhere('enseignant.id = :enseignantId', {
        enseignantId: filters.enseignantId,
      });
    }

    if (filters.filiereId) {
      queryBuilder.andWhere('filiere.id = :filiereId', {
        filiereId: filters.filiereId,
      });
    }

    if (filters.dateDebut) {
      queryBuilder.andWhere('reponse.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters.dateFin) {
      queryBuilder.andWhere('reponse.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    // Pagination
    const skip = ((filters.page || 1) - 1) * (filters.limit || 50);
    queryBuilder.skip(skip).take(filters.limit || 50);

    const reponses = await queryBuilder.getMany();

    return reponses.map((reponse) => ({
      campagneTitre: reponse.campagne.titre,
      matiereTitre: reponse.matiere?.nom || '',
      enseignantNom: reponse.enseignant?.name || '',
      filiereNom: reponse.filiere.name,
      questionTexte: reponse.question.texte,
      typeQuestion: reponse.question.type,
      noteEtoiles: reponse.noteEtoiles || undefined,
      commentaire: reponse.commentaire || undefined,
      dateReponse: reponse.createdAt,
    }));
  }
}
