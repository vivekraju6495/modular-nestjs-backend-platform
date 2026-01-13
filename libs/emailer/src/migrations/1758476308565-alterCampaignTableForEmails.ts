import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterCampaignTableForEmails1758476308565 implements MigrationInterface {
    name = 'AlterCampaignTableForEmails1758476308565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ADD "emails" jsonb NOT NULL DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ALTER COLUMN "audience"
            SET DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns" DROP COLUMN "created_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ADD "created_by" bigint
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns" DROP COLUMN "created_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ADD "created_by" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ALTER COLUMN "audience" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns" DROP COLUMN "emails"
        `);
    }

}
