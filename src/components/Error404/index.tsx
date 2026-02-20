import Link from 'next/link';
import { IoSearchOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

function Error404() {
    const image = useSettingsStore((s) => s.error404_image);
    const imageAlt = useSettingsStore((s) => s.error404_image_alt);
    const title = useSettingsStore((s) => s.error404_title);
    const desc = useSettingsStore((s) => s.error404_desc);
    const linkPath = useSettingsStore((s) => s.error404_link_path);
    const linkText = useSettingsStore((s) => s.error404_link_text);

    return (
        <div className="error-404 border-b border-[#ededed] pt-[20px] pb-[80px]">
            <div className="container">
                <div className="content flex flex-col items-center">
                    <img src={image} alt={imageAlt} className="mb-[30px] max-h-[450px] w-auto object-contain" />
                    <h1 className="mb-[10px]">{title}</h1>
                    <p className="text-[18px] leading-[31px] mb-[45px]">
                        {desc}
                        <Link
                            href={linkPath}
                            className="text-primary border-b border-primary ml-[5px]"
                        >
                            {linkText}
                        </Link>
                    </p>

                    <form>
                        <div className="input-field relative w-[400px]">
                            <input
                                type="search"
                                name="search"
                                placeholder="搜尋..."
                                className="bg-transparent border border-[rgba(0,0,0,.25)] outline-hidden w-full p-[13px_65px_13px_15px] focus-visible:border-primary"
                            />
                            <button
                                type="submit"
                                className="absolute top-1/2 -translate-y-1/2 right-[20px] text-2xl"
                            >
                                <IoSearchOutline />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Error404;
