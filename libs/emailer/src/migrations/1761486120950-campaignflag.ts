import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignSentFlag1761486120950 implements MigrationInterface {
    name = 'CampaignSentFlag1761486120950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ADD "is_sent" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns" DROP COLUMN "is_sent"
        `);
    }

}
