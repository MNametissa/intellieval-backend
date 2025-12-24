import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Campagne } from './entities/campagne.entity';
import { CampagnesRepository } from './campagnes.repository';
import { CreateCampagneDto } from './dto/create-campagne.dto';
import { UpdateCampagneDto } from './dto/update-campagne.dto';
import { FilterCampagneDto } from './dto/filter-campagne.dto';
import { CampagneStatut } from '../shared/enums/campagne-statut.enum';
import {
  CampagneCreatedEvent,
  CampagneUpdatedEvent,
  CampagneDeletedEvent,
  CampagneActivatedEvent,
  CampagneClosedEvent,
  MatiereAddedToCampagneEvent,
  EnseignantAddedToCampagneEvent,
} from '../shared/events/campagne.events';
import { Matiere } from '../matieres/entities/matiere.entity';
import { User } from '../users/entities/user.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';

@Injectable()
export class CampagnesService {
  constructor(
    private readonly repository: CampagnesRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
  ) {}

  async create(createCampagneDto: CreateCampagneDto): Promise<Campagne> {
    const {
      titre,
      description,
      dateDebut,
      dateFin,
      questionnaireId,
      matiereIds = [],
      enseignantIds = [],
    } = createCampagneDto;

    // Validate dates
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin',
      );
    }

    // Validate questionnaire exists
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: questionnaireId },
    });
    if (!questionnaire) {
      throw new NotFoundException('Questionnaire non trouvé');
    }

    // Validate targeting (at least one matiere OR one enseignant)
    if (matiereIds.length === 0 && enseignantIds.length === 0) {
      throw new BadRequestException(
        'Une campagne doit cibler au moins une matière ou un enseignant',
      );
    }

    // Load matieres if provided
    let matieres: Matiere[] = [];
    if (matiereIds.length > 0) {
      matieres = await this.matiereRepository.find({
        where: { id: In(matiereIds) },
      });
      if (matieres.length !== matiereIds.length) {
        throw new NotFoundException('Une ou plusieurs matières non trouvées');
      }
    }

    // Load enseignants if provided
    let enseignants: User[] = [];
    if (enseignantIds.length > 0) {
      enseignants = await this.userRepository.find({
        where: { id: In(enseignantIds) },
      });
      if (enseignants.length !== enseignantIds.length) {
        throw new NotFoundException('Un ou plusieurs enseignants non trouvés');
      }
    }

    // Determine initial status based on dates
    const now = new Date();
    let statut = CampagneStatut.INACTIVE;
    if (now >= startDate && now <= endDate) {
      statut = CampagneStatut.ACTIVE;
    } else if (now > endDate) {
      statut = CampagneStatut.CLOTUREE;
    }

    // Create campagne
    const campagne = await this.repository.create({
      titre,
      description,
      dateDebut: startDate,
      dateFin: endDate,
      statut,
      questionnaireId,
      matieres,
      enseignants,
    });

    // Emit events
    this.eventEmitter.emit(
      'campagne.created',
      new CampagneCreatedEvent(
        campagne.id,
        campagne.titre,
        campagne.dateDebut,
        campagne.dateFin,
        campagne.questionnaireId,
      ),
    );

    // Emit events for each matiere added
    matieres.forEach((matiere) => {
      this.eventEmitter.emit(
        'matiere.added.to.campagne',
        new MatiereAddedToCampagneEvent(campagne.id, matiere.id),
      );
    });

    // Emit events for each enseignant added
    enseignants.forEach((enseignant) => {
      this.eventEmitter.emit(
        'enseignant.added.to.campagne',
        new EnseignantAddedToCampagneEvent(campagne.id, enseignant.id),
      );
    });

    // Emit activation event if created as active
    if (statut === CampagneStatut.ACTIVE) {
      this.eventEmitter.emit(
        'campagne.activated',
        new CampagneActivatedEvent(
          campagne.id,
          campagne.titre,
          campagne.dateDebut,
        ),
      );
    }

    return campagne;
  }

  async findAll(filterDto: FilterCampagneDto): Promise<{
    data: Campagne[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      statut,
      questionnaireId,
      matiereId,
      enseignantId,
      dateDebutMin,
      dateDebutMax,
      dateFinMin,
      dateFinMax,
      page = 1,
      limit = 10,
    } = filterDto;

    const queryBuilder = this.repository
      .getRepository()
      .createQueryBuilder('campagne')
      .leftJoinAndSelect('campagne.questionnaire', 'questionnaire')
      .leftJoinAndSelect('campagne.matieres', 'matieres')
      .leftJoinAndSelect('campagne.enseignants', 'enseignants');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(campagne.titre LIKE :search OR campagne.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by status
    if (statut) {
      queryBuilder.andWhere('campagne.statut = :statut', { statut });
    }

    // Filter by questionnaire
    if (questionnaireId) {
      queryBuilder.andWhere('campagne.questionnaireId = :questionnaireId', {
        questionnaireId,
      });
    }

    // Filter by matiere
    if (matiereId) {
      queryBuilder.andWhere('matieres.id = :matiereId', { matiereId });
    }

    // Filter by enseignant
    if (enseignantId) {
      queryBuilder.andWhere('enseignants.id = :enseignantId', {
        enseignantId,
      });
    }

    // Filter by date debut range
    if (dateDebutMin) {
      queryBuilder.andWhere('campagne.dateDebut >= :dateDebutMin', {
        dateDebutMin: new Date(dateDebutMin),
      });
    }
    if (dateDebutMax) {
      queryBuilder.andWhere('campagne.dateDebut <= :dateDebutMax', {
        dateDebutMax: new Date(dateDebutMax),
      });
    }

    // Filter by date fin range
    if (dateFinMin) {
      queryBuilder.andWhere('campagne.dateFin >= :dateFinMin', {
        dateFinMin: new Date(dateFinMin),
      });
    }
    if (dateFinMax) {
      queryBuilder.andWhere('campagne.dateFin <= :dateFinMax', {
        dateFinMax: new Date(dateFinMax),
      });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('campagne.createdAt', 'DESC')
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Campagne> {
    const campagne = await this.repository.findById(id);
    if (!campagne) {
      throw new NotFoundException('Campagne non trouvée');
    }

    // Update status based on current date
    await this.updateStatusBasedOnDates(campagne);

    return campagne;
  }

  async update(
    id: string,
    updateCampagneDto: UpdateCampagneDto,
  ): Promise<Campagne> {
    const campagne = await this.findOne(id);

    const {
      titre,
      description,
      dateDebut,
      dateFin,
      questionnaireId,
      matiereIds,
      enseignantIds,
      statut,
    } = updateCampagneDto;

    // Validate dates if provided
    if (dateDebut || dateFin) {
      const startDate = dateDebut
        ? new Date(dateDebut)
        : campagne.dateDebut;
      const endDate = dateFin ? new Date(dateFin) : campagne.dateFin;

      if (startDate >= endDate) {
        throw new BadRequestException(
          'La date de début doit être antérieure à la date de fin',
        );
      }

      if (dateDebut) campagne.dateDebut = startDate;
      if (dateFin) campagne.dateFin = endDate;
    }

    // Update basic fields
    if (titre !== undefined) campagne.titre = titre;
    if (description !== undefined) campagne.description = description;
    if (questionnaireId !== undefined) {
      const questionnaire = await this.questionnaireRepository.findOne({
        where: { id: questionnaireId },
      });
      if (!questionnaire) {
        throw new NotFoundException('Questionnaire non trouvé');
      }
      campagne.questionnaireId = questionnaireId;
    }

    // Update matieres if provided
    if (matiereIds !== undefined) {
      if (matiereIds.length > 0) {
        const matieres = await this.matiereRepository.find({
          where: { id: In(matiereIds) },
        });
        if (matieres.length !== matiereIds.length) {
          throw new NotFoundException(
            'Une ou plusieurs matières non trouvées',
          );
        }
        campagne.matieres = matieres;

        // Emit events
        matieres.forEach((matiere) => {
          this.eventEmitter.emit(
            'matiere.added.to.campagne',
            new MatiereAddedToCampagneEvent(campagne.id, matiere.id),
          );
        });
      } else {
        campagne.matieres = [];
      }
    }

    // Update enseignants if provided
    if (enseignantIds !== undefined) {
      if (enseignantIds.length > 0) {
        const enseignants = await this.userRepository.find({
          where: { id: In(enseignantIds) },
        });
        if (enseignants.length !== enseignantIds.length) {
          throw new NotFoundException(
            'Un ou plusieurs enseignants non trouvés',
          );
        }
        campagne.enseignants = enseignants;

        // Emit events
        enseignants.forEach((enseignant) => {
          this.eventEmitter.emit(
            'enseignant.added.to.campagne',
            new EnseignantAddedToCampagneEvent(campagne.id, enseignant.id),
          );
        });
      } else {
        campagne.enseignants = [];
      }
    }

    // Validate targeting
    if (campagne.matieres.length === 0 && campagne.enseignants.length === 0) {
      throw new BadRequestException(
        'Une campagne doit cibler au moins une matière ou un enseignant',
      );
    }

    // Update status if explicitly provided or based on dates
    const previousStatut = campagne.statut;
    if (statut !== undefined) {
      campagne.statut = statut;
    } else {
      await this.updateStatusBasedOnDates(campagne);
    }

    const updated = await this.repository.save(campagne);

    // Emit update event
    this.eventEmitter.emit(
      'campagne.updated',
      new CampagneUpdatedEvent(updated.id, updated.titre, updated.statut),
    );

    // Emit activation event if status changed to ACTIVE
    if (
      previousStatut !== CampagneStatut.ACTIVE &&
      updated.statut === CampagneStatut.ACTIVE
    ) {
      this.eventEmitter.emit(
        'campagne.activated',
        new CampagneActivatedEvent(
          updated.id,
          updated.titre,
          updated.dateDebut,
        ),
      );
    }

    // Emit closed event if status changed to CLOTUREE
    if (
      previousStatut !== CampagneStatut.CLOTUREE &&
      updated.statut === CampagneStatut.CLOTUREE
    ) {
      this.eventEmitter.emit(
        'campagne.closed',
        new CampagneClosedEvent(
          updated.id,
          updated.titre,
          updated.dateFin,
        ),
      );
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const campagne = await this.findOne(id);

    await this.repository.delete(id);

    this.eventEmitter.emit(
      'campagne.deleted',
      new CampagneDeletedEvent(campagne.id, campagne.titre),
    );
  }

  private async updateStatusBasedOnDates(
    campagne: Campagne,
  ): Promise<void> {
    const now = new Date();
    const previousStatut = campagne.statut;
    let newStatut = campagne.statut;

    if (now < campagne.dateDebut) {
      newStatut = CampagneStatut.INACTIVE;
    } else if (now >= campagne.dateDebut && now <= campagne.dateFin) {
      newStatut = CampagneStatut.ACTIVE;
    } else {
      newStatut = CampagneStatut.CLOTUREE;
    }

    if (newStatut !== previousStatut) {
      campagne.statut = newStatut;
      await this.repository.save(campagne);

      // Emit events for status changes
      if (newStatut === CampagneStatut.ACTIVE) {
        this.eventEmitter.emit(
          'campagne.activated',
          new CampagneActivatedEvent(
            campagne.id,
            campagne.titre,
            campagne.dateDebut,
          ),
        );
      } else if (newStatut === CampagneStatut.CLOTUREE) {
        this.eventEmitter.emit(
          'campagne.closed',
          new CampagneClosedEvent(
            campagne.id,
            campagne.titre,
            campagne.dateFin,
          ),
        );
      }
    }
  }
}
