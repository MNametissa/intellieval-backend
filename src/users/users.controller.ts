import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UserImportService } from './user-import.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userImportService: UserImportService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(
    @UploadedFile() file: Express.Multer.File,
    @Body('departmentMap') departmentMapJson: string,
    @Body('filiereMap') filiereMapJson: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const departmentMap = new Map<string, string>(
      JSON.parse(departmentMapJson || '[]'),
    );
    const filiereMap = new Map<string, string>(
      JSON.parse(filiereMapJson || '[]'),
    );

    const content = file.buffer.toString('utf-8');
    const rows = this.userImportService.parseCSV(content);

    return this.userImportService.importUsers(
      rows,
      departmentMap,
      filiereMap,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('role') role?: UserRole,
    @Query('departmentId') departmentId?: string,
    @Query('filiereId') filiereId?: string,
  ) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    if (departmentId) {
      return this.usersService.findByDepartment(departmentId);
    }
    if (filiereId) {
      return this.usersService.findByFiliere(filiereId);
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
