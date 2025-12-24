export class CoursUploadedEvent {
  constructor(
    public readonly coursId: string,
    public readonly titre: string,
    public readonly matiereId: string,
    public readonly enseignantId: string,
    public readonly uploadedAt: Date,
  ) {}
}

export class CoursDeletedEvent {
  constructor(
    public readonly coursId: string,
    public readonly matiereId: string,
    public readonly enseignantId: string,
    public readonly deletedAt: Date,
  ) {}
}

export class CoursUpdatedEvent {
  constructor(
    public readonly coursId: string,
    public readonly titre: string,
    public readonly matiereId: string,
    public readonly updatedAt: Date,
  ) {}
}
