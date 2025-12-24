import {
  NotificationType,
  NotificationStatus,
} from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  metadata: Record<string, any> | null;
  emailSent: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export class NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  total: number;
  unreadCount: number;
}
