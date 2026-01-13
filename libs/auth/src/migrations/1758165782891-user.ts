import { MigrationInterface, QueryRunner } from "typeorm";

export class User1758165782891 implements MigrationInterface {
    name = 'User1758165782891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
            CREATE TABLE "lib_auth_users" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying,
                "middle_name" character varying,
                "last_name" character varying,
                "email" character varying NOT NULL,
                "phone" character varying,
                "whatsapp" character varying,
                "password" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "refresh_token" text,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_ed44bb6f1b029dd74d47377b631" UNIQUE ("uuid"),
                CONSTRAINT "UQ_048daf08af050b93fd3f5c33685" UNIQUE ("email"),
                CONSTRAINT "UQ_16187436ea3e32b2367358f769c" UNIQUE ("phone"),
                CONSTRAINT "UQ_5186615e73c77acb5822fd17ce5" UNIQUE ("whatsapp"),
                CONSTRAINT "PK_14e752f1b2225c33bedb6e17592" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
        await queryRunner.query(`
            DROP TABLE "lib_auth_users"
        `);
    }

}
