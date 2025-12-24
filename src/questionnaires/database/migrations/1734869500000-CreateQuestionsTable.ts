import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateQuestionsTable1734869500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'questions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'texte',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['etoiles', 'commentaire'],
            isNullable: false,
          },
          {
            name: 'ordre',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'obligatoire',
            type: 'boolean',
            default: false,
          },
          {
            name: 'questionnaire_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'questions',
      new TableIndex({
        name: 'IDX_questions_questionnaire_id',
        columnNames: ['questionnaire_id'],
      }),
    );

    await queryRunner.createIndex(
      'questions',
      new TableIndex({
        name: 'IDX_questions_ordre',
        columnNames: ['questionnaire_id', 'ordre'],
      }),
    );

    await queryRunner.createForeignKey(
      'questions',
      new TableForeignKey({
        name: 'FK_questions_questionnaire',
        columnNames: ['questionnaire_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'questionnaires',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('questions', 'FK_questions_questionnaire');
    await queryRunner.dropIndex('questions', 'IDX_questions_ordre');
    await queryRunner.dropIndex('questions', 'IDX_questions_questionnaire_id');
    await queryRunner.dropTable('questions');
  }
}
