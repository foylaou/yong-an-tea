import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

const caCert = readFileSync(resolve(__dirname, 'prod-ca-2021.crt')).toString();
console.log(caCert);
const client = new Client({
    host: process.env.SUPABASE_DB_HOST!,
    port: Number(process.env.SUPABASE_DB_PORT || 5432),
    user: process.env.SUPABASE_DB_USER!,
    password: process.env.SUPABASE_DB_PASSWORD!,
    database: process.env.SUPABASE_DB_NAME!,
    ssl: {
        ca: caCert,
    },
});

await client.connect();
await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
await client.end();

console.log('✅ 資料庫重置完成');
