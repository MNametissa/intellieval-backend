export class DepartmentCreatedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}
}

export class DepartmentUpdatedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly name: string,
    public readonly updatedAt: Date,
  ) {}
}

export class DepartmentDeletedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly deletedAt: Date,
  ) {}
}
