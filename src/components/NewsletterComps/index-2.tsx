'use client';

import { useState } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface NewsletterCompsTwoProps {
    newsletterCName: string;
    sectionTitle: string;
    sectionDesc: string;
    containerCName: string;
}

function NewsletterCompsTwo({
    newsletterCName,
    sectionTitle,
    sectionDesc,
    containerCName,
}: NewsletterCompsTwoProps) {
    const emailPlaceholder = useSettingsStore((s) => s.email_placeholder);

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: '感謝訂閱！' });
                setEmail('');
            } else {
                setMessage({ type: 'error', text: data.error || '訂閱失敗' });
            }
        } catch {
            setMessage({ type: 'error', text: '訂閱失敗，請稍後再試' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={newsletterCName}>
            <div className={containerCName}>
                <div className="grid grid-cols-12">
                    <div className="lg:col-span-6 md:col-span-5 col-span-12">
                        <div className="section-wrap md:pb-[10px] pb-[40px]">
                            <h2 className="title text-[26px]">
                                {sectionTitle}
                            </h2>
                            <p className="desc">{sectionDesc}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-6 md:col-span-7 col-span-12 self-center">
                        <form className="newsletter-form relative" onSubmit={handleSubscribe}>
                            <input
                                className="w-full bg-white h-[54px] p-[10px_80px_10px_20px] focus:outline-hidden"
                                type="email"
                                placeholder={emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute top-0 right-[15px] h-[54px] px-[30px] disabled:opacity-50"
                            >
                                <IoArrowForwardOutline />
                            </button>
                        </form>
                        {message && (
                            <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsletterCompsTwo;
