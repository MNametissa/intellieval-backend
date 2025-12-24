import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { EmailService } from './email.service';
import { Notification } from './entities/notification.entity';
import { CampagneEventsListener } from './listeners/campagne-events.listener';
import { CoursEventsListener } from './listeners/cours-events.listener';
import { User } from '../users/entities/user.entity';
import { Matiere } from '../matieres/entities/matiere.entity';
import { Filiere } from '../filieres/entities/filiere.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Matiere, Filiere]),
  ],
  providers: [
    NotificationsService,
    NotificationsRepository,
    EmailService,
    CampagneEventsListener,
    CoursEventsListener,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
