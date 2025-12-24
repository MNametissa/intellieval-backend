# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS backend using **Modular Monolith Architecture** with event-driven communication between modules. This is a fresh project following strict architectural patterns defined in `rules.md`.

**Key Stack:**
- NestJS 11.x
- TypeScript (strict mode)
- MySQL + TypeORM
- Event-driven architecture (@nestjs/event-emitter)
- JWT authentication (@nestjs/jwt + @nestjs/passport)

## Development Commands

### Building and Running
```bash
# Development with watch mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Testing
```bash
# Unit tests
npm run test

# Watch mode for specific test
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Lint and auto-fix
npm run lint

# Format code
npm run format
```

### Database Migrations
```bash
# Generate migration from entity changes
npm run migration:generate -- src/[module]/database/migrations/[MigrationName]

# Create empty migration
npm run migration:create -- src/[module]/database/migrations/[MigrationName]

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Run seeds
npm run seed:run
```

### NestJS CLI (Module Generation)
```bash
# Generate complete resource (recommended)
nest g resource [name]

# Generate individual components
nest g module [name]
nest g controller [name]
nest g service [name]
```

## Critical Architecture Rules

**MUST READ:** See `rules.md` for complete architectural guidelines. Key rules:

### 1. Modular Monolith Pattern
- Each feature module MUST be completely independent
- Modules communicate ONLY via events (never direct imports)
- NO cross-module service/repository/entity imports allowed

### 2. Module Structure
Every feature module follows this structure:
```
src/[feature-name]/
├── [feature-name].module.ts      # @Module() decorator config
├── [feature-name].controller.ts  # HTTP endpoints
├── [feature-name].service.ts     # Business logic
├── [feature-name].repository.ts  # Database access
├── dto/                          # Validation DTOs
├── entities/                     # TypeORM entities
├── listeners/                    # Event listeners
├── database/
│   ├── migrations/              # Module-specific migrations
│   └── seeds/
└── tests/                       # Unit & E2E tests
```

### 3. Event-Driven Communication
- Event classes defined in `shared/events/[domain].events.ts`
- Services emit events: `this.eventEmitter.emit('user.created', new UserCreatedEvent(...))`
- Listeners in `listeners/[event-source]-events.listener.ts` with `@OnEvent()` decorator
- Event naming: lowercase dot-separated (e.g., `user.created`, `order.placed`)

### 4. Database Patterns
- Use TypeORM with MySQL
- Entities use `@PrimaryGeneratedColumn('uuid')`
- Include `createdAt` and `updatedAt` timestamps
- Database columns: snake_case, TypeScript properties: camelCase
- Password fields must have `select: false`
- Create dedicated repository for each entity
- Register entities with `TypeOrmModule.forFeature([Entity])`

### 5. Validation & DTOs
- All inputs validated with class-validator
- CreateDto for creation, UpdateDto extends `PartialType(CreateDto)`
- Global ValidationPipe configured in main.ts

### 6. Naming Conventions
- Files: kebab-case (e.g., `user-management.module.ts`)
- Classes: PascalCase (e.g., `UsersService`, `CreateUserDto`)
- Database tables: plural snake_case (e.g., `users`, `order_items`)
- Routes: plural kebab-case (e.g., `/users`, `/order-items`)
- Events: dot-separated lowercase (e.g., `user.created`)
- Event classes: PascalCase with Event suffix (e.g., `UserCreatedEvent`)

## Module Creation Workflow

When creating a new feature module:

1. Use NestJS CLI: `nest g resource [name]`
2. Create entity in `entities/` folder
3. Create repository class
4. Register entity in module: `TypeOrmModule.forFeature([Entity])`
5. Define events in `shared/events/[name].events.ts` if needed
6. Create event listeners in `listeners/` if consuming events
7. Register all providers (service, repository, listeners) in module
8. Create migration: `npm run migration:generate -- src/[name]/database/migrations/Create[Name]Table`
9. Register module in `app.module.ts`
10. Write tests

## Important Restrictions

**NEVER do these:**
- Import services/entities/repositories from other feature modules
- Use `synchronize: true` in TypeORM production config
- Skip validation on DTOs
- Create modules without using @Module() decorator
- Export services to other feature modules (use events instead)
- Make database changes without migrations

## Configuration

- Environment variables in `.env` file
- Global prefix: `api/v1` (configured in main.ts)
- CORS configured via `ALLOWED_ORIGINS` env variable
- JWT configuration in `config/jwt.config.ts`
- Database configuration in `config/database.config.ts`

## Testing Strategy

- Unit tests: `*.spec.ts` files alongside components
- E2E tests: `test/*.e2e-spec.ts`
- Test configuration in package.json jest section
- Use `@nestjs/testing` for dependency injection in tests
- always refer to @rules.md to know the implementation rules
- we must have pagination and filters
- always have a sure a search feature along pagination and filters
- no ai mention in commits
- after new features tested, commit