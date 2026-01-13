import { MigrationInterface, QueryRunner } from "typeorm";

export class UserOtp1758165920738 implements MigrationInterface {
    name = 'UserOtp1758165920738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lib_auth_users_otp" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" integer NOT NULL,
                "type" character varying,
                "otp" character varying(6),
                "expires_at" TIMESTAMP,
                "is_used" boolean NOT NULL DEFAULT false,
                "used_at" TIMESTAMP,
                "is_expired" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_993042575e2b8bf2fcc5f86ca7a" UNIQUE ("uuid"),
                CONSTRAINT "PK_8e369a27f3b58462c0cea669272" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_auth_users_otp"
        `);
    }

}
