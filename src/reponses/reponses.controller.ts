import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ReponsesService } from './reponses.service';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { FilterReponseDto } from './dto/filter-reponse.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';

@Controller('reponses')
export class ReponsesController {
  constructor(private readonly reponsesService: ReponsesService) {}

  /**
   * ANONYMOUS ENDPOINT - No authentication required!
   * Students submit evaluations anonymously
   */
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submitEvaluation(@Body() submitEvaluationDto: SubmitEvaluationDto) {
    return this.reponsesService.submitEvaluation(submitEvaluationDto);
  }

  /**
   * ADMIN ONLY - View all responses with filters and pagination
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() filterDto: FilterReponseDto) {
    return this.reponsesService.findAll(filterDto);
  }

  /**
   * ADMIN/ENSEIGNANT - Get statistics for a matiere
   * ENSEIGNANT can only view if they teach the matiere
   */
  @Get('statistiques/matiere/:matiereId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getStatisticsByMatiere(
    @Param('matiereId') matiereId: string,
    @CurrentUser() user: any,
  ) {
    // TODO: Add validation that enseignant teaches this matiere
    // For now, ADMIN can see all, ENSEIGNANT can see all (will be restricted later)
    return this.reponsesService.getStatisticsByMatiere(matiereId);
  }

  /**
   * ADMIN/ENSEIGNANT - Get statistics for an enseignant
   * ENSEIGNANT can only view their own statistics
   */
  @Get('statistiques/enseignant/:enseignantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getStatisticsByEnseignant(
    @Param('enseignantId') enseignantId: string,
    @CurrentUser() user: any,
  ) {
    // ENSEIGNANT can only view their own stats
    if (user.role === UserRole.ENSEIGNANT && user.userId !== enseignantId) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que vos propres statistiques',
      );
    }

    return this.reponsesService.getStatisticsByEnseignant(enseignantId);
  }

  /**
   * ADMIN/ENSEIGNANT - Get comments for a matiere
   */
  @Get('commentaires/matiere/:matiereId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getCommentairesByMatiere(@Param('matiereId') matiereId: string) {
    return this.reponsesService.getCommentairesByMatiere(matiereId);
  }

  /**
   * ADMIN/ENSEIGNANT - Get comments for an enseignant
   * ENSEIGNANT can only view their own comments
   */
  @Get('commentaires/enseignant/:enseignantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ENSEIGNANT)
  async getCommentairesByEnseignant(
    @Param('enseignantId') enseignantId: string,
    @CurrentUser() user: any,
  ) {
    // ENSEIGNANT can only view their own comments
    if (user.role === UserRole.ENSEIGNANT && user.userId !== enseignantId) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que vos propres commentaires',
      );
    }

    return this.reponsesService.getCommentairesByEnseignant(enseignantId);
  }
}
