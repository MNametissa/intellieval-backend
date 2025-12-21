# NestJS Modular Monolith Architecture Rules for AI Agents

> **IMPORTANT**: This follows official NestJS conventions and documentation from https://docs.nestjs.com

## Core Principles

### What is a NestJS Module?

A module is a class that is annotated with the @Module() decorator. This decorator provides metadata that Nest uses to organize and manage the application structure efficiently.

Every Nest application has at least one module, the root module, which serves as the starting point for Nest to build the application graph.

**The `@Module()` decorator properties:**
- `providers`: Services/providers that will be instantiated by the Nest injector
- `controllers`: Controllers defined in this module to be instantiated
- `imports`: List of imported modules that export the providers required in this module
- `exports`: Subset of providers that should be available in other modules

### Architecture Type
- **ALWAYS** build as a **Modular Monolith** with event-driven communication
- **NEVER** use direct service imports between feature modules
- Feature modules organize code that is relevant to a specific feature, helping to maintain clear boundaries and better organization
- Each module MUST be completely independent and self-contained
- All modules run in a single Node.js process
- Communication between modules happens ONLY through events

### Technology Stack
- **Framework**: NestJS (latest stable version)
- **Language**: TypeScript (strict mode enabled)
- **Database**: MySQL with TypeORM
- **Validation**: class-validator + class-transformer
- **Events**: @nestjs/event-emitter
- **Authentication**: JWT with @nestjs/jwt and @nestjs/passport

---

## Project Structure (Official NestJS Convention)

### Root Directory Structure

Based on official NestJS documentation and community best practices:

```
project-root/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller (optional)
│   ├── app.service.ts             # Root service (optional)
│   ├── config/                    # Configuration files
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── common/                    # Shared utilities (global)
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── pipes/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── interfaces/
│   ├── shared/                    # Shared modules and events
│   │   ├── events/
│   │   │   ├── user.events.ts
│   │   │   ├── order.events.ts
│   │   │   └── product.events.ts
│   │   └── shared.module.ts
│   └── [feature-modules]/         # Feature modules
│       ├── users/
│       ├── products/
│       ├── orders/
│       └── auth/
├── database/                      # Global database files
│   ├── migrations/
│   │   └── global/
│   └── seeds/
│       ├── global/
│       └── run-seeds.ts
├── test/                          # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── package.json
├── tsconfig.json
├── ormconfig.ts
├── .env
├── .env.example
└── docker-compose.yml
```

---

## Feature Module Structure (Official NestJS Pattern)

### Standard Feature Module Structure

According to official NestJS documentation, a feature module typically contains controllers, services, DTOs, and interfaces organized in the feature directory.

**RULE**: Every feature module MUST follow this structure:

```
src/
└── [feature-name]/               # e.g., users, products, orders
    ├── [feature-name].module.ts  # Module definition
    ├── [feature-name].controller.ts
    ├── [feature-name].service.ts
    ├── [feature-name].repository.ts  # Database access layer
    ├── dto/                      # Data Transfer Objects
    │   ├── create-[feature].dto.ts
    │   ├── update-[feature].dto.ts
    │   └── [feature]-response.dto.ts
    ├── entities/                 # TypeORM entities
    │   └── [feature].entity.ts
    ├── interfaces/               # TypeScript interfaces
    │   └── [feature].interface.ts
    ├── listeners/                # Event listeners (for event-driven)
    │   └── [other-feature]-events.listener.ts
    ├── database/                 # Module-specific database files
    │   ├── migrations/
    │   │   └── YYYYMMDDHHMMSS-[description].ts
    │   └── seeds/
    │       └── [feature].seed.ts
    └── tests/                    # Module-specific tests
        ├── [feature].controller.spec.ts
        ├── [feature].service.spec.ts
        └── [feature].e2e-spec.ts
```

### Example: Users Module (Following Official Pattern)

Official NestJS documentation example structure:

```
src/
└── users/
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    ├── interfaces/
    │   └── user.interface.ts
    ├── entities/
    │   └── user.entity.ts
    ├── users.controller.ts
    ├── users.service.ts
    ├── users.repository.ts
    ├── users.module.ts
    └── listeners/
        └── order-events.listener.ts  # If listening to order events
```

---

## Module Creation Rules

### 1. Module Independence (Critical Rule)

**RULE**: Modules encapsulate providers by default, meaning you can only inject providers that are either part of the current module or explicitly exported from other imported modules.

**Requirements**:
- Module MUST NOT import services from other feature modules
- Module MUST NOT import entities from other feature modules
- Module MUST NOT import repositories from other feature modules
- Module MAY import ONLY from:
  - Its own files
  - `shared/` directory (events only)
  - `common/` directory (global utilities)
  - NestJS core packages
  - Third-party packages

