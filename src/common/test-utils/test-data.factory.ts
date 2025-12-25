import { UserRole, UserStatus } from '../../users/entities/user.entity';

export class TestDataFactory {
  static createMockUser(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test User',
      email: 'test@example.com',
      password: '$2b$10$hashedpassword',
      role: UserRole.ETUDIANT,
      status: UserStatus.ACTIVE,
      departmentId: '123e4567-e89b-12d3-a456-426614174001',
      filiereId: '123e4567-e89b-12d3-a456-426614174002',
      matricule: 'ETU001',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockAdmin(overrides?: Partial<any>) {
    return this.createMockUser({
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      ...overrides,
    });
  }

  static createMockEnseignant(overrides?: Partial<any>) {
    return this.createMockUser({
      id: 'enseignant-id',
      name: 'Enseignant User',
      email: 'enseignant@example.com',
      role: UserRole.ENSEIGNANT,
      ...overrides,
    });
  }

  static createMockDepartment(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174001',
      code: 'INFO',
      nom: 'Informatique',
      description: 'Département Informatique',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockFiliere(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174002',
      code: 'L3INFO',
      name: 'Licence 3 Informatique',
      description: 'Licence 3 Informatique',
      departmentId: '123e4567-e89b-12d3-a456-426614174001',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockMatiere(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174003',
      code: 'MATH101',
      nom: 'Mathématiques Avancées',
      description: 'Cours de mathématiques',
      departmentId: '123e4567-e89b-12d3-a456-426614174001',
      filiereId: '123e4567-e89b-12d3-a456-426614174002',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockQuestionnaire(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174004',
      titre: 'Évaluation Standard',
      description: 'Questionnaire standard',
      questions: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockCampagne(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174005',
      titre: 'Campagne Test',
      description: 'Description',
      dateDebut: new Date('2024-01-01'),
      dateFin: new Date('2024-12-31'),
      statut: 'active',
      questionnaireId: '123e4567-e89b-12d3-a456-426614174004',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockNotification(overrides?: Partial<any>) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174006',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      type: 'campagne_created',
      title: 'Nouvelle campagne',
      message: 'Une nouvelle campagne a été créée',
      status: 'pending',
      metadata: null,
      emailSent: false,
      readAt: null,
      sentAt: null,
      createdAt: new Date('2024-01-01'),
      ...overrides,
    };
  }
}
