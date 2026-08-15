'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import {
    lineBotSettingsSchema,
    lineBotPublicSettingsSchema,
} from '@/lib/validations/settings';

const BIND_ERROR_LABEL: Record<string, string> = {
    'not-configured':
        '尚未設定 LINE Login（在「LINE 登入」分頁填 Channel ID/Secret）',
    denied: '已取消 LINE 授權',
    'bad-request': '請求格式錯誤，請重新嘗試',
    'state-mismatch': '驗證失敗，請重新嘗試',
    'token-error': '向 LINE 換取權杖失敗',
    'profile-error': '無法取得 LINE 個人資料',
    'already-bound': '這個 LINE 帳號已經綁定在別的帳號上了',
    'update-failed': '寫入失敗，請稍後再試',
    unknown: '發生未知錯誤，請稍後再試',
};

interface LineBotSettingsProps {
    initialData: Record<string, unknown>;
    publicData: Record<string, unknown>;
}

// The form is one page, but line_bot_liff_id/line_bot_basic_id aren't
// secrets like the rest (see the migration comment) — they save to a
// separate, publicly-readable group. Combine the two schemas just for the
// form's own validation; onSubmit still splits the PUT calls by group.
const formSchema = lineBotSettingsSchema.merge(lineBotPublicSettingsSchema);
type FormData = z.infer<typeof formSchema>;

