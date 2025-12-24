export class QuestionnaireCreatedEvent {
  constructor(
    public readonly questionnaireId: string,
    public readonly titre: string,
    public readonly questionCount: number,
  ) {}
}

export class QuestionnaireUpdatedEvent {
  constructor(
    public readonly questionnaireId: string,
    public readonly titre: string,
    public readonly questionCount: number,
  ) {}
}

export class QuestionnaireDeletedEvent {
  constructor(
    public readonly questionnaireId: string,
    public readonly titre: string,
  ) {}
}

export class QuestionAddedEvent {
  constructor(
    public readonly questionnaireId: string,
    public readonly questionId: string,
    public readonly texte: string,
  ) {}
}

export class QuestionRemovedEvent {
  constructor(
    public readonly questionnaireId: string,
    public readonly questionId: string,
  ) {}
}
