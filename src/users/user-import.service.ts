import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from './users.repository';
import {
  ImportUserRow,
  ImportUsersResultDto,
  ImportError,
} from './dto/import-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user.entity';
import { UserImportedEvent } from '../shared/events/user.events';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserImportService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async importUsers(
    rows: ImportUserRow[],
    departmentMap: Map<string, string>,
    filiereMap: Map<string, string>,
  ): Promise<ImportUsersResultDto> {
    const result: ImportUsersResultDto = {
      success: 0,
      failed: 0,
      total: rows.length,
      createdUsers: [],
      errors: [],
    };

    const validUsers: CreateUserDto[] = [];
    const defaultPassword = await bcrypt.hash('ChangeMe2024!', 10);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNumber = i + 2;

      try {
        const validatedUser = await this.validateAndTransformRow(
          row,
          lineNumber,
          departmentMap,
          filiereMap,
          defaultPassword,
        );
        validUsers.push(validatedUser);
      } catch (error) {
        result.failed++;
        result.errors.push({
          line: lineNumber,
          email: row.email || 'N/A',
          error: error.message,
        });
      }
    }

    if (validUsers.length > 0) {
      try {
        const createdUsers = await this.repository.bulkCreate(validUsers);
        result.success = createdUsers.length;
        result.createdUsers = createdUsers.map((u) => u.email);

        this.eventEmitter.emit(
          'user.imported',
          new UserImportedEvent(
            result.success,
            result.failed,
            result.total,
            new Date(),
          ),
        );
      } catch (error) {
        throw new BadRequestException(
          `Bulk insert failed: ${error.message}`,
        );
      }
    }

    return result;
  }

  private async validateAndTransformRow(
    row: ImportUserRow,
    lineNumber: number,
    departmentMap: Map<string, string>,
    filiereMap: Map<string, string>,
    defaultPassword: string,
  ): Promise<CreateUserDto> {
    if (!row.type) {
      throw new Error('User type is required');
    }

    if (!row.prenom || !row.nom) {
      throw new Error('First name and last name are required');
    }

    if (!row.email) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(row.email)) {
      throw new Error('Invalid email format');
    }

    const emailExists = await this.repository.emailExists(row.email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    if (!row.departement) {
      throw new Error('Department is required');
    }

    const departmentId = departmentMap.get(row.departement);
    if (!departmentId) {
      throw new Error(`Department '${row.departement}' not found`);
    }

    const role = this.mapRoleFromType(row.type);
    const name = `${row.prenom} ${row.nom}`;

    let filiereId: string | null = null;
    let matricule: string | null = null;

    if (role === UserRole.ETUDIANT) {
      if (!row.filiere) {
        throw new Error('Filiere is required for students');
      }

      const foundFiliereId = filiereMap.get(row.filiere);
      if (!foundFiliereId) {
        throw new Error(`Filiere '${row.filiere}' not found`);
      }
      filiereId = foundFiliereId;

      if (!row.matricule) {
        throw new Error('Matricule is required for students');
      }

      const matriculeExists = await this.repository.matriculeExists(
        row.matricule,
      );
      if (matriculeExists) {
        throw new Error(`Matricule '${row.matricule}' already exists`);
      }

      matricule = row.matricule;
    }

    return {
      name,
      email: row.email,
      password: defaultPassword,
      role,
      departmentId,
      filiereId,
      matricule,
    };
  }

  private mapRoleFromType(type: string): UserRole {
    const normalizedType = type.toLowerCase().trim();

    if (normalizedType === 'étudiant' || normalizedType === 'etudiant') {
      return UserRole.ETUDIANT;
    }

    if (normalizedType === 'enseignant') {
      return UserRole.ENSEIGNANT;
    }

    if (normalizedType === 'admin') {
      return UserRole.ADMIN;
    }

    throw new Error(`Invalid user type: ${type}`);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  parseCSV(content: string): ImportUserRow[] {
    const lines = content.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new BadRequestException('CSV file must have headers and data');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: ImportUserRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        if (header === 'type') row.type = values[index];
        if (header === 'prénom' || header === 'prenom') row.prenom = values[index];
        if (header === 'nom') row.nom = values[index];
        if (header === 'email') row.email = values[index];
        if (header === 'département' || header === 'departement')
          row.departement = values[index];
        if (header === 'filière' || header === 'filiere')
          row.filiere = values[index];
        if (header === 'matières' || header === 'matieres')
          row.matieres = values[index];
        if (header === 'matricule') row.matricule = values[index];
      });

      rows.push(row);
    }

    return rows;
  }
}
