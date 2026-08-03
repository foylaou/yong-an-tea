'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProduct, ProductVariant } from '@/types/admin-product';
import type { Customer } from '@/types/customer';
import type { OrderChannel, PaymentMethod } from '@/types/order';
import CachedImage from '@/components/CachedImage';
import { CustomerPicker } from './CustomerPicker';
import { AddToCartDialog } from './AddToCartDialog';

interface PosScreenProps {
  initialProducts: AdminProduct[];
  categories: { id: string; name: string }[];
}

interface CartLine {
  key: string;
  product: AdminProduct;
  variant?: ProductVariant;
  quantity: number;
}

const channelOptions: { value: OrderChannel; label: string }[] = [
  { value: 'in_store', label: '現場' },
  { value: 'phone', label: '電話' },
  { value: 'line', label: 'LINE' },
];

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: '現金' },
  { value: 'line_pay', label: 'LINE Pay' },
  { value: 'bank_transfer', label: '銀行轉帳' },
];

// xs_image is sized for small table thumbnails (~32-40px) — POS cards are
// much larger, so prefer sm/md to avoid visibly upscaling a too-small source.
function productImage(product: AdminProduct): string {
  return product.sm_image || product.md_image || product.xs_image || '';
}

// discount_price is stored as 0 (not null) when there's no discount, so a
// truthy check is required here — nullish coalescing would incorrectly
// treat 0 as "the real price".
function productDisplayPrice(product: AdminProduct): number {
  return product.discount_price || product.price;
}

function lineUnitPrice(line: CartLine): number {
  if (line.variant) {
    return line.variant.discount_price || line.variant.price;
  }
  return productDisplayPrice(line.product);
}

function cartKey(productId: string, variantId?: string): string {
  return `${productId}:${variantId ?? 'base'}`;
}

function calculateLoyaltyDiscount(
  subtotal: number,
  discountType: 'percentage' | 'fixed_amount' | null,
  discountValue: number
): number {
  if (!discountType || discountValue <= 0) return 0;
  if (discountType === 'percentage') return Math.round(subtotal * (discountValue / 100));
  return Math.min(discountValue, subtotal);
}

