import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCampagnesTable1734870000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campagnes',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'titre',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'date_debut',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'date_fin',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'statut',
            type: 'enum',
            enum: ['inactive', 'active', 'cloturee'],
            default: "'inactive'",
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
      'campagnes',
      new TableIndex({
        name: 'IDX_campagnes_questionnaire_id',
        columnNames: ['questionnaire_id'],
      }),
    );

    await queryRunner.createIndex(
      'campagnes',
      new TableIndex({
        name: 'IDX_campagnes_statut',
        columnNames: ['statut'],
      }),
    );

    await queryRunner.createIndex(
      'campagnes',
      new TableIndex({
        name: 'IDX_campagnes_dates',
        columnNames: ['date_debut', 'date_fin'],
      }),
    );

    await queryRunner.createForeignKey(
      'campagnes',
      new TableForeignKey({
        name: 'FK_campagnes_questionnaire',
        columnNames: ['questionnaire_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'questionnaires',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('campagnes', 'FK_campagnes_questionnaire');
    await queryRunner.dropIndex('campagnes', 'IDX_campagnes_dates');
    await queryRunner.dropIndex('campagnes', 'IDX_campagnes_statut');
    await queryRunner.dropIndex('campagnes', 'IDX_campagnes_questionnaire_id');
    await queryRunner.dropTable('campagnes');
  }
}
