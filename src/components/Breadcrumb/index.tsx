import Link from 'next/link';

interface BreadcrumbProps {
    breadcrumbContainer?: string;
    title: string;
    itemPath: string;
    item: string;
    activeItem: string;
}

function Breadcrumb({
    breadcrumbContainer,
    title,
    itemPath,
    item,
    activeItem,
}: BreadcrumbProps) {
    return (
        <div className="breadcrumb bg-[#f4f5f7] py-[80px]">
            <div className={breadcrumbContainer}>
                <div className="grid grid-cols-12 items-center">
                    <div className="lm:col-span-6 col-span-12">
                        <h1 className="max-lm:text-center text-[36px] mb-[15px] md:mb-0">
                            {title}
                        </h1>
                    </div>
                    <div className="lm:col-span-6 col-span-12">
                        <ul className="breadcrumb-list flex lm:justify-end justify-center uppercase text-[14px]">
                            <li className='relative after:pr-[15px] after:ml-[15px] after:content-["/"]'>
                                <Link href={itemPath}>{item}</Link>
                            </li>
                            <li>
                                <span className="text-[#777777] font-medium">
                                    {activeItem}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Breadcrumb;
