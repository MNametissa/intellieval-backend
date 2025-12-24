import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CoursService } from './cours.service';
import { UploadCoursDto } from './dto/upload-cours.dto';
import { UpdateCoursDto } from './dto/update-cours.dto';
import { FilterCoursDto } from './dto/filter-cours.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import * as fs from 'fs';

@Controller('cours')
@UseGuards(JwtAuthGuard)
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ENSEIGNANT, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @Body() uploadCoursDto: UploadCoursDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.coursService.upload(uploadCoursDto, file, user.userId);
  }

  @Get()
  async findAll(@Query() filterDto: FilterCoursDto, @CurrentUser() user: any) {
    return this.coursService.findAll(filterDto, user.userId, user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursService.findOne(id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    // Check access permissions
    const canAccess = await this.coursService.canAccess(
      id,
      user.userId,
      user.role,
      user.filiereId,
    );

    if (!canAccess) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à ce cours",
      );
    }

    const cours = await this.coursService.findOne(id);
    const filePath = await this.coursService.getFilePath(id);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ForbiddenException('Fichier introuvable');
    }

    // Set headers for download
    res.setHeader('Content-Type', cours.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(cours.fileName)}"`,
    );
    res.setHeader('Content-Length', cours.fileSize);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ENSEIGNANT, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCoursDto: UpdateCoursDto,
    @CurrentUser() user: any,
  ) {
    return this.coursService.update(id, updateCoursDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ENSEIGNANT, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.coursService.remove(id, user.userId, isAdmin);
  }
}
