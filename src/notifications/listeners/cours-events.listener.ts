import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursUploadedEvent } from '../../shared/events/cours.events';
import { NotificationsService } from '../notifications.service';
import { EmailService } from '../email.service';
import { NotificationType } from '../entities/notification.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Matiere } from '../../matieres/entities/matiere.entity';

@Injectable()
export class CoursEventsListener {
  private readonly logger = new Logger(CoursEventsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
  ) {}

  @OnEvent('cours.uploaded')
  async handleCoursUploaded(event: CoursUploadedEvent) {
    this.logger.log(`Handling cours.uploaded event for: ${event.coursId}`);

    try {
      // Find the matiere to get the filiere
      const matiere = await this.matiereRepository.findOne({
        where: { id: event.matiereId },
        relations: ['filiere', 'enseignants'],
      });

      if (!matiere || !matiere.filiere) {
        this.logger.warn(`Matiere ${event.matiereId} not found or has no filiere`);
        return;
      }

      // Find all students in this filiere
      const students = await this.userRepository.find({
        where: {
          role: UserRole.ETUDIANT,
          filiereId: matiere.filiere.id,
        },
      });

      // Get enseignant name from the event's enseignantId
      const enseignant = await this.userRepository.findOne({
        where: { id: event.enseignantId },
      });

      const enseignantName = enseignant ? enseignant.name : 'Enseignant';

      for (const student of students) {
        // Create in-app notification
        await this.notificationsService.createNotification(
          student.id,
          NotificationType.COURS_UPLOADED,
          `Nouveau cours: ${event.titre}`,
          `Un nouveau cours a été ajouté pour ${matiere.nom}`,
          {
            coursId: event.coursId,
            matiereId: event.matiereId,
            matiereName: matiere.nom,
            enseignantName,
          },
          false,
        );

        // Send email
        await this.emailService.sendCoursUploadedEmail(
          student.email,
          event.titre,
          matiere.nom,
          enseignantName,
        );
      }

      this.logger.log(
        `Notifications sent to ${students.length} students for cours ${event.coursId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling cours.uploaded event:`, error);
    }
  }
}
