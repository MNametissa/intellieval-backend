export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT',
    public readonly departmentId: string,
    public readonly filiereId: string | null,
    public readonly matricule: string | null,
    public readonly createdAt: Date,
  ) {}
}

export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly updatedFields: string[],
    public readonly updatedAt: Date,
  ) {}
}

export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT',
    public readonly deletedAt: Date,
  ) {}
}

export class UserImportedEvent {
  constructor(
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly totalCount: number,
    public readonly timestamp: Date,
  ) {}
}
