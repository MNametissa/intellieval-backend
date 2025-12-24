import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FilieresService } from './filieres.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { FilterFiliereDto } from './dto/filter-filiere.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/enums/user-role.enum';

@Controller('filieres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilieresController {
  constructor(private readonly filieresService: FilieresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFiliereDto: CreateFiliereDto) {
    return this.filieresService.create(createFiliereDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterFiliereDto) {
    return this.filieresService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filieresService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateFiliereDto: UpdateFiliereDto,
  ) {
    return this.filieresService.update(id, updateFiliereDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.filieresService.remove(id);
  }
}
