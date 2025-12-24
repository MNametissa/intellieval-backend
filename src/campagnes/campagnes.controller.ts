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
import { CampagnesService } from './campagnes.service';
import { CreateCampagneDto } from './dto/create-campagne.dto';
import { UpdateCampagneDto } from './dto/update-campagne.dto';
import { FilterCampagneDto } from './dto/filter-campagne.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/enums/user-role.enum';

@Controller('campagnes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampagnesController {
  constructor(private readonly campagnesService: CampagnesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCampagneDto: CreateCampagneDto) {
    return this.campagnesService.create(createCampagneDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterCampagneDto) {
    return this.campagnesService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campagnesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateCampagneDto: UpdateCampagneDto) {
    return this.campagnesService.update(id, updateCampagneDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.campagnesService.remove(id);
  }
}
