import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateMatieresTable1734869200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'matieres',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'nom',
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
            name: 'department_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'filiere_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
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
      'matieres',
      new TableIndex({
        name: 'IDX_matieres_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'matieres',
      new TableIndex({
        name: 'IDX_matieres_department_id',
        columnNames: ['department_id'],
      }),
    );

    await queryRunner.createIndex(
      'matieres',
      new TableIndex({
        name: 'IDX_matieres_filiere_id',
        columnNames: ['filiere_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'matieres',
      new TableForeignKey({
        name: 'FK_matieres_department',
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'departments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matieres',
      new TableForeignKey({
        name: 'FK_matieres_filiere',
        columnNames: ['filiere_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'filieres',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('matieres', 'FK_matieres_filiere');
    await queryRunner.dropForeignKey('matieres', 'FK_matieres_department');
    await queryRunner.dropIndex('matieres', 'IDX_matieres_filiere_id');
    await queryRunner.dropIndex('matieres', 'IDX_matieres_department_id');
    await queryRunner.dropIndex('matieres', 'IDX_matieres_code');
    await queryRunner.dropTable('matieres');
  }
}
