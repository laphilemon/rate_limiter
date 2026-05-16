import { Pool } from 'pg';
import 'dotenv/config';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  port: Number(process.env.DB_PORT) || 5432
};

export const pool = new Pool(dbConfig);

export const connectDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log(`Database connected successfully to ${dbConfig.host}`);
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const closeDB = async function () {
  await pool.end();
  console.log('Database connection pool closed');
}