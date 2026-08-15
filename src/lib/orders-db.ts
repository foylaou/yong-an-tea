import { createAdminClient } from './supabase/admin';

// --- Shipping Settings ---

export interface CodFeeTier {
  max: number;
  fee: number;
}

export interface ShippingSettings {
  shipping_fee: number;
  free_shipping_threshold: number;
  shipping_note: string;
  cod_fee_tiers: CodFeeTier[];
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['shipping_fee', 'free_shipping_threshold', 'shipping_note', 'cod_fee_tiers']);

  if (error) {
    console.error('Failed to fetch shipping settings:', error);
    return { shipping_fee: 100, free_shipping_threshold: 1500, shipping_note: '', cod_fee_tiers: [] };
  }

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  let codFeeTiers: CodFeeTier[] = [];
  try {
    const raw = settings.cod_fee_tiers;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) codFeeTiers = parsed;
  } catch { /* ignore */ }

  return {
    shipping_fee: Number(settings.shipping_fee ?? 100),
    free_shipping_threshold: Number(settings.free_shipping_threshold ?? 1500),
    shipping_note: String(settings.shipping_note ?? ''),
    cod_fee_tiers: codFeeTiers,
  };
}

// --- Payment Method Toggles ---

export interface PaymentToggles {
  linepay: boolean;
  atm: boolean;
  credit_card: boolean;
  cod: boolean;
}

export async function getPaymentToggles(): Promise<PaymentToggles> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('protected_settings')
    .select('key, value')
    .in('key', [
      'payment_linepay_enabled',
      'payment_atm_enabled',
      'payment_credit_card_enabled',
      'payment_cod_enabled',
    ]);

  if (error) {
    console.error('Failed to fetch payment toggles:', error);
    // Default: LINE Pay and COD enabled, ATM and credit card disabled
    return { linepay: true, atm: false, credit_card: false, cod: true };
  }

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return {
    linepay: String(settings.payment_linepay_enabled ?? 'true') !== 'false',
    atm: String(settings.payment_atm_enabled ?? 'false') === 'true',
    credit_card: String(settings.payment_credit_card_enabled ?? 'false') === 'true',
    cod: String(settings.payment_cod_enabled ?? 'true') !== 'false',
  };
}

// --- Bank Transfer Info ---

export interface BankTransferInfo {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
  note: string;
}

export async function getBankTransferInfo(): Promise<BankTransferInfo | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('protected_settings')
    .select('key, value')
    .in('key', [
      'payment_atm_bank_name',
      'payment_atm_bank_code',
      'payment_atm_account_number',
      'payment_atm_account_holder',
      'payment_atm_note',
    ]);

  if (error || !data?.length) return null;

  const settings: Record<string, string> = {};
  for (const row of data) {
    settings[row.key] = String(row.value ?? '');
  }

  if (!settings.payment_atm_account_number) return null;

  return {
    bank_name: settings.payment_atm_bank_name || '',
    bank_code: settings.payment_atm_bank_code || '',
    account_number: settings.payment_atm_account_number || '',
    account_holder: settings.payment_atm_account_holder || '',
    note: settings.payment_atm_note || '',
  };
}

export function calculateCodFee(total: number, tiers: CodFeeTier[]): number {
  if (!tiers.length) return 0;
  const sorted = [...tiers].sort((a, b) => a.max - b.max);
  for (const tier of sorted) {
    if (total <= tier.max) return tier.fee;
  }
  // If total exceeds all tiers, use the last tier's fee
  return sorted[sorted.length - 1].fee;
}

export function calculateShippingFee(
  subtotal: number,
  shippingFee: number,
  freeShippingThreshold: number
): number {
  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
    return 0;
  }
  return shippingFee;
}

export async function getLoyaltyDiscountShowLabel(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'loyalty_discount_show_label')
    .single();
  return data?.value !== 'false';
}

export function calculateLoyaltyDiscount(
  subtotal: number,
  discountType: 'percentage' | 'fixed_amount' | null,
  discountValue: number
): number {
  if (!discountType || discountValue <= 0) return 0;
  if (discountType === 'percentage') return Math.round(subtotal * (discountValue / 100));
  return Math.min(discountValue, subtotal);
}

// --- Cart Validation ---

export interface CartItemInput {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface ValidatedCartItem {
  product_id: string;
  variant_id?: string;
  product_title: string;
  product_image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartValidationResult {
  valid: boolean;
  items: ValidatedCartItem[];
  subtotal: number;
  errors: string[];
}

export async function validateCartItems(
  items: CartItemInput[],
  opts?: { isWholesale?: boolean }
): Promise<CartValidationResult> {
  const isWholesale = opts?.isWholesale ?? false;
  const supabase = createAdminClient();
  const productIds = items.map((i) => i.product_id);

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, sm_image, price, wholesale_price, stock_qty, variant_stock_mode, availability, is_active')
    .in('id', productIds);

  if (error) {
    console.error('Failed to validate cart items:', error);
    return { valid: false, items: [], subtotal: 0, errors: ['無法驗證商品資料'] };
  }

  // Fetch variants if any items reference them
  const variantIds = items.map((i) => i.variant_id).filter(Boolean) as string[];
  let variantMap = new Map<string, Record<string, unknown>>();
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, name, price, discount_price, wholesale_price, stock_qty, is_active, product_id')
      .in('id', variantIds);
    variantMap = new Map(
      (variants ?? []).map((v: Record<string, unknown>) => [v.id as string, v])
    );
  }

