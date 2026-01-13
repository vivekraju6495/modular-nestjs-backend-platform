import { MigrationInterface, QueryRunner } from "typeorm";

export class InitLibsIntegrations1724300000000 implements MigrationInterface {
    name = 'InitLibsIntegrations1724300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "libraries" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "key" varchar(64) NOT NULL UNIQUE,
          "version" varchar(32),
          "enabled" boolean NOT NULL DEFAULT true
        )`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "library_integrations" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "library_a" varchar(64) NOT NULL,
          "library_b" varchar(64) NOT NULL,
          "integration" varchar(128) NOT NULL
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "library_integrations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "libraries"`);
    }
}
