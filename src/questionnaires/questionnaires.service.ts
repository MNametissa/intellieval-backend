import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from './entities/question.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { FilterQuestionnaireDto } from './dto/filter-questionnaire.dto';
import {
  QuestionnaireCreatedEvent,
  QuestionnaireUpdatedEvent,
  QuestionnaireDeletedEvent,
} from '../shared/events/questionnaire.events';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const { questions, ...questionnaireData } = createQuestionnaireDto;

    const questionnaire = this.questionnaireRepository.create(questionnaireData);

    if (questions && questions.length > 0) {
      questionnaire.questions = questions.map((q) =>
        this.questionRepository.create(q),
      );
    }

    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire);

    this.eventEmitter.emit(
      'questionnaire.created',
      new QuestionnaireCreatedEvent(
        savedQuestionnaire.id,
        savedQuestionnaire.titre,
        savedQuestionnaire.questions?.length || 0,
      ),
    );

    return savedQuestionnaire;
  }

  async findAll(filterDto: FilterQuestionnaireDto): Promise<{
    data: Questionnaire[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.questionnaireRepository
      .createQueryBuilder('questionnaire')
      .leftJoinAndSelect('questionnaire.questions', 'questions')
      .orderBy('questions.ordre', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        '(questionnaire.titre LIKE :search OR questionnaire.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('questionnaire.createdAt', 'DESC')
      .addOrderBy('questions.ordre', 'ASC')
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Questionnaire> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
      relations: ['questions'],
      order: {
        questions: {
          ordre: 'ASC',
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }

    return questionnaire;
  }

  async update(
    id: string,
    updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const questionnaire = await this.findOne(id);

    const { questions, ...questionnaireData } = updateQuestionnaireDto;

    Object.assign(questionnaire, questionnaireData);

    if (questions !== undefined) {
      // Supprimer les anciennes questions
      if (questionnaire.questions && questionnaire.questions.length > 0) {
        await this.questionRepository.remove(questionnaire.questions);
      }

      // Créer les nouvelles questions
      if (questions.length > 0) {
        questionnaire.questions = questions.map((q) =>
          this.questionRepository.create(q),
        );
      } else {
        questionnaire.questions = [];
      }
    }

    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire);

    this.eventEmitter.emit(
      'questionnaire.updated',
      new QuestionnaireUpdatedEvent(
        savedQuestionnaire.id,
        savedQuestionnaire.titre,
        savedQuestionnaire.questions?.length || 0,
      ),
    );

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const questionnaire = await this.findOne(id);

    await this.questionnaireRepository.remove(questionnaire);

    this.eventEmitter.emit(
      'questionnaire.deleted',
      new QuestionnaireDeletedEvent(questionnaire.id, questionnaire.titre),
    );
  }
}
