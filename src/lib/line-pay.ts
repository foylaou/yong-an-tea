import { createLinePayClient } from 'line-pay-merchant';
import { createAdminClient } from './supabase/admin';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Cache the settings to avoid DB queries on every call
let cachedSettings: { channelId: string; channelSecret: string; sandbox: boolean } | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getLinePaySettings() {
  const now = Date.now();
  if (cachedSettings && now - cacheTime < CACHE_TTL) {
    return cachedSettings;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['linepay_channel_id', 'linepay_channel_secret', 'linepay_sandbox']);

  if (error || !data) {
    throw new Error('無法讀取 LINE Pay 設定，請至後台系統設定 > LINE Pay 頁面填入金鑰');
  }

  const settings: Record<string, unknown> = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }

  const channelId = String(settings.linepay_channel_id || '');
  const channelSecret = String(settings.linepay_channel_secret || '');

  if (!channelId || !channelSecret) {
    throw new Error('LINE Pay Channel ID 或 Channel Secret 未設定，請至後台系統設定 > LINE Pay 頁面填入');
  }

  cachedSettings = {
    channelId,
    channelSecret,
    sandbox: String(settings.linepay_sandbox || 'true') === 'true',
  };
  cacheTime = now;

  return cachedSettings;
}

async function getLinePayClient() {
  const settings = await getLinePaySettings();
  return createLinePayClient({
    channelId: settings.channelId,
    channelSecretKey: settings.channelSecret,
    env: settings.sandbox ? 'development' : 'production',
  });
}

export interface ReservePaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export async function reservePayment(
  orderId: string,
  orderNumber: string,
  amount: number,
  items: ReservePaymentItem[]
) {
  const client = await getLinePayClient();

  const res = await client.request.send({
    body: {
      amount,
      currency: 'TWD',
      orderId: orderNumber,
      packages: [
        {
          id: orderId,
          amount,
          name: '永安の茶',
          products: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      ],
      redirectUrls: {
        confirmUrl: `${BASE_URL}/api/payments/line-pay/confirm`,
        cancelUrl: `${BASE_URL}/checkout?cancelled=true`,
      },
    },
  });

  if (res.body.returnCode !== '0000') {
    throw new Error(`LINE Pay Reserve failed: ${res.body.returnMessage}`);
  }

  return {
    transactionId: res.body.info.transactionId,
    paymentUrl: res.body.info.paymentUrl.web,
  };
}

export async function confirmPayment(transactionId: string, amount: number) {
  const client = await getLinePayClient();

  const res = await client.confirm.send({
    transactionId,
    body: {
      amount,
      currency: 'TWD',
    },
  });

  if (res.body.returnCode !== '0000') {
    throw new Error(`LINE Pay Confirm failed: ${res.body.returnMessage}`);
  }

  return res.body;
}
