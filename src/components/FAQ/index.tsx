import { useState } from 'react';
import { IoChevronDownSharp } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

function Faq() {
    const faqItemsJson = useSettingsStore((s) => s.faq_items_json);
    const title = useSettingsStore((s) => s.faq_page_title);
    const desc = useSettingsStore((s) => s.faq_page_desc);

    const faqItems = parseJSON<{ id: string; question: string; answer: string }[]>(faqItemsJson, []);

    const [selected, setSelected] = useState<string | null>(null);
    const toggle = (id: string) => {
        setSelected(selected === id ? null : id);
    };

    return (
        <div className="faq text-center border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container max-w-4xl">
                <h2 className="mb-[10px]">{title}</h2>
                <p className="mb-[45px]">{desc}</p>
                <div className="accorddion p-[15px] -m-[15px]">
                    {faqItems.map((item) => (
                        <div
                            className={`${
                                selected === item.id ? 'item active' : 'item'
                            } bg-white shadow-[0_18px_40px_rgba(51,51,51,0.1)] mb-[15px] last:mb-0`}
                            key={item.id}
                        >
                            <div
                                className="title flex items-center justify-between cursor-pointer"
                                onClick={() => toggle(item.id)}
                            >
                                <h2 className="sm:text-[18px] text-[16px] leading-[22px]">
                                    {item.question}
                                </h2>
                                <span className="navigation">
                                    <IoChevronDownSharp />
                                </span>
                            </div>
                            <div className="content p-[30px]">
                                {item.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Faq;
