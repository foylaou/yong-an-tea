"use client"

///遷移頁面
import { useState } from "react";
import {runMigration} from "@/Services/DB/migrate";

export default function Page() {
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    async function handleMigration() {
        if (!password) {
            setError("請輸入密碼");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await runMigration(password);

            if (result.success) {
                setSuccess(result.message || "遷移成功執行！");
            } else {
                setError(result.message || "遷移失敗");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "未知錯誤");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-black">資料庫遷移</h1>

            <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-black">
                    管理員密碼
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-neutral-500"
                    placeholder="輸入管理員密碼"
                    disabled={loading}
                />
            </div>

            <button
                onClick={handleMigration}
                disabled={loading || !password}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {loading ? "執行中..." : "執行資料庫遷移"}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                </div>
            )}

            <div className="mt-6 text-sm text-gray-500">
                <p>注意：此操作將建立或更新資料庫結構，請確保您有足夠的權限。</p>
            </div>
        </div>
    );
}