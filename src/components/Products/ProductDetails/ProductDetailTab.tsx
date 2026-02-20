import { useState, useMemo, useEffect, useCallback } from 'react';
import { MdPlayArrow, MdOutlineStarPurple500, MdStar, MdStarBorder, MdVerified } from 'react-icons/md';
import { useSettingsStore } from '../../../store/settings/settings-slice';
import { createClient } from '../../../lib/supabase/client';
import type { Review } from '../../../types';

interface ProductDetailTabProps {
    product: any;
}

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

// ---------------------------------------------------------------------------
// StarRating — interactive star picker / display
// ---------------------------------------------------------------------------
function StarRating({
    value,
    onChange,
    readonly = false,
    size = 20,
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
    size?: number;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hover || value);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => !readonly && setHover(star)}
                        onMouseLeave={() => !readonly && setHover(0)}
                    >
                        {filled ? (
                            <MdStar className="text-[#f5a623]" style={{ fontSize: size }} />
                        ) : (
                            <MdStarBorder className="text-[#f5a623]" style={{ fontSize: size }} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// ReviewItem — single review card
// ---------------------------------------------------------------------------
function ReviewItem({ review }: { review: Review }) {
    return (
        <div className="border-b border-[#eee] py-5 last:border-0">
            <div className="flex items-center gap-3 mb-2">
                <StarRating value={review.rating} readonly size={16} />
                {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                        <MdVerified size={14} />
                        已驗證購買
                    </span>
                )}
            </div>
            {review.title && (
                <h4 className="font-semibold text-[15px] mb-1">{review.title}</h4>
            )}
            <p className="text-gray-700 text-sm mb-2">{review.content}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{review.customer_name || '匿名用戶'}</span>
                <span>·</span>
                <span>{new Date(review.created_at).toLocaleDateString('zh-TW')}</span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// ReviewForm — submit a new review
// ---------------------------------------------------------------------------
function ReviewForm({
    productId,
    onSubmitted,
}: {
    productId: string;
    onSubmitted: () => void;
}) {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('請選擇評分');
            return;
        }
        if (content.length < 10) {
            setError('評價內容至少 10 字');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    rating,
                    title: title || undefined,
                    content,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || '提交失敗');
                return;
            }
            onSubmitted();
        } catch {
            setError('網路錯誤，請稍後再試');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="pt-[25px]">
            <div className="mb-5">
                <label className="block mb-2 font-medium">您的評分 *</label>
                <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <div className="single-field mb-[20px]">
                <label htmlFor="review-title" className="block mb-[5px]">
                    評價標題（選填）
                </label>
                <input
                    className="input-field border border-[#cfcfcf] outline-hidden w-full h-[40px] p-[10px]"
                    id="review-title"
                    type="text"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="single-field mb-[20px]">
                <label htmlFor="review-content" className="block mb-[5px]">
                    您的評價 *
                </label>
                <textarea
                    className="textarea-field border border-[#cfcfcf] outline-hidden w-full h-[140px] p-[10px]"
                    id="review-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={1000}
                />
                <span className="text-xs text-gray-400">{content.length}/1000</span>
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="submit-field">
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-black text-white cursor-pointer capitalize p-[4px_28px] disabled:opacity-50"
                >
                    {submitting ? '提交中...' : '送出評價'}
                </button>
            </div>
        </form>
    );
}

