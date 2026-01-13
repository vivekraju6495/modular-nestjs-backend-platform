// typeorm.config.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // load .env

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    'src/**/*.entity.ts',   // App entities
    'libs/**/src/**/*.entity.ts',   // Library entities
  ],
  migrations: [
    'src/migrations/*.ts',  // App migrations
    'libs/**/src/migrations/*.ts',  // Library migrations
  ],
});