**Example of FORBIDDEN imports**:
```typescript
// ❌ NEVER DO THIS
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';

// ✅ ALWAYS DO THIS INSTEAD
// Use events to communicate between modules
this.eventEmitter.emit('user.created', new UserCreatedEvent(...));
```

### 2. Module File Template (Official Pattern)

**RULE**: Every module MUST use the `@Module()` decorator with proper metadata.

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity
import { User } from './entities/user.entity';

// Service
import { UsersService } from './users.service';

// Repository
import { UsersRepository } from './users.repository';

// Controller
import { UsersController } from './users.controller';

// Event Listeners (if any)
import { OrderEventsListener } from './listeners/order-events.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register entity
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    OrderEventsListener, // Event listener
  ],
  exports: [], // NEVER export services to other modules in modular monolith
})
export class UsersModule {}
```

### 3. Creating Modules with NestJS CLI (Recommended)

**RULE**: Use NestJS CLI to generate modules for consistency.

```bash
# Generate module
nest g module users

# Generate controller
nest g controller users

# Generate service
nest g service users

# Generate complete resource (module + controller + service + DTOs)
nest g resource users
```

---

## Event-Driven Communication

### 1. Event Definitions

**RULE**: ALL event classes MUST be defined in `shared/events/` directory.

**File naming**: `[domain].events.ts` (e.g., `user.events.ts`, `order.events.ts`)

**Event class template**:
```typescript
// shared/events/user.events.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}
}

export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly updatedAt: Date,
  ) {}
}

export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly deletedAt: Date,
  ) {}
}
```

**Event naming convention**:
- Format: `[Entity][Action]Event`
- Examples: `UserCreatedEvent`, `OrderPlacedEvent`, `PaymentProcessedEvent`
- Use past tense for actions: Created, Updated, Deleted, Placed, Processed

### 2. Publishing Events

**RULE**: Services MUST emit events for significant domain actions.

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserCreatedEvent } from '@/shared/events/user.events';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Perform action
    const user = await this.repository.save(createUserDto);

    // 2. Emit event (fire and forget)
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(
        user.id,
        user.email,
        user.name,
        user.createdAt,
      ),
    );

    // 3. Return result
    return user;
  }
}
```

**Event naming in emit**:
- Format: `[domain].[action]` (lowercase, dot-separated)
- Examples: `user.created`, `order.placed`, `payment.completed`

### 3. Listening to Events

**RULE**: Event listeners MUST be in `listeners/` directory within the module.

**File naming**: `[event-source]-events.listener.ts`

```typescript
// notifications/listeners/user-events.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent, UserDeletedEvent } from '@/shared/events/user.events';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class UserEventsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    await this.notificationsService.sendWelcomeEmail(
      event.email,
      event.name,
    );
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(event: UserDeletedEvent) {
    await this.notificationsService.sendGoodbyeEmail(event.userId);
  }
}
```

**Requirements**:
- One listener class per event source
- Listener MUST be registered in module providers
- Event handler methods MUST be async
- Event handlers SHOULD handle errors gracefully (use try-catch)

---

## Shared Modules (Official NestJS Pattern)

### Shared Module Concept

In Nest, modules are singletons by default, and thus you can share the same instance of any provider between multiple modules effortlessly.

Every module is automatically a shared module. Once created it can be reused by any module.

### Creating Shared Utilities Module

```typescript
// shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global() // Makes it available everywhere without importing
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),
  ],
  exports: [EventEmitterModule],
})
export class SharedModule {}
```

**What belongs in Shared:**
- Event contracts (event classes)
- Event emitter configuration

**What DOESN'T belong in Shared:**
- Business logic
- Domain-specific services
- Anything that knows about your features

---

## Database and TypeORM Rules

### 1. Database Configuration

**RULE**: Configure TypeORM in `app.module.ts` using official pattern.

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Feature modules
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'myapp'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // NEVER true in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Events
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
```

### 2. Entity Rules

**RULE**: Each module should have its entities in an entities folder.

```typescript
// users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive'], 
    default: 'active' 
  })
  status: 'active' | 'inactive';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Entity Requirements**:
- MUST use `@Entity('table_name')` decorator
- MUST use `@PrimaryGeneratedColumn('uuid')` for primary key
- MUST include `createdAt` and `updatedAt` timestamps
- Column names MUST use snake_case in database
- Property names MUST use camelCase in TypeScript
- MUST add indexes for frequently queried columns
- Password fields MUST have `select: false`

