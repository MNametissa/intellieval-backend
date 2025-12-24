export class FiliereCreatedEvent {
  constructor(
    public readonly filiereId: string,
    public readonly name: string,
    public readonly departmentId: string,
    public readonly createdAt: Date,
  ) {}
}

export class FiliereUpdatedEvent {
  constructor(
    public readonly filiereId: string,
    public readonly name: string,
    public readonly departmentId: string,
    public readonly updatedAt: Date,
  ) {}
}

export class FiliereDeletedEvent {
  constructor(
    public readonly filiereId: string,
    public readonly deletedAt: Date,
  ) {}
}
