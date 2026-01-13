import { MigrationInterface, QueryRunner } from "typeorm";

export class Templates1758168399919 implements MigrationInterface {
    name = 'Templates1758168399919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."lib_emailer_email_templates_version_enum" AS ENUM('draft', 'published')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."lib_emailer_email_templates_type_enum" AS ENUM('default', 'user')
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_emailer_email_templates" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" bigint,
                "name" character varying(255) NOT NULL,
                "description" text,
                "model" json,
                "html" text,
                "layout" json,
                "version" "public"."lib_emailer_email_templates_version_enum",
                "is_published" boolean NOT NULL DEFAULT false,
                "thumbnail_url" text,
                "type" "public"."lib_emailer_email_templates_type_enum" NOT NULL DEFAULT 'default',
                "company_id" bigint,
                "status" boolean NOT NULL DEFAULT true,
                "created_by" integer,
                "updated_by" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_7186605a6f49c9b354df58c8508" UNIQUE ("uuid"),
                CONSTRAINT "PK_46eb42b5671fbdc2d35d9525c1b" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "lib_emailer_email_templates"."type" IS 'default template created by admin, user- user created template'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_emailer_email_templates"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."lib_emailer_email_templates_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."lib_emailer_email_templates_version_enum"
        `);
    }

}
