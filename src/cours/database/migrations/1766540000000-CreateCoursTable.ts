import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateCoursTable1766540000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cours',
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
            name: 'file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'matiere_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'enseignant_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'cours',
      new TableIndex({
        name: 'IDX_cours_matiere',
        columnNames: ['matiere_id'],
      }),
    );

    await queryRunner.createIndex(
      'cours',
      new TableIndex({
        name: 'IDX_cours_enseignant',
        columnNames: ['enseignant_id'],
      }),
    );

    await queryRunner.createIndex(
      'cours',
      new TableIndex({
        name: 'IDX_cours_titre',
        columnNames: ['titre'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'cours',
      new TableForeignKey({
        columnNames: ['matiere_id'],
        referencedTableName: 'matieres',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cours',
      new TableForeignKey({
        columnNames: ['enseignant_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cours');
  }
}
