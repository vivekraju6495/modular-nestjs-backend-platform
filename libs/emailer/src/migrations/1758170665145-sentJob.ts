import { MigrationInterface, QueryRunner } from "typeorm";

export class SentJob1758170665145 implements MigrationInterface {
    name = 'SentJob1758170665145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."lib_emailer_email_send_jobs_status_enum" AS ENUM('queued', 'sent', 'failed', 'cancelled')
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_emailer_email_send_jobs" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "campaign_id" bigint NOT NULL,
                "recipient_contact_id" uuid,
                "email" character varying(255),
                "status" "public"."lib_emailer_email_send_jobs_status_enum" NOT NULL,
                "attempts" integer NOT NULL DEFAULT '0',
                "last_error" text,
                "sent_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_2452b834910bc6d98c178be737c" UNIQUE ("uuid"),
                CONSTRAINT "PK_a5692cd341368395d75bc04d1b4" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_emailer_email_send_jobs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."lib_emailer_email_send_jobs_status_enum"
        `);
    }

}