// ---------------------------------------------------------------------------
// ReviewsSection — full reviews tab content
// ---------------------------------------------------------------------------
function ReviewsSection({ product }: { product: any }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const productId = product?.uuid;

    const fetchReviews = useCallback(async (p: number, append = false) => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?productId=${productId}&page=${p}`);
            const data = await res.json();
            setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
            setTotal(data.total);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews(1);

        // Check auth
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                // Check if already reviewed
                supabase
                    .from('product_reviews')
                    .select('id')
                    .eq('product_id', productId)
                    .eq('customer_id', user.id)
                    .maybeSingle()
                    .then(({ data }) => {
                        if (data) setHasReviewed(true);
                    });
            }
        });
    }, [fetchReviews, productId]);

    const handleSubmitted = () => {
        setSubmitted(true);
        setHasReviewed(true);
        // Refresh reviews (the new one will be pending so won't show, but we refresh anyway)
        fetchReviews(1);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage, true);
    };

    const avgRating = product?.avgRating || 0;
    const reviewCount = product?.reviewCount || 0;

    return (
        <div className="reviews-wrap pt-[25px]">
            {/* Average rating summary */}
            <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800">
                        {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                    </div>
                    <StarRating value={Math.round(avgRating)} readonly size={20} />
                    <div className="text-sm text-gray-500 mt-1">
                        {reviewCount} 則評價
                    </div>
                </div>
            </div>

            {/* Reviews list */}
            {loading && reviews.length === 0 ? (
                <p className="text-gray-400 py-4">載入中...</p>
            ) : reviews.length === 0 ? (
                <p className="text-gray-400 py-4">目前還沒有評價，成為第一位評價者吧！</p>
            ) : (
                <div>
                    {reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}
                    {reviews.length < total && (
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="mt-4 text-sm text-primary hover:underline disabled:opacity-50"
                        >
                            {loading ? '載入中...' : '載入更多評價'}
                        </button>
                    )}
                </div>
            )}

            {/* Review form / auth prompt */}
            <div className="mt-8 border-t border-[#eee] pt-6">
                {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
                        感謝您的評價！審核通過後將會顯示在此處。
                    </div>
                ) : !userId ? (
                    <div className="text-center py-6">
                        <p className="text-gray-500 mb-3">登入後即可留下評價</p>
                        <a
                            href="/auth/login"
                            className="inline-block bg-black text-white px-6 py-2 text-sm"
                        >
                            前往登入
                        </a>
                    </div>
                ) : hasReviewed ? (
                    <p className="text-gray-500 py-4">您已經評價過此商品。</p>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold mb-2">撰寫評價</h3>
                        <ReviewForm productId={productId} onSubmitted={handleSubmitted} />
                    </>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Tab Component
// ---------------------------------------------------------------------------
function ProductDetailTab({ product }: ProductDetailTabProps) {
    const tabMenuJson = useSettingsStore((s) => s.product_tab_menu_json);

    const tabMenuItems = parseJSON<any[]>(tabMenuJson, []);

    const [productDetailTabState, setProductDetailTabState] = useState(1);
    const productAttributes = useMemo(() => {
        try { return JSON.parse(product?.attributesJson || '[]'); }
        catch { return []; }
    }, [product?.attributesJson]);
    const productDetailTab = (index: number) => {
        setProductDetailTabState(index);
    };
    return (
        <div className="product-detail-tab pt-[95px]">
            <div className="container">
                <ul className="product-detail-tab-menu flex max-sm:flex-wrap border-b border-[#dddddd] pb-[20px]">
                    {tabMenuItems.map(
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
                        {product?.detailDesc && (
                        <div className="description-wrap border-b border-[#dddddd] py-[30px]">
                            <div className="grid grid-cols-12 lm:gap-x-[30px] max-sm:gap-y-[30px]">
                                <div className="lm:col-span-7 col-span-12 self-center">
                                    <div>
                                        <h2 className="text-[24px] mb-[10px]">
                                            商品描述
                                        </h2>
                                        <p>
                                            {product.detailDesc}
                                        </p>
                                    </div>
                                </div>
                                <div className="lm:col-span-5 col-span-12">
                                    <img
                                        className="w-full"
                                        src={product?.mdImage}
                                        alt={product?.altImage}
                                    />
                                </div>
                            </div>
                        </div>
                        )}
                        {product?.features && (
                        <div className="description-wrap border-b border-[#dddddd] py-[30px]">
                            <div className="grid grid-cols-12 lm:gap-x-[30px] max-sm:gap-y-[30px]">
                                <div className="lm:col-span-7 col-span-12 self-center">
                                    <div>
                                        <h2 className="text-[24px] mb-[10px]">
                                            產品特色
                                        </h2>
                                        <ul className="features-list">
                                            {(product.features as string)
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
                                        src={product?.mdImage}
                                        alt={product?.altImage}
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
                        <ReviewsSection product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailTab;
