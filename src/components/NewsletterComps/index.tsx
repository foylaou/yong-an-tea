'use client';

import { useState } from 'react';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface NewsletterCompsProps {
    sectionTitle: string;
}

function NewsletterComps({ sectionTitle }: NewsletterCompsProps) {
    const emailPlaceholder = useSettingsStore((s) => s.email_placeholder);
    const btnSubscribe = useSettingsStore((s) => s.btn_subscribe);

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
        <div className="newsletter-area">
            <div className="container">
                <div className="grid md:grid-cols-2">
                    <div className="section-title pb-[10px] md:mb-0 mb-[30px] relative after:bg-primary after:absolute after:left-0 after:transform after:bottom-0 after:h-[4px] after:w-[70px]">
                        <h2>{sectionTitle}</h2>
                    </div>
                    <div>
                        <form className="newsletter-form relative" onSubmit={handleSubscribe}>
                            <input
                                className="w-full bg-[#f4f5f7] h-[54px] lm:p-[10px_170px_10px_20px] p-[10px] focus:outline-hidden"
                                type="email"
                                placeholder={emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-black text-white lm:absolute lm:top-0 lm:right-0 px-[40px] h-[54px] max-sm:mt-[30px] disabled:opacity-50"
                            >
                                {loading ? '處理中...' : btnSubscribe}
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

export default NewsletterComps;
