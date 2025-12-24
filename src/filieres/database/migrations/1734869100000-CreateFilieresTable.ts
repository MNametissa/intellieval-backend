import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateFilieresTable1734869100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'filieres',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'department_id',
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
      'filieres',
      new TableIndex({
        name: 'IDX_filieres_department_id',
        columnNames: ['department_id'],
      }),
    );

    await queryRunner.createIndex(
      'filieres',
      new TableIndex({
        name: 'IDX_filieres_name_department_id',
        columnNames: ['name', 'department_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'filieres',
      new TableForeignKey({
        name: 'FK_filieres_department',
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'departments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('filieres', 'FK_filieres_department');
    await queryRunner.dropIndex('filieres', 'IDX_filieres_name_department_id');
    await queryRunner.dropIndex('filieres', 'IDX_filieres_department_id');
    await queryRunner.dropTable('filieres');
  }
}
