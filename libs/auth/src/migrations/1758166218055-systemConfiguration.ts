import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class SystemConfiguration1758166218055 implements MigrationInterface {
    name = 'SystemConfiguration1758166218055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     CREATE TABLE "lib_system_configuration" (
        //         "id" SERIAL NOT NULL,
        //         "key" character varying NOT NULL,
        //         "value" text NOT NULL,
        //         "status" boolean NOT NULL DEFAULT true,
        //         "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        //         "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        //         CONSTRAINT "UQ_a0704d058bb4187fec2c107535f" UNIQUE ("key"),
        //         CONSTRAINT "PK_1c05fc4aa745ff710440478a689" PRIMARY KEY ("id")
        //     )
        // `);

        const tableExists = await queryRunner.hasTable("lib_system_configuration");
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                name: "lib_system_configuration",
                columns: [
                    {
                    name: "id",
                    type: "serial",
                    isPrimary: true,
                    },
                    {
                    name: "key",
                    type: "varchar",
                    isUnique: true,
                    isNullable: false,
                    },
                    {
                    name: "value",
                    type: "text",
                    isNullable: false,
                    },
                    {
                    name: "status",
                    type: "boolean",
                    default: true,
                    },
                    {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()",
                    },
                    {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()",
                    },
                ],
                }),
            );
        }

        await queryRunner.query(`
            INSERT INTO "lib_system_configuration" ("key", "value", "status")
            VALUES
                ('LOGIN_OTP_EXPIRY_TIME', 60, true),
                ('LOGIN_OTP_TIME', 60, true),
                ('LOGIN_OTP_LIMIT', 3, true),
                ('REFRESH_EXPIRY', 30, true),
                ('IDLE_TIMEOUT', 60, true);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "lib_system_configuration"
        `);
    }

}
