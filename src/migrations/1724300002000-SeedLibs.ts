import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedLibs1724300002000 implements MigrationInterface {
    name = 'SeedLibs1724300002000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO libraries(key, version, enabled) VALUES
          ('auth', '1.0.0', true),
          ('catalog', '1.0.0', true),
          ('ecommerce', '1.0.0', true)
          ON CONFLICT (key) DO NOTHING`);

        await queryRunner.query(`INSERT INTO library_integrations(library_a, library_b, integration) VALUES
          ('auth', 'ecommerce', 'auth-ecommerce'),
          ('catalog', 'ecommerce', 'catalog-ecommerce')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM library_integrations WHERE integration in ('auth-ecommerce','catalog-ecommerce')`);
        await queryRunner.query(`DELETE FROM libraries WHERE key in ('auth','catalog','ecommerce')`);
    }
}
