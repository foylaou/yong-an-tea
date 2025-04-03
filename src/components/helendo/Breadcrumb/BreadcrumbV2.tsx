import Link from 'next/link';

interface Product {
    title: string;
    [key: string]: any; // 用於其他可能的產品屬性
}

interface BreadcrumbV2Props {
    product: Product;
    itemPath: string;
    item: string;
}

export default function BreadcrumbV2({ product, itemPath, item }: BreadcrumbV2Props) {
    return (
        <div className="breadcrumb bg-[#f4f5f7] py-[80px]">
            <div className="container">
                <div className="grid grid-cols-12 items-center">
                    <div className="lm:col-span-6 col-span-12">
                        <h1 className="text-[36px] lm:text-start text-center">
                            {product?.title}
                        </h1>
                    </div>
                    <div className="lm:col-span-6 col-span-12">
                        <ul className="breadcrumb-list flex lm:justify-end justify-center uppercase text-[14px]">
                            <li className='relative after:pr-[15px] after:ml-[15px] after:content-["/"]'>
                                <Link href={itemPath}>{item}</Link>
                            </li>
                            <li>
                                <span className="text-[#777777] font-medium">
                                    {product?.title}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}