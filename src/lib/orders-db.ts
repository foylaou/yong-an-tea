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
    .from('site_settings')
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

// --- Cart Validation ---

export interface CartItemInput {
  product_id: string;
  quantity: number;
}

export interface ValidatedCartItem {
  product_id: string;
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
  items: CartItemInput[]
): Promise<CartValidationResult> {
  const supabase = createAdminClient();
  const productIds = items.map((i) => i.product_id);

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, sm_image, price, stock_qty, availability, is_active')
    .in('id', productIds);

  if (error) {
    console.error('Failed to validate cart items:', error);
    return { valid: false, items: [], subtotal: 0, errors: ['無法驗證商品資料'] };
  }

  const productMap = new Map(
    (products ?? []).map((p: Record<string, unknown>) => [p.id as string, p])
  );
  const errors: string[] = [];
  const validatedItems: ValidatedCartItem[] = [];
  let subtotal = 0;

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

    if ((product.stock_qty as number) < item.quantity) {
      errors.push(`庫存不足: ${product.title}（剩餘 ${product.stock_qty}）`);
      continue;
    }

    const price = Number(product.price);
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    validatedItems.push({
      product_id: item.product_id,
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
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, unknown>;
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
    p_customer_id: params.customer_id,
    p_customer_name: params.customer_name,
    p_customer_email: params.customer_email,
    p_customer_phone: params.customer_phone,
    p_shipping_address: params.shipping_address,
    p_payment_method: params.payment_method,
    p_shipping_method: params.shipping_method,
    p_shipping_fee: params.shipping_fee,
    p_note: params.note,
    p_items: params.items,
    p_coupon_code: params.coupon_code ?? null,
    p_discount_amount: params.discount_amount ?? 0,
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