### 3. Repository Pattern

**RULE**: Create dedicated repository for each entity.

```typescript
// users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ 
      where: { email },
      select: ['id', 'email', 'name', 'password', 'status', 'createdAt', 'updatedAt'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
```

### 4. Registering Entities in Module

**RULE**: Use TypeOrmModule.forFeature() to register entities in the module.

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register entity
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
```

---

## Service Rules

### Service Template (Official Pattern)

```typescript
// users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '@/shared/events/user.events';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Business validation
    const existingUser = await this.repository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.repository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Emit event
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.name, user.createdAt),
    );

    // Return without password
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const updated = await this.repository.update(id, updateUserDto);

    this.eventEmitter.emit(
      'user.updated',
      new UserUpdatedEvent(updated.id, updated.email, updated.updatedAt),
    );

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists
    await this.repository.delete(id);

    this.eventEmitter.emit(
      'user.deleted',
      new UserDeletedEvent(id, new Date()),
    );
  }
}
```

---

## Controller Rules

### Controller Template (Official Pattern)

```typescript
// users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

---

## DTO and Validation Rules

### DTO Templates

**Create DTO**:
```typescript
// users/dto/create-user.dto.ts
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
```

**Update DTO**:
```typescript
// users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
```

---

## Migration Strategy

### 1. TypeORM Configuration for Migrations

```typescript
// ormconfig.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [
    'src/**/database/migrations/*{.ts,.js}',
    'database/migrations/global/*{.ts,.js}',
  ],
  synchronize: false,
  logging: true,
});
```

### 2. Migration Scripts

```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d ormconfig.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d ormconfig.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d ormconfig.ts",
    "seed:run": "ts-node database/seeds/run-seeds.ts"
  }
}
```

### 3. Module Migrations Location

```
src/
└── users/
    └── database/
        └── migrations/
            └── 20240101120000-CreateUsersTable.ts

database/
└── migrations/
    └── global/
        └── 20240101000000-InitializeDatabase.ts
```

---

## Main Bootstrap

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || [],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}

bootstrap();
```

---

## Naming Conventions

### Files and Directories
- **Modules**: kebab-case (e.g., `user-management.module.ts`)
- **Classes**: PascalCase (e.g., `UsersService`, `CreateUserDto`)
- **Interfaces**: PascalCase (e.g., `User`, `UserInterface`)

### Database
- **Tables**: plural, snake_case (e.g., `users`, `order_items`)
- **Columns**: snake_case (e.g., `first_name`, `created_at`)

### Routes
- **Base route**: plural, kebab-case (e.g., `/users`, `/order-items`)

### Events
- **Event names**: dot-separated, lowercase (e.g., `user.created`)
- **Event classes**: PascalCase with Event suffix (e.g., `UserCreatedEvent`)

---

## Key Rules Summary

1. **FOLLOW OFFICIAL NESTJS STRUCTURE**: Use official module pattern with controllers, services, DTOs, entities
2. **NO DIRECT MODULE IMPORTS**: Modules communicate ONLY via events
3. **USE @Module() DECORATOR**: Properly configure imports, controllers, providers, exports
4. **MYSQL + TYPEORM**: Always use MySQL with TypeORM
5. **EVENTS FOR COMMUNICATION**: Define in shared/events/, emit in services, listen in listeners/
6. **VALIDATION**: Use DTOs with class-validator for all inputs
7. **USE NESTJS CLI**: Generate modules, controllers, services with `nest g`
8. **SINGLE RESPONSIBILITY**: Each module handles one feature/domain
9. **SHARED MODULES**: Use for truly shared utilities only
10. **TESTING**: Unit, integration, and E2E tests required

---

## Module Creation Checklist

- [ ] Generate module with `nest g module [name]`
- [ ] Generate controller with `nest g controller [name]`
- [ ] Generate service with `nest g service [name]`
- [ ] Create entity in `entities/` folder
- [ ] Create repository for entity
- [ ] Register entity with `TypeOrmModule.forFeature([Entity])`
- [ ] Create DTOs in `dto/` folder
- [ ] Create event listeners in `listeners/` if needed
- [ ] Define events in `shared/events/` if publishing
- [ ] Create migrations in `database/migrations/`
- [ ] Register module in `app.module.ts`
- [ ] Write tests

---

## Complete Working Example

See the previous artifact for a complete working example with:
- Auth module (JWT authentication)
- Users module (user management)
- Products module (product catalog)
- Orders module (order processing with event listeners)
- Notifications module (email notifications via events)

All following official NestJS patterns with event-driven modular monolith architecture!
