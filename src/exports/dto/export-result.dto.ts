export class ExportResultDto {
  success: boolean;
  filename: string;
  fileSize: number;
  format: string;
  generatedAt: Date;
  recordsCount: number;
  filters: Record<string, any>;
}

export class ChartDataDto {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
  type: 'pie' | 'bar' | 'line';
}

export class StatistiqueExportDto {
  matiereId: string;
  matiereTitre: string;
  enseignantNom: string;
  filiereNom: string;
  departmentNom: string;
  nombreReponses: number;
  moyenneGlobale: number;
  moyennesParQuestion: {
    questionId: string;
    questionTexte: string;
    moyenne: number;
    distribution: Record<number, number>;
  }[];
  commentaires?: string[];
  tauxParticipation?: number;
}

export class ReponseExportDto {
  campagneTitre: string;
  matiereTitre: string;
  enseignantNom: string;
  filiereNom: string;
  questionTexte: string;
  typeQuestion: string;
  noteEtoiles?: number;
  commentaire?: string;
  dateReponse: Date;
}
