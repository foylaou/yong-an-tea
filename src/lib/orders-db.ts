import { createAdminClient } from './supabase/admin';

// --- Shipping Settings ---

export interface ShippingSettings {
  shipping_fee: number;
  free_shipping_threshold: number;
  shipping_note: string;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['shipping_fee', 'free_shipping_threshold', 'shipping_note']);

  if (error) {
    console.error('Failed to fetch shipping settings:', error);
    return { shipping_fee: 100, free_shipping_threshold: 1500, shipping_note: '' };
  }

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return {
    shipping_fee: Number(settings.shipping_fee ?? 100),
    free_shipping_threshold: Number(settings.free_shipping_threshold ?? 1500),
    shipping_note: String(settings.shipping_note ?? ''),
  };
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
  note: string;
  items: CartItemInput[];
  coupon_code?: string;
  discount_amount?: number;
}

export interface CreateOrderResult {
  order_id: string;
  order_number: string;
  subtotal: number;
  shipping_fee: number;
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
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CreateOrderResult;
}
