'use client';

import { useState } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface NewsletterCompsThreeProps {
    newsletterCName: string;
    sectionTitle: string;
    sectionDesc: string;
    containerCName: string;
}

function NewsletterCompsThree({
    newsletterCName,
    sectionTitle,
    sectionDesc,
    containerCName,
}: NewsletterCompsThreeProps) {
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
                <div className="grid grid-cols-12 md:gap-x-[30px]">
                    <div className="md:col-span-6 col-span-12">
                        <div className="section-wrap pb-[10px]">
                            <h2 className="title md:text-[36px] text-[30px] mb-[30px]">
                                {sectionTitle}
                            </h2>
                            <p className="desc xl:w-[560px]">{sectionDesc}</p>
                        </div>
                    </div>
                    <div className="md:col-span-6 col-span-12 self-center">
                        <form className="newsletter-form relative" onSubmit={handleSubscribe}>
                            <input
                                className="w-full h-[40px] border-b border-[#dddddd] p-[10px_50px_10px_0] focus:outline-hidden focus:border-b-primary focus:text-primary"
                                type="email"
                                placeholder={emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="light-stroke text-[18px] absolute top-0 right-[15px] h-[40px] disabled:opacity-50"
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

export default NewsletterCompsThree;
