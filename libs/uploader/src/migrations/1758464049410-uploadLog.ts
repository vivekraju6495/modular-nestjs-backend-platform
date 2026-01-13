import { MigrationInterface, QueryRunner } from "typeorm";

export class UploadLog1758464049410 implements MigrationInterface {
    name = 'UploadLog1758464049410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lib_uploader_upload_logs" (
                "id" SERIAL NOT NULL,
                "fileName" character varying NULL,
                "fileType" character varying NULL,
                "url" character varying NULL,
                "size" integer NULL,
                "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "error" text,
                CONSTRAINT "PK_7f8dd17fc1f6c7aedb46a4da030" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_uploader_upload_logs"
        `);
    }

}
