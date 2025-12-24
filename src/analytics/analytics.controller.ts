import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getOverview(@Query() filters: AnalyticsFilterDto) {
    return this.analyticsService.getOverview(filters);
  }

  @Get('department/:id')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getDepartmentAnalytics(
    @Param('id') id: string,
    @Query() filters: AnalyticsFilterDto,
  ) {
    const result = await this.analyticsService.getDepartmentAnalytics(id, filters);
    if (!result) {
      throw new NotFoundException('Department not found');
    }
    return result;
  }

  @Get('filiere/:id')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getFiliereAnalytics(
    @Param('id') id: string,
    @Query() filters: AnalyticsFilterDto,
  ) {
    const result = await this.analyticsService.getFiliereAnalytics(id, filters);
    if (!result) {
      throw new NotFoundException('Filiere not found');
    }
    return result;
  }

  @Get('trends')
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getTrends(@Query() filters: AnalyticsFilterDto) {
    return this.analyticsService.getTrends(filters);
  }
}
