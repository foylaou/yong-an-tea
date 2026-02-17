import { useState } from 'react';
import { IoChevronDownSharp } from 'react-icons/io5';
import { MarkdownItem } from '../../types';

interface FaqProps {
    faqItems: MarkdownItem[];
    title: string;
    desc: string;
}

function Faq({ faqItems, title, desc }: FaqProps) {
    const [selected, setSelected] = useState({});
    const toggle = (items) => {
        if (selected === items) {
            setSelected({});
            return;
        }

        setSelected(items);
    };
    return (
        <div className="faq text-center border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container max-w-4xl">
                <h2 className="mb-[10px]">{title}</h2>
                <p className="mb-[45px]">{desc}</p>
                <div className="accorddion p-[15px] -m-[15px]">
                    {faqItems?.map((items) => (
                        <div
                            className={`${
                                selected === items ? 'item active' : 'item'
                            } bg-white shadow-[0_18px_40px_rgba(51,51,51,0.1)] mb-[15px] last:mb-0`}
                            key={items.id}
                        >
                            <div
                                className="title flex items-center justify-between cursor-pointer"
                                onClick={() => toggle(items)}
                            >
                                <h2 className="sm:text-[18px] text-[16px] leading-[22px]">
                                    {items.question}
                                </h2>
                                <span className="navigation">
                                    <IoChevronDownSharp />
                                </span>
                            </div>
                            <div className="content p-[30px]">
                                {items.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Faq;
