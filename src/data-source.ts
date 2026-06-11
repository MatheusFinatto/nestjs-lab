import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5544),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'pass',
  database: process.env.DB_NAME ?? 'nestjs_lab',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
