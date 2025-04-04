// src/db/client.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import 'dotenv/config';
import * as schema from './schema';
import {readFileSync} from "fs";
import {resolve} from "path"; // 匯入所有定義過的資料表


const caCert = readFileSync(resolve(__dirname, 'prod-ca-2021.crt')).toString();
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

export const db = drizzle(client, { schema });
