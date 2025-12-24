import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { ExportFilterDto } from './dto/export-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as fs from 'fs';

@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  /**
   * Export des réponses d'évaluation
   * Formats: Excel, CSV, PDF
   */
  @Post('reponses')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  @HttpCode(HttpStatus.OK)
  async exportReponses(
    @Query() filters: ExportFilterDto,
    @CurrentUser() user: any,
  ) {
    // Filter by enseignant if not admin
    if (user.role === UserRole.ENSEIGNANT) {
      filters.enseignantId = user.userId;
    }

    const result = await this.exportsService.export(filters);
    return result;
  }

  /**
   * Export des statistiques agrégées
   */
  @Post('statistiques')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  @HttpCode(HttpStatus.OK)
  async exportStatistiques(
    @Query() filters: ExportFilterDto,
    @CurrentUser() user: any,
  ) {
    filters.type = 'statistiques' as any;

    // Filter by enseignant if not admin
    if (user.role === UserRole.ENSEIGNANT) {
      filters.enseignantId = user.userId;
    }

    const result = await this.exportsService.export(filters);
    return result;
  }

  /**
   * Télécharger un fichier d'export
   */
  @Get('download/:filename')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async downloadExport(
    @Query('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filepath = this.exportsService.getFilePath(filename);

    if (!fs.existsSync(filepath)) {
      throw new Error('Fichier non trouvé');
    }

    const file = fs.createReadStream(filepath);
    const stats = fs.statSync(filepath);

    // Determine content type based on extension
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.xlsx')) {
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (filename.endsWith('.csv')) {
      contentType = 'text/csv';
    } else if (filename.endsWith('.pdf')) {
      contentType = 'application/pdf';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': stats.size,
    });

    return new StreamableFile(file);
  }

  /**
   * Récupérer les données de graphiques pour le frontend
   */
  @Get('charts')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT, UserRole.ETUDIANT)
  async getChartData(
    @Query() filters: ExportFilterDto,
    @CurrentUser() user: any,
  ) {
    // Filter by filiere for students
    if (user.role === UserRole.ETUDIANT) {
      filters.filiereId = user.filiereId;
    }

    // Filter by enseignant if enseignant
    if (user.role === UserRole.ENSEIGNANT) {
      filters.enseignantId = user.userId;
    }

    const charts = await this.exportsService.getChartData(filters);
    return { charts };
  }

  /**
   * Nettoyer les fichiers d'export anciens (admin only)
   */
  @Post('clean')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async cleanOldExports() {
    await this.exportsService.cleanOldExports();
    return { success: true, message: 'Fichiers anciens supprimés' };
  }
}
