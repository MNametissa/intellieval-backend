import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReponsesTable1766411000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create reponses table
    await queryRunner.createTable(
      new Table({
        name: 'reponses',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'campagne_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'question_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'filiere_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'matiere_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'enseignant_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'noteEtoiles',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'commentaire',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'reponses',
      new TableIndex({
        name: 'IDX_reponses_campagne_question',
        columnNames: ['campagne_id', 'question_id'],
      }),
    );

    await queryRunner.createIndex(
      'reponses',
      new TableIndex({
        name: 'IDX_reponses_campagne_matiere',
        columnNames: ['campagne_id', 'matiere_id'],
      }),
    );

    await queryRunner.createIndex(
      'reponses',
      new TableIndex({
        name: 'IDX_reponses_campagne_enseignant',
        columnNames: ['campagne_id', 'enseignant_id'],
      }),
    );

    await queryRunner.createIndex(
      'reponses',
      new TableIndex({
        name: 'IDX_reponses_filiere',
        columnNames: ['filiere_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'reponses',
      new TableForeignKey({
        columnNames: ['campagne_id'],
        referencedTableName: 'campagnes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reponses',
      new TableForeignKey({
        columnNames: ['question_id'],
        referencedTableName: 'questions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reponses',
      new TableForeignKey({
        columnNames: ['filiere_id'],
        referencedTableName: 'filieres',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reponses',
      new TableForeignKey({
        columnNames: ['matiere_id'],
        referencedTableName: 'matieres',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reponses',
      new TableForeignKey({
        columnNames: ['enseignant_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reponses');
  }
}
