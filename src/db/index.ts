import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 使用環境變數，而不是直接在程式碼中顯示連接字串
const connectionString = process.env.DATABASE_URL || process.env.YONGANTEA_NEW_SUPABASE_POSTGRES_URL;

// 確保連接字串存在
if (!connectionString) {
    throw new Error('資料庫連接字串未提供');
}

const client = postgres(connectionString);
export const db = drizzle(client);