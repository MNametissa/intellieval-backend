import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { EmailService } from './email.service';
import { NotificationType } from './entities/notification.entity';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly emailService: EmailService,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
    sendEmail = true,
  ): Promise<NotificationResponseDto> {
    const notification = await this.repository.create(
      userId,
      type,
      title,
      message,
      metadata,
    );

    if (sendEmail) {
      this.sendNotificationEmail(notification.id, userId, type, title, metadata).catch(
        (error) => {
          this.logger.error(`Failed to send email for notification ${notification.id}:`, error);
        },
      );
    }

    return this.mapToResponseDto(notification);
  }

  private async sendNotificationEmail(
    notificationId: string,
    userId: string,
    type: NotificationType,
    title: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Note: We would need to fetch user email from User entity
    // For now, we'll mark as sent without actually sending
    // This will be implemented when we add User repository dependency

    try {
      let emailSent = false;

      // Email sending logic based on notification type
      // This is a placeholder - actual implementation would fetch user email
      // and use the appropriate email template

      if (emailSent) {
        await this.repository.markAsSent(notificationId, true);
      } else {
        await this.repository.markAsSent(notificationId, false);
      }
    } catch (error) {
      this.logger.error(`Email sending failed for notification ${notificationId}:`, error);
      await this.repository.markAsFailed(notificationId);
    }
  }

  async getUserNotifications(
    userId: string,
    unreadOnly = false,
  ): Promise<NotificationListResponseDto> {
    const notifications = await this.repository.findByUserId(userId, unreadOnly);
    const unreadCount = await this.repository.countUnread(userId);

    return {
      notifications: notifications.map((n) => this.mapToResponseDto(n)),
      total: notifications.length,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationResponseDto> {
    const notification = await this.repository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.repository.markAsRead(notificationId);
    return this.mapToResponseDto(updated);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.repository.findByUserId(userId, true);
    const ids = notifications.map((n) => n.id);

    if (ids.length > 0) {
      await this.repository.markAsReadBulk(ids);
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notification = await this.repository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.repository.deleteById(notificationId);
  }

  async deleteAllUserNotifications(userId: string): Promise<void> {
    await this.repository.deleteAllForUser(userId);
  }

  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status,
      metadata: notification.metadata,
      emailSent: notification.emailSent,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
