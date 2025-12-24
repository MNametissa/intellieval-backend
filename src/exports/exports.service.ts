import { Injectable } from '@nestjs/common';
import { ExportsRepository } from './exports.repository';
import {
  ExportFilterDto,
  ExportFormat,
  ExportType,
} from './dto/export-filter.dto';
import { ExportResultDto, ChartDataDto } from './dto/export-result.dto';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportsService {
  private readonly exportsDir = path.join(process.cwd(), 'exports');

  constructor(private readonly repository: ExportsRepository) {
    // Ensure exports directory exists
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  /**
   * Export principal - route vers le bon format
   */
  async export(filters: ExportFilterDto): Promise<ExportResultDto> {
    switch (filters.format) {
      case ExportFormat.EXCEL:
        return this.exportExcel(filters);
      case ExportFormat.CSV:
        return this.exportCSV(filters);
      case ExportFormat.PDF:
        return this.exportPDF(filters);
      default:
        return this.exportExcel(filters);
    }
  }

  /**
   * Export Excel avec graphiques
   */
  private async exportExcel(
    filters: ExportFilterDto,
  ): Promise<ExportResultDto> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IntelliEval Platform';
    workbook.created = new Date();

    // Get data based on export type
    if (filters.type === ExportType.STATISTIQUES) {
      const stats = await this.repository.getStatistiquesForExport(filters);
      await this.addStatistiquesSheet(workbook, stats, filters);

      if (filters.includeCharts) {
        await this.addChartsSheet(workbook, stats);
      }
    } else if (filters.type === ExportType.REPONSES) {
      const reponses = await this.repository.getReponsesForExport(filters);
      await this.addReponsesSheet(workbook, reponses);
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `export-${filters.type}-${timestamp}.xlsx`;
    const filepath = path.join(this.exportsDir, filename);

    // Write file
    await workbook.xlsx.writeFile(filepath);

    const stats = fs.statSync(filepath);

    return {
      success: true,
      filename,
      fileSize: stats.size,
      format: ExportFormat.EXCEL,
      generatedAt: new Date(),
      recordsCount: workbook.worksheets[0]?.rowCount || 0,
      filters: filters,
    };
  }

  /**
   * Ajout feuille statistiques avec formatage
   */
  private async addStatistiquesSheet(
    workbook: ExcelJS.Workbook,
    stats: any[],
    filters: ExportFilterDto,
  ): Promise<void> {
    const sheet = workbook.addWorksheet('Statistiques');

    // Header styling
    sheet.columns = [
      { header: 'Matière', key: 'matiere', width: 30 },
      { header: 'Enseignant', key: 'enseignant', width: 25 },
      { header: 'Filière', key: 'filiere', width: 25 },
      { header: 'Département', key: 'department', width: 25 },
      { header: 'Nb Réponses', key: 'nbReponses', width: 15 },
      { header: 'Moyenne Globale', key: 'moyenneGlobale', width: 18 },
      { header: 'Taux Participation', key: 'tauxParticipation', width: 20 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true, size: 12 };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    stats.forEach((stat) => {
      sheet.addRow({
        matiere: stat.matiereTitre,
        enseignant: stat.enseignantNom,
        filiere: stat.filiereNom,
        department: stat.departmentNom,
        nbReponses: stat.nombreReponses,
        moyenneGlobale: stat.moyenneGlobale.toFixed(2),
        tauxParticipation: stat.tauxParticipation
          ? `${stat.tauxParticipation.toFixed(1)}%`
          : 'N/A',
      });
    });

    // Add detail sheet for each matiere
    for (const stat of stats) {
      await this.addMatiereDetailSheet(workbook, stat, filters);
    }
  }

  /**
   * Feuille détaillée par matière avec questions
   */
  private async addMatiereDetailSheet(
    workbook: ExcelJS.Workbook,
    stat: any,
    filters: ExportFilterDto,
  ): Promise<void> {
    const sheetName = stat.matiereTitre.substring(0, 30); // Excel limit
    const sheet = workbook.addWorksheet(sheetName);

    // Title
    sheet.mergeCells('A1:E1');
    sheet.getCell('A1').value = `Détails - ${stat.matiereTitre}`;
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Info section
    sheet.addRow([]);
    sheet.addRow(['Enseignant:', stat.enseignantNom]);
    sheet.addRow(['Filière:', stat.filiereNom]);
    sheet.addRow(['Département:', stat.departmentNom]);
    sheet.addRow(['Nombre de réponses:', stat.nombreReponses]);
    sheet.addRow(['Moyenne globale:', stat.moyenneGlobale.toFixed(2) + ' / 5']);
    sheet.addRow([]);

    // Questions details
    sheet.addRow(['Question', 'Moyenne', '5★', '4★', '3★', '2★', '1★']);
    sheet.getRow(sheet.lastRow?.number || 1).font = { bold: true };

    stat.moyennesParQuestion.forEach((q: any) => {
      sheet.addRow([
        q.questionTexte,
        q.moyenne.toFixed(2),
        q.distribution[5] || 0,
        q.distribution[4] || 0,
        q.distribution[3] || 0,
        q.distribution[2] || 0,
        q.distribution[1] || 0,
      ]);
    });

    // Comments section
    if (filters.includeComments && stat.commentaires?.length > 0) {
      sheet.addRow([]);
      sheet.addRow(['Commentaires']);
      sheet.getRow(sheet.lastRow?.number || 1).font = { bold: true, size: 12 };

      stat.commentaires.forEach((comment: string) => {
        sheet.addRow([comment]);
      });
    }
  }

  /**
   * Feuille avec données pour charts
   */
  private async addChartsSheet(
    workbook: ExcelJS.Workbook,
    stats: any[],
  ): Promise<void> {
    const sheet = workbook.addWorksheet('Données Graphiques');

    // Distribution globale
    sheet.addRow(['Distribution des notes globales']);
    sheet.addRow(['Matière', '5★', '4★', '3★', '2★', '1★']);

    stats.forEach((stat) => {
      const globalDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      stat.moyennesParQuestion.forEach((q: any) => {
        for (let i = 1; i <= 5; i++) {
          globalDist[i] += q.distribution[i] || 0;
        }
      });

      sheet.addRow([
        stat.matiereTitre,
        globalDist[5],
        globalDist[4],
        globalDist[3],
        globalDist[2],
        globalDist[1],
      ]);
    });
  }

  /**
   * Ajout feuille réponses brutes
   */
  private async addReponsesSheet(
    workbook: ExcelJS.Workbook,
    reponses: any[],
  ): Promise<void> {
    const sheet = workbook.addWorksheet('Réponses');

    sheet.columns = [
      { header: 'Campagne', key: 'campagne', width: 30 },
      { header: 'Matière', key: 'matiere', width: 30 },
      { header: 'Enseignant', key: 'enseignant', width: 25 },
      { header: 'Filière', key: 'filiere', width: 25 },
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Note', key: 'note', width: 10 },
      { header: 'Commentaire', key: 'commentaire', width: 60 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    reponses.forEach((rep) => {
      sheet.addRow({
        campagne: rep.campagneTitre,
        matiere: rep.matiereTitre,
        enseignant: rep.enseignantNom,
        filiere: rep.filiereNom,
        question: rep.questionTexte,
        type: rep.typeQuestion,
        note: rep.noteEtoiles || '',
        commentaire: rep.commentaire || '',
        date: rep.dateReponse,
      });
    });
  }

  /**
   * Export CSV
   */
  private async exportCSV(filters: ExportFilterDto): Promise<ExportResultDto> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `export-${filters.type}-${timestamp}.csv`;
    const filepath = path.join(this.exportsDir, filename);

    if (filters.type === ExportType.STATISTIQUES) {
      const stats = await this.repository.getStatistiquesForExport(filters);

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: [
          { id: 'matiere', title: 'Matière' },
          { id: 'enseignant', title: 'Enseignant' },
          { id: 'filiere', title: 'Filière' },
          { id: 'department', title: 'Département' },
          { id: 'nbReponses', title: 'Nb Réponses' },
          { id: 'moyenneGlobale', title: 'Moyenne Globale' },
        ],
      });

      const records = stats.map((stat) => ({
        matiere: stat.matiereTitre,
        enseignant: stat.enseignantNom,
        filiere: stat.filiereNom,
        department: stat.departmentNom,
        nbReponses: stat.nombreReponses,
        moyenneGlobale: stat.moyenneGlobale.toFixed(2),
      }));

      await csvWriter.writeRecords(records);
    } else {
      const reponses = await this.repository.getReponsesForExport(filters);

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: [
          { id: 'campagne', title: 'Campagne' },
          { id: 'matiere', title: 'Matière' },
          { id: 'enseignant', title: 'Enseignant' },
          { id: 'filiere', title: 'Filière' },
          { id: 'question', title: 'Question' },
          { id: 'type', title: 'Type' },
          { id: 'note', title: 'Note' },
          { id: 'commentaire', title: 'Commentaire' },
          { id: 'date', title: 'Date' },
        ],
      });

      const records = reponses.map((rep) => ({
        campagne: rep.campagneTitre,
        matiere: rep.matiereTitre,
        enseignant: rep.enseignantNom,
        filiere: rep.filiereNom,
        question: rep.questionTexte,
        type: rep.typeQuestion,
        note: rep.noteEtoiles || '',
        commentaire: rep.commentaire || '',
        date: rep.dateReponse.toISOString(),
      }));

      await csvWriter.writeRecords(records);
    }

    const stats = fs.statSync(filepath);

    return {
      success: true,
      filename,
      fileSize: stats.size,
      format: ExportFormat.CSV,
      generatedAt: new Date(),
      recordsCount: 0, // TODO: count records
      filters: filters,
    };
  }

  /**
   * Export PDF
   */
  private async exportPDF(filters: ExportFilterDto): Promise<ExportResultDto> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `export-${filters.type}-${timestamp}.pdf`;
    const filepath = path.join(this.exportsDir, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Title
    doc.fontSize(20).text('Rapport d\'Évaluation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      align: 'center',
    });
    doc.moveDown(2);

    if (filters.type === ExportType.STATISTIQUES) {
      const stats = await this.repository.getStatistiquesForExport(filters);

      stats.forEach((stat, index) => {
        if (index > 0) doc.addPage();

        // Matiere title
        doc.fontSize(16).text(stat.matiereTitre, { underline: true });
        doc.moveDown();

        // Info
        doc.fontSize(12);
        doc.text(`Enseignant: ${stat.enseignantNom}`);
        doc.text(`Filière: ${stat.filiereNom}`);
        doc.text(`Département: ${stat.departmentNom}`);
        doc.text(`Nombre de réponses: ${stat.nombreReponses}`);
        doc.text(
          `Moyenne globale: ${stat.moyenneGlobale.toFixed(2)} / 5`,
        );
        doc.moveDown(2);

        // Questions
        doc.fontSize(14).text('Détails par question:', { underline: true });
        doc.moveDown();

        stat.moyennesParQuestion.forEach((q: any) => {
          doc.fontSize(11);
          doc.text(`${q.questionTexte}: ${q.moyenne.toFixed(2)} / 5`);
          const dist = `  Distribution: 5★:${q.distribution[5] || 0} 4★:${
            q.distribution[4] || 0
          } 3★:${q.distribution[3] || 0} 2★:${q.distribution[2] || 0} 1★:${
            q.distribution[1] || 0
          }`;
          doc.fontSize(9).text(dist);
          doc.moveDown(0.5);
        });

        // Comments
        if (
          filters.includeComments &&
          stat.commentaires &&
          stat.commentaires.length > 0
        ) {
          doc.moveDown();
          doc.fontSize(14).text('Commentaires:', { underline: true });
          doc.moveDown();

          stat.commentaires.slice(0, 10).forEach((comment: string) => {
            doc.fontSize(10).text(`• ${comment}`, { indent: 20 });
            doc.moveDown(0.3);
          });
        }
      });
    }

    doc.end();

    // Wait for PDF to be written
    await new Promise<void>((resolve) => writeStream.on('finish', () => resolve()));

    const stats = fs.statSync(filepath);

    return {
      success: true,
      filename,
      fileSize: stats.size,
      format: ExportFormat.PDF,
      generatedAt: new Date(),
      recordsCount: 0,
      filters: filters,
    };
  }

  /**
   * Get file path for download
   */
  getFilePath(filename: string): string {
    return path.join(this.exportsDir, filename);
  }

  /**
   * Clean old export files (older than 24h)
   */
  async cleanOldExports(): Promise<void> {
    const files = fs.readdirSync(this.exportsDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filepath = path.join(this.exportsDir, file);
      const stats = fs.statSync(filepath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filepath);
      }
    }
  }

  /**
   * Prepare chart data for frontend
   */
  async getChartData(filters: ExportFilterDto): Promise<ChartDataDto[]> {
    const stats = await this.repository.getStatistiquesForExport(filters);
    const charts: ChartDataDto[] = [];

    // Pie chart: Distribution globale
    const globalDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.forEach((stat) => {
      stat.moyennesParQuestion.forEach((q: any) => {
        for (let i = 1; i <= 5; i++) {
          globalDist[i] += q.distribution[i] || 0;
        }
      });
    });

    charts.push({
      type: 'pie',
      labels: ['5 étoiles', '4 étoiles', '3 étoiles', '2 étoiles', '1 étoile'],
      datasets: [
        {
          label: 'Distribution des notes',
          data: [globalDist[5], globalDist[4], globalDist[3], globalDist[2], globalDist[1]],
          backgroundColor: [
            '#4CAF50',
            '#8BC34A',
            '#FFC107',
            '#FF9800',
            '#F44336',
          ],
        },
      ],
    });

    // Bar chart: Moyennes par matière
    charts.push({
      type: 'bar',
      labels: stats.map((s) => s.matiereTitre.substring(0, 20)),
      datasets: [
        {
          label: 'Moyenne par matière',
          data: stats.map((s) => s.moyenneGlobale),
          backgroundColor: stats.map(() => '#2196F3'),
          borderColor: '#1976D2',
        },
      ],
    });

    // Line chart: Nombre de réponses par matière
    charts.push({
      type: 'line',
      labels: stats.map((s) => s.matiereTitre.substring(0, 20)),
      datasets: [
        {
          label: 'Nombre de réponses',
          data: stats.map((s) => s.nombreReponses),
          borderColor: '#FF5722',
        },
      ],
    });

    return charts;
  }
}
