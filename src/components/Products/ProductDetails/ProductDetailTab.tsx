import { useState, useMemo } from 'react';
import { MdPlayArrow, MdOutlineStarPurple500 } from 'react-icons/md';
import { MarkdownItem } from '../../../types';

interface ProductDetailTabProps {
    product: MarkdownItem;
    productDetailTabItems: MarkdownItem[];
}

function ProductDetailTab({ product, productDetailTabItems }: ProductDetailTabProps) {
    // Product Detail Tab
    const [productDetailTabState, setProductDetailTabState] = useState(1);
    const productAttributes = useMemo(() => {
        try { return JSON.parse((product as any)?.attributesJson || '[]'); }
        catch { return []; }
    }, [(product as any)?.attributesJson]);
    const productDetailTab = (index: number) => {
        setProductDetailTabState(index);
    };
    return (
        <div className="product-detail-tab pt-[95px]">
            <div className="container">
                <ul className="product-detail-tab-menu flex max-sm:flex-wrap border-b border-[#dddddd] pb-[20px]">
                    {(productDetailTabItems[0] as any)?.tabMenuItems?.map(
                        (tabMenuItem: any) => (
                            <li
                                key={tabMenuItem?.id}
                                className={`${
                                    productDetailTabState ===
                                    tabMenuItem?.tabStateNumber
                                        ? `${tabMenuItem?.tabMenuItemCName} text-primary active`
                                        : `${tabMenuItem?.tabMenuItemCName}`
                                } font-medium transition-all hover:text-primary relative flex] ${
                                    tabMenuItem?.separatorCName
                                }`}
                                onClick={() =>
                                    productDetailTab(
                                        tabMenuItem?.tabStateNumber
                                    )
                                }
                            >
                                <span>{tabMenuItem?.name}</span>
                            </li>
                        )
                    )}
                </ul>
                <div className="product-detail-content">
                    <div
                        className={
                            productDetailTabState === 1
                                ? `tab-style-common description active`
                                : `tab-style-common description`
                        }
                    >
                        {(product as any)?.detailDesc && (
                        <div className="description-wrap border-b border-[#dddddd] py-[30px]">
                            <div className="grid grid-cols-12 lm:gap-x-[30px] max-sm:gap-y-[30px]">
                                <div className="lm:col-span-7 col-span-12 self-center">
                                    <div>
                                        <h2 className="text-[24px] mb-[10px]">
                                            商品描述
                                        </h2>
                                        <p>
                                            {(product as any).detailDesc}
                                        </p>
                                    </div>
                                </div>
                                <div className="lm:col-span-5 col-span-12">
                                    <img
                                        className="w-full"
                                        src={(product as any)?.mdImage}
                                        alt={(product as any)?.altImage}
                                    />
                                </div>
                            </div>
                        </div>
                        )}
                        {(product as any)?.features && (
                        <div className="description-wrap border-b border-[#dddddd] py-[30px]">
                            <div className="grid grid-cols-12 lm:gap-x-[30px] max-sm:gap-y-[30px]">
                                <div className="lm:col-span-7 col-span-12 self-center">
                                    <div>
                                        <h2 className="text-[24px] mb-[10px]">
                                            產品特色
                                        </h2>
                                        <ul className="features-list">
                                            {((product as any).features as string)
                                                .split('\n')
                                                .filter((line: string) => line.trim())
                                                .map((line: string, idx: number) => (
                                                    <li
                                                        className="mb-[5px] last:mb-0"
                                                        key={idx}
                                                    >
                                                        <span className="flex items-center cursor-pointer transition-all hover:text-primary">
                                                            <MdPlayArrow className="mr-[10px]" />
                                                            {line.trim()}
                                                        </span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="lm:col-span-5 col-span-12">
                                    <img
                                        className="w-full"
                                        src={(product as any)?.mdImage}
                                        alt={(product as any)?.altImage}
                                    />
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                    <div
                        className={
                            productDetailTabState === 2
                                ? `tab-style-common additional-information active`
                                : `tab-style-common additional-information`
                        }
                    >
                        <div className="overflow-x-auto relative pt-[25px]">
                            {productAttributes.length > 0 ? (
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <tbody>
                                    <tr>
                                        {productAttributes.map((attr: any, idx: number) => (
                                            <th
                                                key={idx}
                                                scope="row"
                                                className="pb-4 pr-6 text-gray-900 whitespace-nowrap text-[16px]"
                                            >
                                                <span className="font-bold">{attr.name}</span>
                                                <span className="font-normal ml-[5px]">
                                                    {attr.value}{attr.unit ? ` ${attr.unit}` : ''}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                            ) : (
                            <p className="text-gray-400">暫無其他資訊</p>
                            )}
                        </div>
                    </div>
                    <div
                        className={
                            productDetailTabState === 3
                                ? `tab-style-common reviews active`
                                : `tab-style-common reviews`
                        }
                    >
                        <div className="reviews-wrap pt-[25px]">
                            <h2 className="text-[26px]">
                                {(productDetailTabItems[0] as any)?.reviewHeading}
                            </h2>
                            <span className="block mb-[10px]">
                                {(productDetailTabItems[0] as any)?.reviewTitle}
                            </span>
                            <ul className="product-rating flex">
                                {(productDetailTabItems[0] as any)?.ratingLists?.map(
                                    (ratingList: any) => (
                                        <li key={ratingList.id}>
                                            <MdOutlineStarPurple500 className="text-[#f5a623]" />
                                        </li>
                                    )
                                )}
                            </ul>
                            <form className="pt-[25px]">
                                <div className="single-field mb-[20px]">
                                    <label
                                        htmlFor="your-review"
                                        className="block mb-[5px]"
                                    >
                                        您的評價 *
                                    </label>
                                    <textarea
                                        className="textarea-field border border-[#cfcfcf] outline-hidden w-full h-[140px] p-[10px]"
                                        id="your-review"
                                    />
                                </div>
                                <div className="group-field flex">
                                    <div className="single-field w-full mr-[20px]">
                                        <label
                                            htmlFor="reviewer-name"
                                            className="block mb-[5px]"
                                        >
                                            姓名 *
                                        </label>
                                        <input
                                            className="input-field border border-[#cfcfcf] outline-hidden w-full h-[40px] p-[10px]"
                                            id="reviewer-name"
                                            type="text"
                                        />
                                    </div>
                                    <div className="single-field w-full">
                                        <label
                                            htmlFor="reviewer-email"
                                            className="block mb-[5px]"
                                        >
                                            電子郵件 *
                                        </label>
                                        <input
                                            className="input-field border border-[#cfcfcf] outline-hidden w-full h-[40px] p-[10px]"
                                            id="reviewer-email"
                                            type="email"
                                        />
                                    </div>
                                </div>
                                <div className="submit-field mt-[35px]">
                                    <input
                                        type="submit"
                                        value="送出"
                                        className="bg-black text-white cursor-pointer capitalize p-[4px_28px]"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailTab;
