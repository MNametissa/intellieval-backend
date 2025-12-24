import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCampagneMatieresTable1734870100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campagne_matieres',
        columns: [
          {
            name: 'campagne_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'matiere_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'campagne_matieres',
      new TableIndex({
        name: 'IDX_campagne_matieres_campagne',
        columnNames: ['campagne_id'],
      }),
    );

    await queryRunner.createIndex(
      'campagne_matieres',
      new TableIndex({
        name: 'IDX_campagne_matieres_matiere',
        columnNames: ['matiere_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'campagne_matieres',
      new TableForeignKey({
        name: 'FK_campagne_matieres_campagne',
        columnNames: ['campagne_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'campagnes',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'campagne_matieres',
      new TableForeignKey({
        name: 'FK_campagne_matieres_matiere',
        columnNames: ['matiere_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'matieres',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'campagne_matieres',
      'FK_campagne_matieres_matiere',
    );
    await queryRunner.dropForeignKey(
      'campagne_matieres',
      'FK_campagne_matieres_campagne',
    );
    await queryRunner.dropIndex(
      'campagne_matieres',
      'IDX_campagne_matieres_matiere',
    );
    await queryRunner.dropIndex(
      'campagne_matieres',
      'IDX_campagne_matieres_campagne',
    );
    await queryRunner.dropTable('campagne_matieres');
  }
}