export function PosScreen({ initialProducts, categories }: PosScreenProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [addToCartProduct, setAddToCartProduct] = useState<AdminProduct | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerPicked, setCustomerPicked] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [channel, setChannel] = useState<OrderChannel>('in_store');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isPaid, setIsPaid] = useState(true);
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [shippingAddress, setShippingAddress] = useState({
    postal_code: '',
    city: '',
    district: '',
    address_line1: '',
    address_line2: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch = !search.trim() || p.title.toLowerCase().includes(search.trim().toLowerCase()) || p.sku?.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory =
        !categoryFilter ||
        (p as unknown as { product_categories?: { category_id: string }[] }).product_categories?.some((pc) => pc.category_id === categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, search, categoryFilter]);

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + lineUnitPrice(line) * line.quantity, 0), [cart]);
  const discountAmount = useMemo(
    () => calculateLoyaltyDiscount(subtotal, customer?.discount_type ?? null, customer?.discount_value ?? 0),
    [subtotal, customer]
  );
  const total = subtotal - discountAmount;

  function handleAddToCartConfirm(variant: ProductVariant | undefined, quantity: number) {
    if (!addToCartProduct) return;
    const product = addToCartProduct;
    const key = cartKey(product.id, variant?.id);

    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        return prev.map((line) => (line.key === key ? { ...line, quantity: line.quantity + quantity } : line));
      }
      return [...prev, { key, product, variant, quantity }];
    });
    setAddToCartProduct(null);
  }

  function updateQuantity(key: string, delta: number) {
    setCart((prev) => prev.map((line) => (line.key === key ? { ...line, quantity: line.quantity + delta } : line)).filter((line) => line.quantity > 0));
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }

  function handleCustomerSelect(selected: Customer | null) {
    setCustomer(selected);
    setCustomerPicked(true);
    setShowCustomerPicker(false);
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (fulfillment === 'delivery' && (!shippingAddress.city || !shippingAddress.district || !shippingAddress.address_line1)) {
      setError('寄到府請填寫完整地址');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walk_in_customer_id: customer?.id ?? null,
          customer_name: customer?.name ?? '現場散客',
          customer_phone: customer?.phone ?? '',
          channel,
          payment_method: paymentMethod,
          is_paid: isPaid,
          fulfillment,
          ...(fulfillment === 'delivery' && { shipping_address: shippingAddress }),
          items: cart.map((line) => ({ product_id: line.product.id, variant_id: line.variant?.id, quantity: line.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '建立訂單失敗');
        return;
      }

      setCart([]);
      setCustomer(null);
      setCustomerPicked(false);
      setFulfillment('pickup');
      setShippingAddress({ postal_code: '', city: '', district: '', address_line1: '', address_line2: '' });
      router.push(`/admin/orders/${data.order.order_id}`);
    } catch {
      setError('建立訂單失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Product grid */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋商品名稱或 SKU..."
            className="input input-lg flex-1"
          />
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategoryFilter('')} className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-outline'}`}>
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`btn btn-sm ${categoryFilter === c.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setAddToCartProduct(product)}
              className="card card-border bg-base-100 hover:border-primary text-left transition-colors"
            >
              <div className="bg-base-200 aspect-square w-full overflow-hidden rounded-t-box">
                {productImage(product) ? (
                  <CachedImage src={productImage(product)} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-base-content/30 flex h-full items-center justify-center text-xs">無圖片</div>
                )}
              </div>
              <div className="card-body gap-0.5 p-3">
                <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                <p className="text-primary font-semibold">
                  {product.product_variants?.length ? '多規格' : `$${productDisplayPrice(product).toLocaleString()}`}
                </p>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && <p className="text-base-content/40 col-span-full py-12 text-center">沒有符合的商品</p>}
        </div>
      </div>

      {/* Cart / checkout panel */}
      <div className="bg-base-100 border-base-300 flex w-96 shrink-0 flex-col border-l">
        <div className="border-base-300 border-b p-4">
          <button type="button" onClick={() => setShowCustomerPicker(true)} className="btn btn-outline w-full justify-start">
            <span className="iconify lucide--contact size-5" />
            {customerPicked ? customer?.name || '現場散客（未指定）' : '選擇客戶'}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-base-content/40 py-12 text-center text-sm">點選左側商品加入購物車</p>
          ) : (
            cart.map((line) => (
              <div key={line.key} className="border-base-200 flex items-center gap-2 border-b pb-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {line.product.title}
                    {line.variant && <span className="text-base-content/50"> · {line.variant.name}</span>}
                  </p>
                  <p className="text-base-content/50 text-xs">${lineUnitPrice(line).toLocaleString()} / 件</p>
                </div>
                <div className="join">
                  <button type="button" onClick={() => updateQuantity(line.key, -1)} className="join-item btn btn-xs btn-square">
                    <span className="iconify lucide--minus size-3.5" />
                  </button>
                  <span className="join-item btn btn-xs btn-disabled w-8">{line.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(line.key, 1)} className="join-item btn btn-xs btn-square">
                    <span className="iconify lucide--plus size-3.5" />
                  </button>
                </div>
                <button type="button" onClick={() => removeLine(line.key)} className="btn btn-xs btn-ghost btn-square text-error">
                  <span className="iconify lucide--trash-2 size-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-base-300 space-y-3 border-t p-4">
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm text-success">
              <span>熟客折扣</span>
              <span>-${discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>總計</span>
            <span>${total.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {channelOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setChannel(opt.value)}
                className={`btn btn-xs ${channel === opt.value ? 'btn-primary' : 'btn-outline'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="select select-sm w-full">
            {paymentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setFulfillment('pickup')}
              className={`btn btn-xs ${fulfillment === 'pickup' ? 'btn-primary' : 'btn-outline'}`}
            >
              現場取貨
            </button>
            <button
              type="button"
              onClick={() => setFulfillment('delivery')}
              className={`btn btn-xs ${fulfillment === 'delivery' ? 'btn-primary' : 'btn-outline'}`}
            >
              寄到府
            </button>
          </div>

          {fulfillment === 'delivery' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="縣市"
                  className="input input-sm w-full"
                />
                <input
                  type="text"
                  value={shippingAddress.district}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder="鄉鎮區"
                  className="input input-sm w-full"
                />
              </div>
              <input
                type="text"
                value={shippingAddress.address_line1}
                onChange={(e) => setShippingAddress((prev) => ({ ...prev, address_line1: e.target.value }))}
                placeholder="詳細地址"
                className="input input-sm w-full"
              />
              <input
                type="text"
                value={shippingAddress.postal_code}
                onChange={(e) => setShippingAddress((prev) => ({ ...prev, postal_code: e.target.value }))}
                placeholder="郵遞區號（選填）"
                className="input input-sm w-full"
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
            <span className="text-sm">{isPaid ? '已收款' : '未收款（先賒帳）'}</span>
          </label>

          {error && <div className="alert alert-error text-sm">{error}</div>}

          <button type="button" onClick={handleCheckout} disabled={cart.length === 0 || submitting} className="btn btn-primary btn-block btn-lg">
            {submitting ? '送出中...' : '完成結帳'}
          </button>
        </div>
      </div>

      {showCustomerPicker && <CustomerPicker onSelect={handleCustomerSelect} onClose={() => setShowCustomerPicker(false)} />}
      {addToCartProduct && (
        <AddToCartDialog product={addToCartProduct} onConfirm={handleAddToCartConfirm} onClose={() => setAddToCartProduct(null)} />
      )}
    </div>
  );
}
