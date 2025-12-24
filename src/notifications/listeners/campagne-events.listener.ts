import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CampagneCreatedEvent,
  CampagneStartedEvent,
  CampagneEndingSoonEvent,
  CampagneEndedEvent,
} from '../../shared/events/campagne.events';
import { NotificationsService } from '../notifications.service';
import { EmailService } from '../email.service';
import { NotificationType } from '../entities/notification.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Matiere } from '../../matieres/entities/matiere.entity';
import { Filiere } from '../../filieres/entities/filiere.entity';

@Injectable()
export class CampagneEventsListener {
  private readonly logger = new Logger(CampagneEventsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
    @InjectRepository(Filiere)
    private readonly filiereRepository: Repository<Filiere>,
  ) {}

  @OnEvent('campagne.created')
  async handleCampagneCreated(event: CampagneCreatedEvent) {
    this.logger.log(`Handling campagne.created event for: ${event.campagneId}`);

    try {
      // For now, notify all students
      // TODO: Filter by campagne targets (matieres/enseignants)
      const students = await this.userRepository.find({
        where: { role: UserRole.ETUDIANT },
      });

      for (const student of students) {
        // Create in-app notification
        await this.notificationsService.createNotification(
          student.id,
          NotificationType.CAMPAGNE_CREATED,
          `Nouvelle campagne: ${event.titre}`,
          `Une nouvelle campagne d'évaluation a été créée. Période: ${event.dateDebut.toLocaleDateString('fr-FR')} - ${event.dateFin.toLocaleDateString('fr-FR')}`,
          {
            campagneId: event.campagneId,
            dateDebut: event.dateDebut,
            dateFin: event.dateFin,
          },
          false, // Don't send email yet
        );

        // Send email
        await this.emailService.sendCampagneCreatedEmail(
          student.email,
          event.titre,
          event.dateDebut,
          event.dateFin,
        );
      }

      this.logger.log(
        `Notifications sent to ${students.length} students for campagne ${event.campagneId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling campagne.created event:`, error);
    }
  }

  @OnEvent('campagne.started')
  async handleCampagneStarted(event: CampagneStartedEvent) {
    this.logger.log(`Handling campagne.started event for: ${event.campagneId}`);

    try {
      // Get students who haven't completed the evaluation yet
      // For now, we'll notify all students in the system (to be refined)
      const students = await this.userRepository.find({
        where: { role: UserRole.ETUDIANT },
      });

      for (const student of students) {
        await this.notificationsService.createNotification(
          student.id,
          NotificationType.CAMPAGNE_STARTED,
          `Campagne active: ${event.titre}`,
          `La campagne est maintenant active. Vous pouvez remplir vos évaluations jusqu'au ${event.dateFin.toLocaleDateString('fr-FR')}.`,
          {
            campagneId: event.campagneId,
            dateFin: event.dateFin,
          },
          false,
        );

        await this.emailService.sendCampagneStartedEmail(
          student.email,
          event.titre,
          event.dateFin,
        );
      }
    } catch (error) {
      this.logger.error(`Error handling campagne.started event:`, error);
    }
  }

  @OnEvent('campagne.ending.soon')
  async handleCampagneEndingSoon(event: CampagneEndingSoonEvent) {
    this.logger.log(`Handling campagne.ending.soon event for: ${event.campagneId}`);

    try {
      const students = await this.userRepository.find({
        where: { role: UserRole.ETUDIANT },
      });

      for (const student of students) {
        await this.notificationsService.createNotification(
          student.id,
          NotificationType.CAMPAGNE_ENDING_SOON,
          `Rappel: ${event.titre}`,
          `La campagne se termine bientôt! Date limite: ${event.dateFin.toLocaleDateString('fr-FR')}`,
          {
            campagneId: event.campagneId,
            dateFin: event.dateFin,
          },
          false,
        );

        await this.emailService.sendCampagneEndingSoonEmail(
          student.email,
          event.titre,
          event.dateFin,
        );
      }
    } catch (error) {
      this.logger.error(`Error handling campagne.ending.soon event:`, error);
    }
  }

  @OnEvent('campagne.ended')
  async handleCampagneEnded(event: CampagneEndedEvent) {
    this.logger.log(`Handling campagne.ended event for: ${event.campagneId}`);
    // Optional: notify admins or teachers
  }
}
