import { MigrationInterface, QueryRunner } from "typeorm";

export class Campaigns1758168711261 implements MigrationInterface {
    name = 'Campaigns1758168711261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."lib_emailer_email_campaigns_status_enum" AS ENUM(
                'draft',
                'scheduled',
                'sending',
                'sent',
                'paused'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_emailer_email_campaigns" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" bigint,
                "name" character varying(255) NOT NULL,
                "template_id" integer NOT NULL,
                "from_name" character varying(255) NOT NULL,
                "from_email" character varying(255) NOT NULL,
                "reply_to" character varying(255),
                "subject" text NOT NULL,
                "status" "public"."lib_emailer_email_campaigns_status_enum" NOT NULL,
                "send_at" TIMESTAMP WITH TIME ZONE,
                "audience" jsonb NOT NULL,
                "company_id" bigint,
                "created_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_01847f19722db6a1a0425892d04" UNIQUE ("uuid"),
                CONSTRAINT "PK_b0cf472ea4ac4c6766ee0dca43e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns"
            ADD CONSTRAINT "FK_7a8f3420078aa9a074ca1387bfe" FOREIGN KEY ("template_id") REFERENCES "lib_emailer_email_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_campaigns" DROP CONSTRAINT "FK_7a8f3420078aa9a074ca1387bfe"
        `);
        await queryRunner.query(`
            DROP TABLE "lib_emailer_email_campaigns"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."lib_emailer_email_campaigns_status_enum"
        `);
    }

}
