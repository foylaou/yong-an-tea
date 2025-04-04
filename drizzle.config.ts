// drizzle.config.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'drizzle-kit';
import {readFileSync} from "node:fs";

// 手動載入 .env.local
config({ path: resolve(__dirname, '.env.local') });
const caCert = readFileSync(resolve(__dirname, './src/db/prod-ca-2021.crt')).toString();
console.log(caCert);

export default defineConfig({
    dialect: 'postgresql',

    schema: './src/db/schema.ts',
    out: './drizzle',

    dbCredentials: {
        host: process.env.SUPABASE_DB_HOST!,
        port: Number(process.env.SUPABASE_DB_PORT || 6543),
        user: process.env.SUPABASE_DB_USER!,
        password: process.env.SUPABASE_DB_PASSWORD!,
        database: process.env.SUPABASE_DB_NAME!,
        ssl: {
            ca: caCert,
        },
    },
});