"use client";
import React, { JSX, useState } from "react";

/**
 * NewsletterComps 元件的參數
 *
 * @interface NewsletterCompsProps
 * @property {string} sectionTitle 區塊標題文字
 * @property {string} description 區塊描述
 */
interface NewsletterCompsProps {
    sectionTitle: string;
    description: string;
}

/**
 * NewsletterComps - 訂閱電子報輸入表單
 *
 * @param {NewsletterCompsProps} props 組件參數
 * @returns {JSX.Element} 電子報訂閱區塊
 */
export default function NewsletterComps({
    sectionTitle,
    description
}: NewsletterCompsProps): JSX.Element {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 簡單的電子郵件驗證
        if (!email || !email.includes('@') || !email.includes('.')) {
            setError("請輸入有效的電子郵件地址");
            return;
        }

        // 在這裡可以添加 API 呼叫來處理訂閱
        // 假設訂閱成功
        setIsSubmitted(true);
        setError("");
    };

    return (
        <div className="newsletter-area py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="section-title pb-[10px] md:mb-0 mb-[30px] relative after:bg-primary after:absolute after:left-0 after:transform after:bottom-0 after:h-[4px] after:w-[70px]">
                        <h2 className="text-2xl font-bold mb-3">{sectionTitle}</h2>
                        <p className="text-gray-600">{description}</p>
                    </div>

                    {!isSubmitted ? (
                        <form className="newsletter-form relative" onSubmit={handleSubmit}>
                            <div className="relative">
                                <input
                                    className="w-full bg-[#f4f5f7] h-[54px] lm:p-[10px_170px_10px_20px] p-[10px] focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
                                    type="email"
                                    placeholder="請輸入信箱..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-label="電子郵件地址"
                                />
                                <button
                                    type="submit"
                                    className="bg-black text-white lm:absolute lm:top-0 lm:right-0 px-[40px] h-[54px] max-sm:mt-[15px] max-sm:w-full hover:bg-gray-800 transition duration-300"
                                    aria-label="訂閱電子報"
                                >
                                    訂閱
                                </button>
                            </div>
                            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                        </form>
                    ) : (
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <p className="text-green-700">感謝您的訂閱！我們將很快發送精彩內容給您。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
