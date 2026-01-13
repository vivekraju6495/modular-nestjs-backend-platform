import { MigrationInterface, QueryRunner } from "typeorm";

export class ContactEmail1758187522788 implements MigrationInterface {
    name = 'ContactEmail1758187522788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the old unique constraint or index if it exists
        await queryRunner.query(`
            ALTER TABLE lib_contacts DROP CONSTRAINT IF EXISTS "UQ_910ff5c0dcac8f872ad9b900003";
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "UQ_contact_email_not_deleted";
        `);

        // Create a partial unique index (only on non-deleted contacts)
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_contact_email_not_deleted"
            ON lib_contacts (email)
            WHERE deleted_at IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the partial index
        await queryRunner.query(`
            DROP INDEX IF EXISTS "UQ_contact_email_not_deleted";
        `);

        // Recreate the original unique constraint
        await queryRunner.query(`
            ALTER TABLE lib_contacts
            ADD CONSTRAINT "UQ_910ff5c0dcac8f872ad9b900003" UNIQUE (email);
        `);
    }
}
