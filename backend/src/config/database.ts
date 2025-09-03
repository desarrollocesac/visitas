import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
};