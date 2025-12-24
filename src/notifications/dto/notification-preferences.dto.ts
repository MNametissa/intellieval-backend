import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailCampagneCreated?: boolean;

  @IsOptional()
  @IsBoolean()
  emailCampagneStarted?: boolean;

  @IsOptional()
  @IsBoolean()
  emailCampagneEndingSoon?: boolean;

  @IsOptional()
  @IsBoolean()
  emailCoursUploaded?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEvaluationReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;
}

export class NotificationFilterDto {
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
