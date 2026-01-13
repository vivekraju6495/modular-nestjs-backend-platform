import { MigrationInterface, QueryRunner } from "typeorm";

export class Authroles1759128376578 implements MigrationInterface {
    name = 'Authroles1759128376578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lib_auth_roles_permissions" (
                "id" SERIAL NOT NULL,
                "action" character varying,
                "code" character varying(150),
                "key" text,
                "description" text,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_90f820c5e1e0e7929a110d7ea1f" UNIQUE ("action"),
                CONSTRAINT "PK_55bf5736d5cae93f673a559033b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_auth_roles_map_permissions" (
                "id" SERIAL NOT NULL,
                "userId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "roleId" integer,
                "permissionId" integer,
                CONSTRAINT "PK_cb224a3b5e8f65b6ad2fc406e1b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_auth_roles_default_roles" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "UQ_ad3787988e80c1bcf294310cf36" UNIQUE ("name"),
                CONSTRAINT "PK_56f05b673ec4eb922415a3755c3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "lib_auth_roles_map_user_roles" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "roleId" integer,
                CONSTRAINT "PK_ec46cd44f10b6ec65001af6b4e4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_auth_roles_map_permissions"
            ADD CONSTRAINT "FK_367cb99d099abb3fecdfb4d5b8b" FOREIGN KEY ("roleId") REFERENCES "lib_auth_roles_default_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_auth_roles_map_permissions"
            ADD CONSTRAINT "FK_ca933a90a5e57f2e810b11c1006" FOREIGN KEY ("permissionId") REFERENCES "lib_auth_roles_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_auth_roles_map_user_roles"
            ADD CONSTRAINT "FK_4d1147f04ac5ad1067f84abd3cb" FOREIGN KEY ("roleId") REFERENCES "lib_auth_roles_default_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "lib_auth_roles_map_user_roles" DROP CONSTRAINT "FK_4d1147f04ac5ad1067f84abd3cb"
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_auth_roles_map_permissions" DROP CONSTRAINT "FK_ca933a90a5e57f2e810b11c1006"
        `);
        await queryRunner.query(`
            ALTER TABLE "lib_auth_roles_map_permissions" DROP CONSTRAINT "FK_367cb99d099abb3fecdfb4d5b8b"
        `);
        await queryRunner.query(`
            DROP TABLE "lib_auth_roles_map_user_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "lib_auth_roles_default_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "lib_auth_roles_map_permissions"
        `);
        await queryRunner.query(`
            DROP TABLE "lib_auth_roles_permissions"
        `);
    }

}
