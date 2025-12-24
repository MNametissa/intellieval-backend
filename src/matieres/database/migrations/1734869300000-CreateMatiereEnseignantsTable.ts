import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateMatiereEnseignantsTable1734869300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'matiere_enseignants',
        columns: [
          {
            name: 'matiere_id',
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
      'matiere_enseignants',
      new TableIndex({
        name: 'IDX_matiere_enseignants_matiere_id',
        columnNames: ['matiere_id'],
      }),
    );

    await queryRunner.createIndex(
      'matiere_enseignants',
      new TableIndex({
        name: 'IDX_matiere_enseignants_enseignant_id',
        columnNames: ['enseignant_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'matiere_enseignants',
      new TableForeignKey({
        name: 'FK_matiere_enseignants_matiere',
        columnNames: ['matiere_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'matieres',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matiere_enseignants',
      new TableForeignKey({
        name: 'FK_matiere_enseignants_enseignant',
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
      'matiere_enseignants',
      'FK_matiere_enseignants_enseignant',
    );
    await queryRunner.dropForeignKey(
      'matiere_enseignants',
      'FK_matiere_enseignants_matiere',
    );
    await queryRunner.dropIndex(
      'matiere_enseignants',
      'IDX_matiere_enseignants_enseignant_id',
    );
    await queryRunner.dropIndex(
      'matiere_enseignants',
      'IDX_matiere_enseignants_matiere_id',
    );
    await queryRunner.dropTable('matiere_enseignants');
  }
}
