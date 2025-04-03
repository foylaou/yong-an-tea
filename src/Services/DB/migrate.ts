// src/Services/DB/migrate.ts
'use server'

import { createClient } from '@supabase/supabase-js';

export async function runMigration(adminToken: string): Promise<{ success: boolean, message?: string }> {
    // 檢查管理員權限
    if (adminToken !== process.env.ADMIN_SECRET) {
        return { success: false, message: "您不具資料庫遷移權限" };
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 檢查是否存在遷移記錄表，如果不存在則建立
        const { error: checkTableError } = await supabase.rpc('execute_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL UNIQUE,
                    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (checkTableError) {
            return { success: false, message: `建立遷移記錄表失敗：${checkTableError.message}` };
        }

        // 檢查此遷移是否已執行
        const { data: existingMigration, error: checkMigrationError } = await supabase
            .from('migrations')
            .select('id')
            .eq('name', 'initial_tea_schema')
            .maybeSingle();

        if (checkMigrationError) {
            return { success: false, message: `檢查遷移記錄失敗：${checkMigrationError.message}` };
        }

        if (existingMigration) {
            return { success: true, message: '遷移已存在，無需重複執行' };
        }

        // 建立表格的SQL
        const createTablesSQL = `
 
 
 
        `;

        // 執行SQL遷移
        const { error: migrationError } = await supabase.rpc('execute_sql', { sql: createTablesSQL });

        if (migrationError) {
            return { success: false, message: `遷移失敗，錯誤訊息：${migrationError.message}` };
        }

        // 記錄此遷移已執行
        const { error: recordError } = await supabase
            .from('migrations')
            .insert({ name: 'initial_tea_schema' });

        if (recordError) {
            return { success: false, message: `記錄遷移失敗：${recordError.message}` };
        }

        return { success: true, message: "資料遷移成功" };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知錯誤';
        return { success: false, message: `執行遷移過程中發生錯誤：${errorMessage}` };
    }
}