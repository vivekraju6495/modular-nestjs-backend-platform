import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class RolesAndPermission1759128376580 implements MigrationInterface {
    name = 'RolesAndPermission1759128376580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`
            INSERT INTO "lib_auth_roles_default_roles" ("name")
            VALUES
                ('superadmin'),
                ('admin'),
                ('user');
        `);

        await queryRunner.query(`
            INSERT INTO "lib_auth_roles_permissions" ("action","code","key","description","status")
            VALUES
                ('all','ALL','ALL-APIs','All api permissions',true);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
