import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'intellieval',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/users/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
