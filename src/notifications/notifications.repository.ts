import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationStatus,
} from './entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.repository.create({
      userId,
      type,
      title,
      message,
      metadata: metadata || null,
      status: NotificationStatus.PENDING,
      emailSent: false,
    });
    return this.repository.save(notification);
  }

  async findByUserId(userId: string, unreadOnly = false): Promise<Notification[]> {
    const query = this.repository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (unreadOnly) {
      query.andWhere('notification.readAt IS NULL');
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    await this.repository.update(id, {
      readAt: new Date(),
      status: NotificationStatus.READ,
    });
    return this.findById(id);
  }

  async markAsReadBulk(ids: string[]): Promise<void> {
    await this.repository.update(ids, {
      readAt: new Date(),
      status: NotificationStatus.READ,
    });
  }

  async markAsSent(id: string, emailSent = true): Promise<void> {
    await this.repository.update(id, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      emailSent,
    });
  }

  async markAsFailed(id: string): Promise<void> {
    await this.repository.update(id, {
      status: NotificationStatus.FAILED,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.readAt IS NULL')
      .getCount();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
