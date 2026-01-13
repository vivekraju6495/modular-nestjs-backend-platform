import { MigrationInterface, QueryRunner } from "typeorm";

export class ElementsGroup1758166597495 implements MigrationInterface {
    name = 'ElementsGroup1758166597495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lib_emailer_email_elements_group" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(150) NOT NULL,
                "description" text,
                "order" integer NOT NULL DEFAULT '0',
                "user_id" bigint,
                "company_id" bigint,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_6e63bb39dcbd00f414af35d8af9" UNIQUE ("uuid"),
                CONSTRAINT "PK_83aa1eb90124e77da420d14df32" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_emailer_email_elements_group"
        `);
    }

}