  const productMap = new Map(
    (products ?? []).map((p: Record<string, unknown>) => [p.id as string, p])
  );
  const errors: string[] = [];
  const validatedItems: ValidatedCartItem[] = [];
  let subtotal = 0;

  // Pre-calculate total quantity per product (for shared stock mode)
  const productTotalQty = new Map<string, number>();
  for (const item of items) {
    productTotalQty.set(
      item.product_id,
      (productTotalQty.get(item.product_id) ?? 0) + item.quantity
    );
  }

  // Track which products already had shared stock checked
  const sharedStockChecked = new Set<string>();

  for (const item of items) {
    const product = productMap.get(item.product_id) as Record<string, unknown> | undefined;

    if (!product) {
      errors.push(`商品不存在: ${item.product_id}`);
      continue;
    }

    if (!product.is_active) {
      errors.push(`商品已下架: ${product.title}`);
      continue;
    }

    const stockMode = (product.variant_stock_mode as string) || 'shared';
    let price: number;

    if (item.variant_id) {
      const variant = variantMap.get(item.variant_id) as Record<string, unknown> | undefined;
      if (!variant) {
        errors.push(`變體不存在: ${product.title}`);
        continue;
      }
      if (!variant.is_active) {
        errors.push(`變體已下架: ${product.title} - ${variant.name}`);
        continue;
      }

      if (stockMode === 'independent') {
        // Independent: check variant stock
        if ((variant.stock_qty as number) < item.quantity) {
          errors.push(`庫存不足: ${product.title} - ${variant.name}（剩餘 ${variant.stock_qty}）`);
          continue;
        }
      } else {
        // Shared: check product stock with total qty (only once per product)
        if (!sharedStockChecked.has(item.product_id)) {
          sharedStockChecked.add(item.product_id);
          const totalQty = productTotalQty.get(item.product_id) ?? 0;
          if ((product.stock_qty as number) < totalQty) {
            errors.push(`庫存不足: ${product.title}（剩餘 ${product.stock_qty}，需要 ${totalQty}）`);
            continue;
          }
        }
      }

      // discount_price=0 means "no discount" in this DB's convention (not
      // NULL) — nullish coalescing would incorrectly sell it for $0.
      const variantDiscountPrice = Number(variant.discount_price);
      price = variantDiscountPrice > 0 ? variantDiscountPrice : Number(variant.price);
    } else {
      if ((product.stock_qty as number) < item.quantity) {
        errors.push(`庫存不足: ${product.title}（剩餘 ${product.stock_qty}）`);
        continue;
      }
      price = Number(product.price);
      if (isWholesale && product.wholesale_price != null) {
        price = Number(product.wholesale_price);
      }
    }

    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    validatedItems.push({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_title: product.title as string,
      product_image: (product.sm_image as string) || null,
      price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  return {
    valid: errors.length === 0,
    items: validatedItems,
    subtotal,
    errors,
  };
}

// --- Order Creation ---

export interface CreateOrderParams {
  // Exactly one of customer_id (site login) / walk_in_customer_id (POS
  // customer record) must be set.
  customer_id?: string;
  walk_in_customer_id?: string;
  channel?: 'website' | 'phone' | 'line' | 'in_store';
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address?: Record<string, unknown>;
  payment_method: string;
  shipping_method: string;
  shipping_fee: number;
  cod_fee: number;
  note: string;
  items: CartItemInput[];
  coupon_code?: string;
  discount_amount?: number;
  store_id?: string | null;
  store_name?: string | null;
  store_address?: string | null;
  is_wholesale?: boolean;
}

export interface CreateOrderResult {
  order_id: string;
  order_number: string;
  subtotal: number;
  shipping_fee: number;
  cod_fee: number;
  discount_amount: number;
  total: number;
}

export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('create_order_with_items', {
    p_customer_id: params.customer_id ?? null,
    p_walk_in_customer_id: params.walk_in_customer_id ?? null,
    p_channel: params.channel ?? 'website',
    p_customer_name: params.customer_name,
    p_customer_email: params.customer_email ?? null,
    p_customer_phone: params.customer_phone,
    p_shipping_address: params.shipping_address ?? {},
    p_payment_method: params.payment_method,
    p_shipping_method: params.shipping_method,
    p_shipping_fee: params.shipping_fee,
    p_note: params.note,
    p_items: params.items,
    p_coupon_code: params.coupon_code ?? null,
    p_discount_amount: params.discount_amount ?? 0,
    p_is_wholesale: params.is_wholesale ?? false,
    p_cod_fee: params.cod_fee,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as CreateOrderResult;

  // Update store info for B2S orders (not in RPC)
  if (params.store_id) {
    await supabase
      .from('orders')
      .update({
        store_id: params.store_id,
        store_name: params.store_name,
        store_address: params.store_address,
      })
      .eq('id', result.order_id);
  }

  return result;
}
