import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCampagneEnseignantsTable1734870200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campagne_enseignants',
        columns: [
          {
            name: 'campagne_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'enseignant_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'campagne_enseignants',
      new TableIndex({
        name: 'IDX_campagne_enseignants_campagne',
        columnNames: ['campagne_id'],
      }),
    );

    await queryRunner.createIndex(
      'campagne_enseignants',
      new TableIndex({
        name: 'IDX_campagne_enseignants_enseignant',
        columnNames: ['enseignant_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'campagne_enseignants',
      new TableForeignKey({
        name: 'FK_campagne_enseignants_campagne',
        columnNames: ['campagne_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'campagnes',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'campagne_enseignants',
      new TableForeignKey({
        name: 'FK_campagne_enseignants_enseignant',
        columnNames: ['enseignant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'campagne_enseignants',
      'FK_campagne_enseignants_enseignant',
    );
    await queryRunner.dropForeignKey(
      'campagne_enseignants',
      'FK_campagne_enseignants_campagne',
    );
    await queryRunner.dropIndex(
      'campagne_enseignants',
      'IDX_campagne_enseignants_enseignant',
    );
    await queryRunner.dropIndex(
      'campagne_enseignants',
      'IDX_campagne_enseignants_campagne',
    );
    await queryRunner.dropTable('campagne_enseignants');
  }
}
