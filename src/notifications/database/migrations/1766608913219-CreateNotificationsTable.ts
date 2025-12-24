import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1766608913219 implements MigrationInterface {
    name = 'CreateNotificationsTable1766608913219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_09193e094bdfacb80a4efff710a\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_5a235432eb23a1c50df665a2742\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_6fffeb9f014ac2f265804adf800\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_e05fc5a9e95e9ad0ebe0bf041ad\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_eeb967498d6a7e9f64de0004634\``);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP FOREIGN KEY \`FK_2c5b761811a06e2ce6d479bd46d\``);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP FOREIGN KEY \`FK_e137ce4ff5b10b28e77dbd53e41\``);
        await queryRunner.query(`DROP INDEX \`IDX_reponses_campagne_enseignant\` ON \`reponses\``);
        await queryRunner.query(`DROP INDEX \`IDX_reponses_campagne_matiere\` ON \`reponses\``);
        await queryRunner.query(`DROP INDEX \`IDX_reponses_campagne_question\` ON \`reponses\``);
        await queryRunner.query(`DROP INDEX \`IDX_reponses_filiere\` ON \`reponses\``);
        await queryRunner.query(`DROP INDEX \`IDX_cours_enseignant\` ON \`cours\``);
        await queryRunner.query(`DROP INDEX \`IDX_cours_matiere\` ON \`cours\``);
        await queryRunner.query(`DROP INDEX \`IDX_cours_titre\` ON \`cours\``);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`type\` enum ('campagne_created', 'campagne_started', 'campagne_ending_soon', 'campagne_ended', 'cours_uploaded', 'evaluation_reminder') NOT NULL, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`status\` enum ('pending', 'sent', 'failed', 'read') NOT NULL DEFAULT 'pending', \`metadata\` json NULL, \`email_sent\` tinyint NOT NULL DEFAULT 0, \`read_at\` timestamp NULL, \`sent_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_77ee7b06d6f802000c0846f3a5\` (\`created_at\`), INDEX \`IDX_aef1c7aef3725068e5540f8f00\` (\`type\`), INDEX \`IDX_148ee02399918b869f27b9673e\` (\`user_id\`, \`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`matiere_id\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`matiere_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`enseignant_id\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`enseignant_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b6c18934c6d4e121d9a01b28cf\` ON \`cours\` (\`titre\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2c5b761811a06e2ce6d479bd46\` ON \`cours\` (\`enseignant_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e137ce4ff5b10b28e77dbd53e4\` ON \`cours\` (\`matiere_id\`)`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_63701a17ec60c100d5d87ba2953\` FOREIGN KEY (\`questionnaire_id\`) REFERENCES \`questionnaires\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matieres\` ADD CONSTRAINT \`FK_49774d66c5181f6012cb6d747dd\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matieres\` ADD CONSTRAINT \`FK_6c343fbc2dc9f7c2165bff3c5ae\` FOREIGN KEY (\`filiere_id\`) REFERENCES \`filieres\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`campagnes\` ADD CONSTRAINT \`FK_48b371c962fdd4b8d17e08c3d73\` FOREIGN KEY (\`questionnaire_id\`) REFERENCES \`questionnaires\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_5a235432eb23a1c50df665a2742\` FOREIGN KEY (\`campagne_id\`) REFERENCES \`campagnes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_6fffeb9f014ac2f265804adf800\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_eeb967498d6a7e9f64de0004634\` FOREIGN KEY (\`filiere_id\`) REFERENCES \`filieres\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_e05fc5a9e95e9ad0ebe0bf041ad\` FOREIGN KEY (\`matiere_id\`) REFERENCES \`matieres\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_09193e094bdfacb80a4efff710a\` FOREIGN KEY (\`enseignant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_9a8a82462cab47c73d25f49261f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD CONSTRAINT \`FK_e137ce4ff5b10b28e77dbd53e41\` FOREIGN KEY (\`matiere_id\`) REFERENCES \`matieres\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD CONSTRAINT \`FK_2c5b761811a06e2ce6d479bd46d\` FOREIGN KEY (\`enseignant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matiere_enseignants\` ADD CONSTRAINT \`FK_f324d095d094ff7ed567a53207c\` FOREIGN KEY (\`matiere_id\`) REFERENCES \`matieres\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`matiere_enseignants\` ADD CONSTRAINT \`FK_7445e7e653a063af126bc5eaaab\` FOREIGN KEY (\`enseignant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`campagne_matieres\` ADD CONSTRAINT \`FK_e216fb3d5d380f4c88e0d883ff1\` FOREIGN KEY (\`campagne_id\`) REFERENCES \`campagnes\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`campagne_matieres\` ADD CONSTRAINT \`FK_519b3606c9d9c9de94c4a855255\` FOREIGN KEY (\`matiere_id\`) REFERENCES \`matieres\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`campagne_enseignants\` ADD CONSTRAINT \`FK_3371c0ec3d46cc2f755d5002d29\` FOREIGN KEY (\`campagne_id\`) REFERENCES \`campagnes\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`campagne_enseignants\` ADD CONSTRAINT \`FK_a11f791338121e299644fe9b399\` FOREIGN KEY (\`enseignant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`campagne_enseignants\` DROP FOREIGN KEY \`FK_a11f791338121e299644fe9b399\``);
        await queryRunner.query(`ALTER TABLE \`campagne_enseignants\` DROP FOREIGN KEY \`FK_3371c0ec3d46cc2f755d5002d29\``);
        await queryRunner.query(`ALTER TABLE \`campagne_matieres\` DROP FOREIGN KEY \`FK_519b3606c9d9c9de94c4a855255\``);
        await queryRunner.query(`ALTER TABLE \`campagne_matieres\` DROP FOREIGN KEY \`FK_e216fb3d5d380f4c88e0d883ff1\``);
        await queryRunner.query(`ALTER TABLE \`matiere_enseignants\` DROP FOREIGN KEY \`FK_7445e7e653a063af126bc5eaaab\``);
        await queryRunner.query(`ALTER TABLE \`matiere_enseignants\` DROP FOREIGN KEY \`FK_f324d095d094ff7ed567a53207c\``);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP FOREIGN KEY \`FK_2c5b761811a06e2ce6d479bd46d\``);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP FOREIGN KEY \`FK_e137ce4ff5b10b28e77dbd53e41\``);
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_9a8a82462cab47c73d25f49261f\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_09193e094bdfacb80a4efff710a\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_e05fc5a9e95e9ad0ebe0bf041ad\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_eeb967498d6a7e9f64de0004634\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_6fffeb9f014ac2f265804adf800\``);
        await queryRunner.query(`ALTER TABLE \`reponses\` DROP FOREIGN KEY \`FK_5a235432eb23a1c50df665a2742\``);
        await queryRunner.query(`ALTER TABLE \`campagnes\` DROP FOREIGN KEY \`FK_48b371c962fdd4b8d17e08c3d73\``);
        await queryRunner.query(`ALTER TABLE \`matieres\` DROP FOREIGN KEY \`FK_6c343fbc2dc9f7c2165bff3c5ae\``);
        await queryRunner.query(`ALTER TABLE \`matieres\` DROP FOREIGN KEY \`FK_49774d66c5181f6012cb6d747dd\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_63701a17ec60c100d5d87ba2953\``);
        await queryRunner.query(`DROP INDEX \`IDX_e137ce4ff5b10b28e77dbd53e4\` ON \`cours\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c5b761811a06e2ce6d479bd46\` ON \`cours\``);
        await queryRunner.query(`DROP INDEX \`IDX_b6c18934c6d4e121d9a01b28cf\` ON \`cours\``);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`enseignant_id\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`enseignant_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cours\` DROP COLUMN \`matiere_id\``);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD \`matiere_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_148ee02399918b869f27b9673e\` ON \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_aef1c7aef3725068e5540f8f00\` ON \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_77ee7b06d6f802000c0846f3a5\` ON \`notifications\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`CREATE INDEX \`IDX_cours_titre\` ON \`cours\` (\`titre\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cours_matiere\` ON \`cours\` (\`matiere_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cours_enseignant\` ON \`cours\` (\`enseignant_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_reponses_filiere\` ON \`reponses\` (\`filiere_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_reponses_campagne_question\` ON \`reponses\` (\`campagne_id\`, \`question_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_reponses_campagne_matiere\` ON \`reponses\` (\`campagne_id\`, \`matiere_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_reponses_campagne_enseignant\` ON \`reponses\` (\`campagne_id\`, \`enseignant_id\`)`);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD CONSTRAINT \`FK_e137ce4ff5b10b28e77dbd53e41\` FOREIGN KEY (\`matiere_id\`) REFERENCES \`matieres\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cours\` ADD CONSTRAINT \`FK_2c5b761811a06e2ce6d479bd46d\` FOREIGN KEY (\`enseignant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_eeb967498d6a7e9f64de0004634\` FOREIGN KEY (\`filiere_id\`) REFERENCES \`filieres\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_e05fc5a9e95e9ad0ebe0bf041ad\` FOREIGN KEY (\`matiere_id\`) REFERENCES \`matieres\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_6fffeb9f014ac2f265804adf800\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_5a235432eb23a1c50df665a2742\` FOREIGN KEY (\`campagne_id\`) REFERENCES \`campagnes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses\` ADD CONSTRAINT \`FK_09193e094bdfacb80a4efff710a\` FOREIGN KEY (\`enseignant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
