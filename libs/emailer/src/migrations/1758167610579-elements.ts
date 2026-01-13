import { MigrationInterface, QueryRunner } from "typeorm";

export class Elements1758167610579 implements MigrationInterface {
    name = 'Elements1758167610579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lib_emailer_email_elements" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "group_id" integer NOT NULL,
                "name" character varying(150) NOT NULL,
                "block" text NOT NULL,
                "attributes" json,
                "order" integer NOT NULL DEFAULT '0',
                "thumbnail" text,
                "user_id" bigint,
                "company_id" bigint,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_66477107142994832cd082586c4" UNIQUE ("uuid"),
                CONSTRAINT "PK_1eaabaf842e517e281c7b2156e7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_elements"
            ADD CONSTRAINT "FK_83aa1eb90124e77da420d14df32" FOREIGN KEY ("group_id") REFERENCES "lib_emailer_email_elements_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_emailer_email_elements" DROP CONSTRAINT "FK_83aa1eb90124e77da420d14df32"
        `);
        await queryRunner.query(`
            DROP TABLE "lib_emailer_email_elements"
        `);
    }

}
