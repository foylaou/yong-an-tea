'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface AuthTabMenuItem {
    id: string;
    tabStateNo: number;
    authMenuName: string;
}

const loginSchema = z.object({
    email: z.string().email('請輸入有效的電子郵件'),
    password: z.string().min(6, '密碼至少需要 6 個字元'),
});

const registerSchema = z.object({
    fullName: z.string().min(1, '請輸入姓名'),
    email: z.string().email('請輸入有效的電子郵件'),
    password: z.string().min(6, '密碼至少需要 6 個字元'),
});

const forgotSchema = z.object({
    email: z.string().email('請輸入有效的電子郵件'),
});

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, '密碼至少需要 6 個字元'),
        confirmPassword: z.string().min(6, '請再次輸入密碼'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: '兩次輸入的密碼不一致',
        path: ['confirmPassword'],
    });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotData = z.infer<typeof forgotSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const inputField = `border border-[#cccccc] focus-visible:outline-0 text-[#666666] py-[10px] px-[20px] w-full h-[50px]`;
const secondaryButton =
    'flex items-center justify-center bg-secondary text-white leading-[38px] text-[15px] h-[50px] w-full  transition-all hover:bg-[#212529] px-[40px]';

function AuthForm() {
    const router = useRouter();
    const authTabMenuJson = useSettingsStore((s) => s.auth_tab_menu_json);
    const authTabMenu: AuthTabMenuItem[] = (() => {
        try { return JSON.parse(authTabMenuJson); } catch { return []; }
    })();
    const [authTabState, setAuthTabState] = useState(1);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    // Detect tab=reset from URL (password reset callback)
    useEffect(() => {
        if (router.query.tab === 'reset') {
            setShowResetPassword(true);
        }
    }, [router.query.tab]);

    const authTab = (index: number) => {
        setAuthTabState(index);
        setMessage(null);
        setShowForgot(false);
    };

    const loginForm = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const forgotForm = useForm<ForgotData>({
        resolver: zodResolver(forgotSchema),
    });

    const resetPasswordForm = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const supabase = createClient();

    const handleLogin = async (data: LoginData) => {
        setLoading(true);
        setMessage(null);
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });
        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: '登入成功！' });
            window.location.href = '/';
        }
    };

    const handleRegister = async (data: RegisterData) => {
        setLoading(true);
        setMessage(null);
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: { full_name: data.fullName },
            },
        });
        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: '註冊成功！請查看您的電子郵件以驗證帳號。',
            });
        }
    };

    const handleForgotPassword = async (data: ForgotData) => {
        setLoading(true);
        setMessage(null);
        const { error } = await supabase.auth.resetPasswordForEmail(
            data.email,
            {
                redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent('/auth?tab=reset')}`,
            }
        );
        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: '密碼重設連結已寄出！請查看您的電子郵件。',
            });
        }
    };

    const handleResetPassword = async (data: ResetPasswordData) => {
        setLoading(true);
        setMessage(null);
        const { error } = await supabase.auth.updateUser({
            password: data.password,
        });
        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: '密碼已成功更新！即將跳轉至首頁...',
            });
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    };

    // Show reset password form (from email link)
    if (showResetPassword) {
        return (
            <div className="border-b border-[#ededed] xl:py-[155px] lg:py-[100px] md:py-[80px] py-[50px]">
                <div className="container md:max-w-lg">
                    <h2 className="text-center text-[24px] font-semibold mb-[50px]">
                        設定新密碼
                    </h2>

                    {message && (
                        <div
                            className={`mb-4 p-3 text-sm rounded ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form
                        className="login-form"
                        onSubmit={resetPasswordForm.handleSubmit(
                            handleResetPassword
                        )}
                    >
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="新密碼"
                                {...resetPasswordForm.register('password')}
                            />
                            {resetPasswordForm.formState.errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        resetPasswordForm.formState.errors
                                            .password.message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="確認新密碼"
                                {...resetPasswordForm.register(
                                    'confirmPassword'
                                )}
                            />
                            {resetPasswordForm.formState.errors
                                .confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        resetPasswordForm.formState.errors
                                            .confirmPassword.message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="button-wrap">
                            <button
                                type="submit"
                                disabled={loading}
                                className={secondaryButton}
                            >
                                {loading ? '更新中...' : '更新密碼'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="border-b border-[#ededed] xl:py-[155px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container md:max-w-lg">
                <ul className="auth-menu flex justify-center pb-[50px]">
                    {authTabMenu.map((singleTabMenu) => (
                        <li
                            key={singleTabMenu.id}
                            className={`${
                                authTabState === singleTabMenu.tabStateNo
                                    ? 'login active'
                                    : 'login text-[#666666]'
                            } mr-[45px] last:mr-0`}
                            onClick={() => authTab(singleTabMenu.tabStateNo)}
                        >
                            <span className="font-semibold cursor-pointer text-[24px] leading-[42px]">
                                {singleTabMenu.authMenuName}
                            </span>
                        </li>
                    ))}
                </ul>

                {message && (
                    <div
                        className={`mb-4 p-3 text-sm rounded ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div
                    className={
                        authTabState === 1
                            ? 'login-content tab-style-common active'
                            : 'login-content tab-style-common'
                    }
                >
                    {showForgot ? (
                        <form
                            className="login-form"
                            onSubmit={forgotForm.handleSubmit(
                                handleForgotPassword
                            )}
                        >
                            <h3 className="title text-[18px] mb-[25px]">
                                重設密碼
                            </h3>
                            <div className="single-field mb-[30px]">
                                <input
                                    className={inputField}
                                    type="email"
                                    placeholder="電子郵件地址"
                                    {...forgotForm.register('email')}
                                />
                                {forgotForm.formState.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {
                                            forgotForm.formState.errors.email
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="button-wrap mb-[15px]">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={secondaryButton}
                                >
                                    {loading
                                        ? '寄送中...'
                                        : '寄送重設連結'}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgot(false);
                                    setMessage(null);
                                }}
                                className="text-[14px] font-normal transition-all hover:text-primary"
                            >
                                返回登入
                            </button>
                        </form>
                    ) : (
                        <form
                            className="login-form"
                            onSubmit={loginForm.handleSubmit(handleLogin)}
                        >
                            <h3 className="title text-[18px] mb-[25px]">
                                登入您的帳號
                            </h3>
                            <div className="single-field mb-[30px]">
                                <input
                                    className={inputField}
                                    type="email"
                                    placeholder="電子郵件地址"
                                    {...loginForm.register('email')}
                                />
                                {loginForm.formState.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {
                                            loginForm.formState.errors.email
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="single-field mb-[30px]">
                                <input
                                    className={inputField}
                                    type="password"
                                    placeholder="密碼"
                                    {...loginForm.register('password')}
                                />
                                {loginForm.formState.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {
                                            loginForm.formState.errors.password
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="single-field flex justify-between items-center mb-[30px]">
                                <label
                                    className="flex"
                                    htmlFor="rememberme"
                                >
                                    <input
                                        type="checkbox"
                                        id="rememberme"
                                    />
                                    <span className="text-[14px] ml-[15px]">
                                        記住我
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgot(true);
                                        setMessage(null);
                                    }}
                                    className="text-[14px] font-normal transition-all hover:text-primary"
                                >
                                    忘記密碼？
                                </button>
                            </div>
                            <div className="button-wrap">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={secondaryButton}
                                >
                                    {loading ? '登入中...' : '登入'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <div
                    className={
                        authTabState === 2
                            ? 'Register-content tab-style-common active'
                            : 'Register-content tab-style-common'
                    }
                >
                    <form
                        className="register-form"
                        onSubmit={registerForm.handleSubmit(handleRegister)}
                    >
                        <h3 className="title text-[18px] mb-[25px]">
                            註冊帳號
                        </h3>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="text"
                                placeholder="姓名"
                                {...registerForm.register('fullName')}
                            />
                            {registerForm.formState.errors.fullName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        registerForm.formState.errors.fullName
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="email"
                                placeholder="電子郵件地址"
                                {...registerForm.register('email')}
                            />
                            {registerForm.formState.errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        registerForm.formState.errors.email
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="single-field">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="密碼"
                                {...registerForm.register('password')}
                            />
                            {registerForm.formState.errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        registerForm.formState.errors.password
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        <p className="lg:max-w-[495px] mt-[20px] mb-[25px]">
                            您的個人資料將用於支援您在本網站的體驗、管理您的帳號存取權限，以及
                            <Link href="/privacy" className="ml-[5px]">
                                隱私權政策
                            </Link>
                            中描述的其他用途。
                        </p>
                        <div className="button-wrap">
                            <button
                                type="submit"
                                disabled={loading}
                                className={secondaryButton}
                            >
                                {loading ? '註冊中...' : '註冊'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* LINE Login */}
                <div className="mt-[40px] border-t border-[#ededed] pt-[30px]">
                    <p className="text-center text-[14px] text-[#666666] mb-[15px]">
                        或使用其他方式
                    </p>
                    <a
                        href="/api/auth/line"
                        className="flex items-center justify-center gap-2 w-full h-[50px] rounded bg-[#06C755] text-white text-[15px] font-medium transition-all hover:bg-[#05b64d]"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        LINE 登入
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AuthForm;
