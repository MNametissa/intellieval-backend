export class MatiereCreatedEvent {
  constructor(
    public readonly matiereId: string,
    public readonly code: string,
    public readonly nom: string,
    public readonly departmentId: string,
    public readonly filiereId: string | null,
  ) {}
}

export class MatiereUpdatedEvent {
  constructor(
    public readonly matiereId: string,
    public readonly code: string,
    public readonly nom: string,
    public readonly departmentId: string,
    public readonly filiereId: string | null,
  ) {}
}

export class MatiereDeletedEvent {
  constructor(
    public readonly matiereId: string,
    public readonly code: string,
  ) {}
}

export class MatiereEnseignantAssignedEvent {
  constructor(
    public readonly matiereId: string,
    public readonly enseignantId: string,
  ) {}
}

export class MatiereEnseignantUnassignedEvent {
  constructor(
    public readonly matiereId: string,
    public readonly enseignantId: string,
  ) {}
}
