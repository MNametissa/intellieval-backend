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
import { MatieresService } from './matieres.service';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';
import { FilterMatiereDto } from './dto/filter-matiere.dto';
import { AssignEnseignantDto } from './dto/assign-enseignant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/enums/user-role.enum';

@Controller('matieres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatieresController {
  constructor(private readonly matieresService: MatieresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMatiereDto: CreateMatiereDto) {
    return this.matieresService.create(createMatiereDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterMatiereDto) {
    return this.matieresService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matieresService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateMatiereDto: UpdateMatiereDto) {
    return this.matieresService.update(id, updateMatiereDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.matieresService.remove(id);
  }

  @Post(':id/enseignants')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  assignEnseignant(
    @Param('id') id: string,
    @Body() assignEnseignantDto: AssignEnseignantDto,
  ) {
    return this.matieresService.assignEnseignant(
      id,
      assignEnseignantDto.enseignantId,
    );
  }

  @Delete(':id/enseignants/:enseignantId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  unassignEnseignant(
    @Param('id') id: string,
    @Param('enseignantId') enseignantId: string,
  ) {
    return this.matieresService.unassignEnseignant(id, enseignantId);
  }
}
