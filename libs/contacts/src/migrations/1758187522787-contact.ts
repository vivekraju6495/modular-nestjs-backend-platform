import { MigrationInterface, QueryRunner } from "typeorm";

export class Contact1758187522787 implements MigrationInterface {
    name = 'Contact1758187522787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."lib_contacts_permission_enum" AS ENUM('opted-in', 'opted-out')
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_contacts" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "first_name" character varying(150),
                "last_name" character varying(150),
                "address" character varying(255),
                "address1" character varying(255),
                "address2" character varying(255),
                "city" character varying(100),
                "state" character varying(100),
                "zipcode" character varying(20),
                "country" character varying(100),
                "number" character varying(20),
                "birthday" date,
                "company_name" character varying(255),
                "tags" text array NOT NULL DEFAULT '{}',
                "permission" "public"."lib_contacts_permission_enum" NOT NULL DEFAULT 'opted-in',
                "is_subscribed" boolean NOT NULL DEFAULT true,
                "user_id" bigint,
                "company_id" bigint,
                "country_id" bigint,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_893358f5003c3e2db9ec4d3bf57" UNIQUE ("uuid"),
                CONSTRAINT "UQ_910ff5c0dcac8f872ad9b900003" UNIQUE ("email"),
                CONSTRAINT "PK_7ddb650e7a4e4415d973cf23eae" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_contacts"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."lib_contacts_permission_enum"
        `);
    }

}
