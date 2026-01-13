import { MigrationInterface, QueryRunner } from "typeorm";

export class Company1758813760125 implements MigrationInterface {
    name = 'Company1758813760125'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lib_companies" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" bigint,
                "company_Name" character varying(255) NOT NULL,
                "about" text,
                "registrationNumber" character varying,
                "industry" character varying(255),
                "address1" character varying(255),
                "address2" character varying(255),
                "city" character varying(100),
                "state" character varying(100),
                "zipCode" character varying(20),
                "country" character varying(100),
                "email" character varying(100),
                "phone" character varying(20),
                "companyLogo" character varying(255),
                "status" boolean NOT NULL DEFAULT true,
                "created_by" bigint,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" bigint,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_535ddf773996ede3697d07ef710" UNIQUE ("uuid"),
                CONSTRAINT "UQ_7bf9bf7b09ca1dca07a942b5691" UNIQUE ("registrationNumber"),
                CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_companies"
        `);
    }

}
