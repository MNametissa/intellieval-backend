import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationFilterDto } from './dto/notification-preferences.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: any,
    @Query() filters: NotificationFilterDto,
  ) {
    return this.notificationsService.getUserNotifications(
      user.userId,
      filters.unreadOnly || false,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const result = await this.notificationsService.getUserNotifications(
      user.userId,
      true,
    );
    return { unreadCount: result.unreadCount };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@CurrentUser() user: any, @Param('id') id: string) {
    await this.notificationsService.deleteNotification(user.userId, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllNotifications(@CurrentUser() user: any) {
    await this.notificationsService.deleteAllUserNotifications(user.userId);
  }
}
