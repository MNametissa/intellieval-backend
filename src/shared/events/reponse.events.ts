export class ReponseSubmittedEvent {
  constructor(
    public readonly reponseId: string,
    public readonly campagneId: string,
    public readonly questionId: string,
    public readonly filiereId: string,
    public readonly matiereId: string | null,
    public readonly enseignantId: string | null,
    public readonly submittedAt: Date,
  ) {}
}

export class CampagneCompletedByStudentEvent {
  constructor(
    public readonly campagneId: string,
    public readonly filiereId: string,
    public readonly completedAt: Date,
  ) {}
}