export default function LineBotSettings({
    initialData,
    publicData,
}: LineBotSettingsProps) {
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // --- Bind my own LINE account (separate action; result comes back as a
    // query param after the OAuth redirect round-trip) ---
    const searchParams = useSearchParams();
    const bindSuccess = searchParams.get('line_bind_success');
    const bindErrorCode = searchParams.get('line_bind_error');
    const bindError = bindErrorCode
        ? BIND_ERROR_LABEL[bindErrorCode] || bindErrorCode
        : null;

    const { register, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            line_bot_enabled:
                (initialData.line_bot_enabled as boolean) ?? false,
            line_bot_channel_id:
                (initialData.line_bot_channel_id as string) || '',
            line_bot_channel_secret:
                (initialData.line_bot_channel_secret as string) || '',
            line_bot_channel_access_token:
                (initialData.line_bot_channel_access_token as string) || '',
            line_bot_basic_id: (publicData.line_bot_basic_id as string) || '',
            line_bot_liff_id: (publicData.line_bot_liff_id as string) || '',
            line_bot_default_reply_enabled:
                (initialData.line_bot_default_reply_enabled as boolean) ?? true,
            line_bot_default_reply:
                (initialData.line_bot_default_reply as string) ||
                '目前可以輸入「訂單」查詢出貨狀況，或輸入「優惠」查詢目前的優惠券。',
        },
    });

    async function onSubmit(data: FormData) {
        setSubmitting(true);
        setServerError(null);
        setSuccess(false);

        try {
            // 1. Secrets — protected_settings, admin-only read
            const secretsRes = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group: 'line_bot',
                    settings: {
                        line_bot_enabled: data.line_bot_enabled,
                        line_bot_channel_id: data.line_bot_channel_id,
                        line_bot_channel_secret: data.line_bot_channel_secret,
                        line_bot_channel_access_token:
                            data.line_bot_channel_access_token,
                        line_bot_default_reply_enabled:
                            data.line_bot_default_reply_enabled,
                        line_bot_default_reply: data.line_bot_default_reply,
                    },
                }),
            });
            if (!secretsRes.ok) {
                const r = await secretsRes.json();
                setServerError(r.error || '儲存失敗');
                return;
            }

            // 2. Basic ID / LIFF ID — site_settings, needs to be publicly readable
            // (liff.init() and the "add friend" link both run client-side)
            const publicRes = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group: 'line_bot_public',
                    settings: {
                        line_bot_basic_id: data.line_bot_basic_id,
                        line_bot_liff_id: data.line_bot_liff_id,
                    },
                }),
            });
            if (!publicRes.ok) {
                const r = await publicRes.json();
                setServerError(r.error || '儲存失敗');
                return;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setServerError('儲存失敗，請稍後再試');
        } finally {
            setSubmitting(false);
        }
    }

    const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/line/webhook`;

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            LINE 官方帳號（Messaging API）
                        </h2>
                        <p className="text-base-content/60 -mt-1 text-sm">
                            前往{' '}
                            <a
                                href="https://developers.line.biz/console/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                            >
                                LINE Developers Console
                            </a>{' '}
                            建立 Messaging API Channel（跟 LINE Login
                            可以掛在同一個 Provider 底下）。
                            <br />
                            Webhook URL 請設定為：
                            <code className="bg-base-200 rounded px-1 text-xs">
                                {webhookUrl}
                            </code>
                        </p>

                        <label className="label mt-2 cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                {...register('line_bot_enabled')}
                            />
                            <span className="label-text">
                                啟用 LINE 官方帳號串接
                            </span>
                        </label>

                        <div className="mt-2 space-y-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Channel ID
                                </legend>
                                <input
                                    type="text"
                                    {...register('line_bot_channel_id')}
                                    placeholder="Messaging API Channel ID"
                                    className="input w-full"
                                />
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Channel Secret
                                </legend>
                                <input
                                    type="password"
                                    {...register('line_bot_channel_secret')}
                                    placeholder="••••••••"
                                    className="input w-full"
                                />
                                <p className="fieldset-label">
                                    驗證 webhook 請求簽章用，不能外流
                                </p>
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Channel Access Token
                                </legend>
                                <input
                                    type="password"
                                    {...register(
                                        'line_bot_channel_access_token'
                                    )}
                                    placeholder="••••••••"
                                    className="input w-full"
                                />
                                <p className="fieldset-label">
                                    呼叫 Messaging API（推播、回覆訊息）用
                                </p>
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Bot Basic ID
                                </legend>
                                <input
                                    type="text"
                                    {...register('line_bot_basic_id')}
                                    placeholder="@xxxxxxx"
                                    className="input w-full"
                                />
                                <p className="fieldset-label">
                                    官方帳號的
                                    @ID，用來產生加好友連結/QR（前台會用到，公開沒關係）
                                </p>
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    LIFF ID
                                </legend>
                                <input
                                    type="text"
                                    {...register('line_bot_liff_id')}
                                    placeholder="1234567890-AbCdEfGh"
                                    className="input w-full"
                                />
                                <p className="fieldset-label">
                                    從圖文選單開啟前台官網並夾帶登入資訊時使用（前台會用到，公開沒關係）
                                </p>
                            </fieldset>

                            <label className="label cursor-pointer justify-start gap-3">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    {...register(
                                        'line_bot_default_reply_enabled'
                                    )}
                                />
                                <span className="label-text">
                                    沒有符合任何關鍵字時，自動回覆預設訊息
                                </span>
                            </label>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    預設回覆內容
                                </legend>
                                <textarea
                                    {...register('line_bot_default_reply')}
                                    rows={3}
                                    className="textarea w-full"
                                />
                                <p className="fieldset-label">
                                    使用者傳送的訊息沒有對應到「訂單」「優惠」等關鍵字時的回覆內容；關閉上方開關則完全不回覆。
                                </p>
                            </fieldset>
                        </div>
                    </div>
                </div>

                {serverError && (
                    <div className="alert alert-error text-sm">
                        {serverError}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success text-sm">
                        設定已成功儲存
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                    >
                        {submitting ? '儲存中...' : '儲存設定'}
                    </button>
                </div>
            </form>

            <div className="card card-border bg-base-100 mt-6">
                <div className="card-body">
                    <h2 className="card-title">綁定我的 LINE 帳號</h2>
                    <p className="text-base-content/60 -mt-1 text-sm">
                        把你目前登入的這個管理員帳號連結到你的 LINE
                        身分。跟前台的「使用 LINE
                        登入」是分開的流程，不會另外開新帳號——只會寫回你現在這個帳號。Admin
                        圖文選單要連得到你，得先做這一步。
                    </p>

                    {bindSuccess && (
                        <div className="alert alert-success mt-2 text-sm">
                            LINE 帳號綁定成功
                        </div>
                    )}
                    {bindError && (
                        <div className="alert alert-error mt-2 text-sm">
                            {bindError}
                        </div>
                    )}

                    <div className="mt-2">
                        <a
                            href="/api/admin/line-bind"
                            className="btn btn-outline"
                        >
                            綁定 LINE 帳號
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
