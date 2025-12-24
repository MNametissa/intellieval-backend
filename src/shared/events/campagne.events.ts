export class CampagneCreatedEvent {
  constructor(
    public readonly campagneId: string,
    public readonly titre: string,
    public readonly dateDebut: Date,
    public readonly dateFin: Date,
    public readonly questionnaireId: string,
  ) {}
}

export class CampagneUpdatedEvent {
  constructor(
    public readonly campagneId: string,
    public readonly titre: string,
    public readonly statut: string,
  ) {}
}

export class CampagneDeletedEvent {
  constructor(
    public readonly campagneId: string,
    public readonly titre: string,
  ) {}
}

export class CampagneActivatedEvent {
  constructor(
    public readonly campagneId: string,
    public readonly titre: string,
    public readonly dateDebut: Date,
  ) {}
}

export class CampagneClosedEvent {
  constructor(
    public readonly campagneId: string,
    public readonly titre: string,
    public readonly dateFin: Date,
  ) {}
}

export class MatiereAddedToCampagneEvent {
  constructor(
    public readonly campagneId: string,
    public readonly matiereId: string,
  ) {}
}

export class EnseignantAddedToCampagneEvent {
  constructor(
    public readonly campagneId: string,
    public readonly enseignantId: string,
  ) {}
}
