import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.get<string>(
      'SMTP_FROM',
      'noreply@intellieval.com',
    );

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendCampagneCreatedEmail(
    to: string,
    campagneTitre: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<boolean> {
    const subject = `Nouvelle campagne d'évaluation: ${campagneTitre}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nouvelle Campagne d'Évaluation</h2>
        <p>Bonjour,</p>
        <p>Une nouvelle campagne d'évaluation a été créée :</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${campagneTitre}</h3>
          <p><strong>Début :</strong> ${dateDebut.toLocaleDateString('fr-FR')}</p>
          <p><strong>Fin :</strong> ${dateFin.toLocaleDateString('fr-FR')}</p>
        </div>
        <p>Connectez-vous à la plateforme IntelliEval pour participer.</p>
        <p>Cordialement,<br/>L'équipe IntelliEval</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendCampagneStartedEmail(
    to: string,
    campagneTitre: string,
    dateFin: Date,
  ): Promise<boolean> {
    const subject = `Campagne active: ${campagneTitre}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Campagne d'Évaluation Active</h2>
        <p>Bonjour,</p>
        <p>La campagne <strong>${campagneTitre}</strong> est maintenant active !</p>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>Vous pouvez dès maintenant remplir vos évaluations.</p>
          <p><strong>Date de clôture :</strong> ${dateFin.toLocaleDateString('fr-FR')}</p>
        </div>
        <p>Connectez-vous à IntelliEval pour participer.</p>
        <p>Cordialement,<br/>L'équipe IntelliEval</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendCampagneEndingSoonEmail(
    to: string,
    campagneTitre: string,
    dateFin: Date,
  ): Promise<boolean> {
    const subject = `Rappel: ${campagneTitre} se termine bientôt`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">Campagne se terminant bientôt</h2>
        <p>Bonjour,</p>
        <p>La campagne <strong>${campagneTitre}</strong> se termine bientôt !</p>
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date de clôture :</strong> ${dateFin.toLocaleDateString('fr-FR')}</p>
          <p>N'oubliez pas de remplir vos évaluations avant la fin.</p>
        </div>
        <p>Connectez-vous à IntelliEval maintenant.</p>
        <p>Cordialement,<br/>L'équipe IntelliEval</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendCoursUploadedEmail(
    to: string,
    coursTitre: string,
    matiereName: string,
    enseignantName: string,
  ): Promise<boolean> {
    const subject = `Nouveau cours disponible: ${coursTitre}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Nouveau Cours Disponible</h2>
        <p>Bonjour,</p>
        <p>Un nouveau cours a été ajouté :</p>
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${coursTitre}</h3>
          <p><strong>Matière :</strong> ${matiereName}</p>
          <p><strong>Enseignant :</strong> ${enseignantName}</p>
        </div>
        <p>Connectez-vous à IntelliEval pour consulter ce cours.</p>
        <p>Cordialement,<br/>L'équipe IntelliEval</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendEvaluationReminderEmail(
    to: string,
    pendingCount: number,
  ): Promise<boolean> {
    const subject = `Rappel: ${pendingCount} évaluation(s) en attente`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Évaluations en Attente</h2>
        <p>Bonjour,</p>
        <p>Vous avez <strong>${pendingCount}</strong> évaluation(s) en attente.</p>
        <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>Votre participation est importante pour améliorer la qualité de l'enseignement.</p>
        </div>
        <p>Connectez-vous à IntelliEval pour compléter vos évaluations.</p>
        <p>Cordialement,<br/>L'équipe IntelliEval</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}
