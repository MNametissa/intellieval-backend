import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import {
  ImportPreviewDto,
  ImportRowPreview,
  ImportError,
  ImportResultDto,
  ImportedUser,
  ImportFailure,
} from './dto/import-preview.dto';
import { User } from './entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { Filiere } from '../filieres/entities/filiere.entity';
import { UserRole } from '../shared/enums/user-role.enum';
import { UserStatus } from '../shared/enums/user-status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersImportService {
  private readonly defaultPassword = 'ChangeMe123!';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Filiere)
    private readonly filiereRepository: Repository<Filiere>,
  ) {}

  /**
   * Preview CSV/Excel file before import
   * Returns validation results without creating users
   */
  async previewImport(
    file: Express.Multer.File,
  ): Promise<ImportPreviewDto> {
    // Validate file type
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format de fichier non supporté. Utilisez CSV ou Excel (.xlsx)',
      );
    }

    // Parse file
    const rows = await this.parseFile(file);

    if (rows.length === 0) {
      throw new BadRequestException('Le fichier est vide');
    }

    // Validate each row
    const preview: ImportRowPreview[] = [];
    const errors: ImportError[] = [];
    let validRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // +2 because row 1 is header, and we start at 0
      const row = rows[i];
      const rowErrors: string[] = [];

      // Validate required fields
      if (!row.name || row.name.trim() === '') {
        rowErrors.push('Le nom est requis');
      }

      if (!row.email || row.email.trim() === '') {
        rowErrors.push("L'email est requis");
      } else if (!this.isValidEmail(row.email)) {
        rowErrors.push("Format d'email invalide");
      }

      if (!row.role || row.role.trim() === '') {
        rowErrors.push('Le rôle est requis');
      } else if (!this.isValidRole(row.role)) {
        rowErrors.push(
          `Rôle invalide. Valeurs acceptées: ADMIN, ENSEIGNANT, ETUDIANT`,
        );
      }

      // Validate departmentId (required for all users)
      if (!row.departmentId || row.departmentId.trim() === '') {
        rowErrors.push('Le département est requis');
      }

      // Validate filiereId (required for students)
      if (row.role === 'ETUDIANT' && (!row.filiereId || row.filiereId.trim() === '')) {
        rowErrors.push('La filière est requise pour les étudiants');
      }

      const isValid = rowErrors.length === 0;
      if (isValid) {
        validRows++;
      }

      preview.push({
        rowNumber,
        data: {
          name: row.name,
          email: row.email,
          role: row.role,
          departmentId: row.departmentId,
          filiereId: row.filiereId,
          matricule: row.matricule,
        },
        isValid,
        errors: rowErrors,
      });

      // Add to global errors if invalid
      if (!isValid) {
        rowErrors.forEach((error) => {
          errors.push({
            row: rowNumber,
            message: error,
            severity: 'error',
          });
        });
      }
    }

    return {
      valid: errors.length === 0,
      totalRows: rows.length,
      validRows,
      invalidRows: rows.length - validRows,
      preview: preview.slice(0, 10), // Return first 10 rows for preview
      errors,
    };
  }

  /**
   * Import users from CSV/Excel file
   * Creates users in database with validation
   */
  async importUsers(file: Express.Multer.File): Promise<ImportResultDto> {
    // First validate
    const previewResult = await this.previewImport(file);

    if (!previewResult.valid) {
      throw new BadRequestException({
        message: 'Le fichier contient des erreurs. Veuillez corriger et réessayer.',
        errors: previewResult.errors,
      });
    }

    // Parse file again for actual import
    const rows = await this.parseFile(file);

    const created: ImportedUser[] = [];
    const failed: ImportFailure[] = [];

    // Hash default password once
    const hashedPassword = await bcrypt.hash(this.defaultPassword, 10);

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const row = rows[i];

      try {
        // Check if department exists
        const department = await this.departmentRepository.findOne({
          where: { id: row.departmentId },
        });

        if (!department) {
          failed.push({
            rowNumber,
            data: row,
            errors: [`Département avec ID ${row.departmentId} introuvable`],
          });
          continue;
        }

        // Check if filiere exists (for students)
        if (row.role === 'ETUDIANT' && row.filiereId) {
          const filiere = await this.filiereRepository.findOne({
            where: { id: row.filiereId },
          });

          if (!filiere) {
            failed.push({
              rowNumber,
              data: row,
              errors: [`Filière avec ID ${row.filiereId} introuvable`],
            });
            continue;
          }
        }

        // Check if email already exists
        const existingUser = await this.userRepository.findOne({
          where: { email: row.email },
        });

        if (existingUser) {
          failed.push({
            rowNumber,
            data: row,
            errors: [`Un utilisateur avec l'email ${row.email} existe déjà`],
          });
          continue;
        }

        // Create user
        const user = this.userRepository.create({
          name: row.name.trim(),
          email: row.email.trim().toLowerCase(),
          password: hashedPassword,
          role: row.role as UserRole,
          departmentId: row.departmentId,
          filiereId: row.filiereId || null,
          matricule: row.matricule || null,
          status: UserStatus.ACTIVE,
        });

        await this.userRepository.save(user);

        created.push({
          rowNumber,
          name: user.name,
          email: user.email,
          role: user.role,
          matricule: user.matricule || undefined,
        });
      } catch (error) {
        failed.push({
          rowNumber,
          data: row,
          errors: [error.message || 'Erreur inconnue'],
        });
      }
    }

    return {
      success: failed.length === 0,
      totalProcessed: rows.length,
      successCount: created.length,
      failureCount: failed.length,
      created,
      failed,
      message: `Import terminé. ${created.length} utilisateur(s) créé(s), ${failed.length} échec(s).`,
    };
  }

  /**
   * Parse CSV or Excel file and return rows
   */
  private async parseFile(file: Express.Multer.File): Promise<any[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: [
        'name',
        'email',
        'role',
        'departmentId',
        'filiereId',
        'matricule',
      ],
      range: 1, // Skip header row
      defval: '', // Default value for empty cells
    });

    return data;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate role value
   */
  private isValidRole(role: string): boolean {
    return ['ADMIN', 'ENSEIGNANT', 'ETUDIANT'].includes(role.toUpperCase());
  }

  /**
   * Generate import template
   */
  async generateTemplate(): Promise<Buffer> {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Nom', 'Email', 'Rôle', 'ID Département', 'ID Filière', 'Matricule'],
      [
        'Jean Dupont',
        'jean.dupont@example.com',
        'ETUDIANT',
        'dept-id-here',
        'filiere-id-here',
        'MAT001',
      ],
      [
        'Marie Martin',
        'marie.martin@example.com',
        'ENSEIGNANT',
        'dept-id-here',
        '',
        '',
      ],
      [
        'Admin User',
        'admin@example.com',
        'ADMIN',
        'dept-id-here',
        '',
        '',
      ],
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
