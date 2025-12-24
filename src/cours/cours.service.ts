import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursRepository } from './cours.repository';
import { UploadCoursDto } from './dto/upload-cours.dto';
import { UpdateCoursDto } from './dto/update-cours.dto';
import { FilterCoursDto } from './dto/filter-cours.dto';
import {
  CoursUploadedEvent,
  CoursDeletedEvent,
  CoursUpdatedEvent,
} from '../shared/events/cours.events';
import { Matiere } from '../matieres/entities/matiere.entity';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class CoursService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'cours');
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  private readonly maxFileSize = 50 * 1024 * 1024; // 50 MB

  constructor(
    private readonly repository: CoursRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
  ) {
    this.ensureUploadDirectoryExists();
  }

  private async ensureUploadDirectoryExists() {
    try {
      await mkdirAsync(this.uploadPath, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async upload(
    uploadDto: UploadCoursDto,
    file: Express.Multer.File,
    enseignantId: string,
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Type de fichier non autorisé. Formats acceptés: PDF, PPT, PPTX, DOC, DOCX',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'Fichier trop volumineux. Taille maximale: 50 MB',
      );
    }

    // Verify matiere exists and enseignant is assigned to it
    const matiere = await this.matiereRepository.findOne({
      where: { id: uploadDto.matiereId },
      relations: ['enseignants'],
    });

    if (!matiere) {
      throw new NotFoundException('Matière non trouvée');
    }

    const isAssigned = matiere.enseignants?.some(
      (ens) => ens.id === enseignantId,
    );

    if (!isAssigned) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à uploader des cours pour cette matière",
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(this.uploadPath, filename);

    // Save file
    await fs.promises.writeFile(filePath, file.buffer);

    // Save to database
    const cours = await this.repository.create({
      titre: uploadDto.titre,
      description: uploadDto.description,
      filePath: filename, // Store only filename, not full path
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      matiereId: uploadDto.matiereId,
      enseignantId,
    });

    // Emit event
    this.eventEmitter.emit(
      'cours.uploaded',
      new CoursUploadedEvent(
        cours.id,
        cours.titre,
        cours.matiereId,
        enseignantId,
        cours.createdAt,
      ),
    );

    return cours;
  }

  async findAll(filterDto: FilterCoursDto, userId?: string, userRole?: string) {
    const { page = 1, limit = 10, ...filters } = filterDto;

    const [data, total] = await this.repository.findAll(filters, page, limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const cours = await this.repository.findById(id);
    if (!cours) {
      throw new NotFoundException('Cours non trouvé');
    }
    return cours;
  }

  async update(id: string, updateDto: UpdateCoursDto, enseignantId: string) {
    const cours = await this.findOne(id);

    // Verify ownership
    if (cours.enseignantId !== enseignantId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres cours',
      );
    }

    const updated = await this.repository.update(id, updateDto);

    this.eventEmitter.emit(
      'cours.updated',
      new CoursUpdatedEvent(
        updated.id,
        updated.titre,
        updated.matiereId,
        updated.updatedAt,
      ),
    );

    return updated;
  }

  async remove(id: string, enseignantId: string, isAdmin: boolean = false) {
    const cours = await this.findOne(id);

    // Verify ownership (admin can delete any)
    if (!isAdmin && cours.enseignantId !== enseignantId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres cours',
      );
    }

    // Delete file from filesystem
    const filePath = path.join(this.uploadPath, cours.filePath);
    try {
      await unlinkAsync(filePath);
    } catch (error) {
      // File already deleted or doesn't exist, continue
    }

    // Delete from database
    await this.repository.delete(id);

    this.eventEmitter.emit(
      'cours.deleted',
      new CoursDeletedEvent(id, cours.matiereId, enseignantId, new Date()),
    );

    return { message: 'Cours supprimé avec succès' };
  }

  async getFilePath(id: string): Promise<string> {
    const cours = await this.findOne(id);
    return path.join(this.uploadPath, cours.filePath);
  }

  async canAccess(
    coursId: string,
    userId: string,
    userRole: string,
    userFiliereId: string,
  ): Promise<boolean> {
    const cours = await this.findOne(coursId);

    // Admin can access all
    if (userRole === 'ADMIN') {
      return true;
    }

    // Enseignant can access all
    if (userRole === 'ENSEIGNANT') {
      return true;
    }

    // Student can only access cours from their filiere
    if (userRole === 'ETUDIANT') {
      if (!cours.matiere?.filiereId) {
        return false;
      }
      return cours.matiere.filiereId === userFiliereId;
    }

    return false;
  }
}
