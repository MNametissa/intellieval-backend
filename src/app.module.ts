import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { FilieresModule } from './filieres/filieres.module';
import { MatieresModule } from './matieres/matieres.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { CampagnesModule } from './campagnes/campagnes.module';
import { ReponsesModule } from './reponses/reponses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'intellieval'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    SharedModule,
    UsersModule,
    AuthModule,
    DepartmentsModule,
    FilieresModule,
    MatieresModule,
    QuestionnairesModule,
    CampagnesModule,
    ReponsesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
