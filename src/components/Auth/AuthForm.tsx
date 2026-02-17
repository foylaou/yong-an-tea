'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';

interface AuthTabMenuItem {
    id: string;
    tabStateNo: number;
    authMenuName: string;
}

interface AuthFormProps {
    authItems: { authTabMenu?: AuthTabMenuItem[]; [key: string]: any }[];
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

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

const inputField = `border border-[#cccccc] focus-visible:outline-0 text-[#666666] py-[10px] px-[20px] w-full h-[50px]`;
const secondaryButton =
    'flex items-center justify-center bg-secondary text-white leading-[38px] text-[15px] h-[50px] w-full  transition-all hover:bg-[#212529] px-[40px]';

function AuthForm({ authItems }: AuthFormProps) {
    const [authTabState, setAuthTabState] = useState(1);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);

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
                redirectTo: `${window.location.origin}/auth?tab=reset`,
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

    return (
        <div className="border-b border-[#ededed] xl:py-[155px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container md:max-w-lg">
                <ul className="auth-menu flex justify-center pb-[50px]">
                    {authItems[0]?.authTabMenu?.map((singleTabMenu) => (
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
            </div>
        </div>
    );
}

export default AuthForm;
