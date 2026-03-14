/**
 * 黑貓宅急便 印單 API 平台 v2.0.5
 * https://api.suda.com.tw/api/Egs/{服務名稱}
 */

import { createAdminClient } from './supabase/admin';

// ---------------------------------------------------------------------------
// 環境設定
// ---------------------------------------------------------------------------

const ENDPOINTS = {
  test: 'https://egs.suda.com.tw:8443/api/Egs',
  production: 'https://api.suda.com.tw/api/Egs',
} as const;

// Cache settings from DB
let cachedSettings: { customerId: string; customerToken: string; sandbox: boolean } | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getTcatSettings() {
  const now = Date.now();
  if (cachedSettings && now - cacheTime < CACHE_TTL) return cachedSettings;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'tcat_test_customer_id',
      'tcat_test_customer_token',
      'tcat_prod_customer_id',
      'tcat_prod_customer_token',
      'tcat_sandbox',
    ]);

  if (error || !data) {
    throw new Error('無法讀取黑貓宅急便設定，請至後台系統設定填入契約客戶代號與授權碼');
  }

  const settings: Record<string, unknown> = {};
  for (const row of data) settings[row.key] = row.value;

  const sandbox = String(settings.tcat_sandbox || 'true') === 'true';

  // Pick the appropriate credential set based on sandbox mode
  const customerId = sandbox
    ? String(settings.tcat_test_customer_id || '')
    : String(settings.tcat_prod_customer_id || '');
  const customerToken = sandbox
    ? String(settings.tcat_test_customer_token || '')
    : String(settings.tcat_prod_customer_token || '');

  const env = sandbox ? '測試' : '正式';
  if (!customerId || !customerToken) {
    throw new Error(`黑貓${env}環境的客戶代號或授權碼未設定，請至後台系統設定填入`);
  }

  cachedSettings = { customerId, customerToken, sandbox };
  cacheTime = now;
  return cachedSettings;
}

/** Clear cached settings (e.g. after updating credentials) */
export function clearTcatCache() {
  cachedSettings = null;
  cacheTime = 0;
}

function getBaseUrl(sandbox: boolean) {
  return sandbox ? ENDPOINTS.test : ENDPOINTS.production;
}

// ---------------------------------------------------------------------------
// 共用常數
// ---------------------------------------------------------------------------

/** 溫層 */
export const Thermosphere = {
  Normal: '0001',   // 常溫
  Cold: '0002',     // 冷藏
  Frozen: '0003',   // 冷凍
} as const;

/** 規格(尺寸) */
export const Spec = {
  S60: '0001',   // 60cm
  M90: '0002',   // 90cm
  L120: '0003',  // 120cm
  XL150: '0004', // 150cm
} as const;

/** 希望配達時間 */
export const DeliveryTime = {
  Before13: '01',  // 13 時前
  PM14To18: '02',  // 14-18 時
  Anytime: '04',   // 不指定
} as const;

/** 收付地點 */
export const ReceiptLocation = {
  Home: '01',    // 到宅
  Station: '02', // 到所
} as const;

/** 商品類別 */
export const ProductTypeId = {
  GeneralFood: '0001',
  Specialty: '0002',
  Liquor: '0003',
  GrainVeg: '0004',
  SeafoodMeat: '0005',
  ThreeC: '0006',
  Appliance: '0007',
  Fashion: '0008',
  DailyLife: '0009',
  Beauty: '0010',
  HealthFood: '0011',
  Medical: '0012',
  Pet: '0013',
  Print: '0014',
  Other: '0015',
} as const;

/** 列印託運單類別 (宅配) */
export const PrintOBTType = {
  A4Two: '01',      // A4 二模宅配
  A4Three: '02',    // A4 三模宅配
  Thermal: '03',    // 熱轉印宅配
} as const;

/** 列印託運單類別 (撿貨) */
export const PrintOBTPickingType = {
  A4Three: '01',  // A4 三模撿貨單
  A4Two: '02',    // A4 二模撿貨單
} as const;

/** 列印託運單類別 (快速到店 B2S) */
export const PrintOBTB2SType = {
  A4Three: '01',  // A4 三模 B2S
  Thermal: '02',  // 熱轉印 B2S
} as const;

// ---------------------------------------------------------------------------
// 共用型別
// ---------------------------------------------------------------------------

export interface TcatBaseResponse {
  SrvTranId: string;
  IsOK: 'Y' | 'N';
  Message: string;
}

// ---------------------------------------------------------------------------
// 共用 HTTP 呼叫
// ---------------------------------------------------------------------------

async function callApi<T>(
  serviceName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const settings = await getTcatSettings();
  const url = `${getBaseUrl(settings.sandbox)}/${serviceName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      CustomerId: settings.customerId,
      CustomerToken: settings.customerToken,
      ...body,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    // DownloadOBT 400 回傳 JSON error
    const text = await res.text();
    let parsed: TcatBaseResponse | undefined;
    try { parsed = JSON.parse(text); } catch { /* ignore */ }
    if (parsed) throw new TcatApiError(parsed.Message, parsed);
    throw new Error(`T-Cat API ${serviceName} HTTP ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/** 下載二進位檔 (DownloadOBT 回傳 PDF 等) */
async function callApiBinary(
  serviceName: string,
  body: Record<string, unknown>,
): Promise<ArrayBuffer> {
  const settings = await getTcatSettings();
  const url = `${getBaseUrl(settings.sandbox)}/${serviceName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      CustomerId: settings.customerId,
      CustomerToken: settings.customerToken,
      ...body,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null) as TcatBaseResponse | null;
    if (json) throw new TcatApiError(json.Message, json);
    throw new Error(`T-Cat API ${serviceName} HTTP ${res.status}`);
  }

  return res.arrayBuffer();
}

export class TcatApiError extends Error {
  response: TcatBaseResponse;
  constructor(message: string, response: TcatBaseResponse) {
    super(message);
    this.name = 'TcatApiError';
    this.response = response;
  }
}

// ---------------------------------------------------------------------------
// 2.1 查詢郵號 ParsingAddress
// ---------------------------------------------------------------------------

export interface ParseAddressRequest {
  /** 郵號格式 01=預設, 02=有+號BASE, 03=郵號+理貨碼, 04=只有BASE, 05=只有郵號 */
  postType?: '01' | '02' | '03' | '04' | '05';
  addresses: string[];
}

export interface ParseAddressResponse extends TcatBaseResponse {
  Data: {
    Addresses: { Search: string; PostNumber: string }[];
  } | null;
}

export async function parseAddress(req: ParseAddressRequest): Promise<ParseAddressResponse> {
  return callApi<ParseAddressResponse>('ParsingAddress', {
    PostType: req.postType ?? '01',
    Addresses: req.addresses.map((addr) => ({ Search: addr })),
  });
}

/** 從完整郵號取得六碼郵碼 (e.g. "71-802-24-B" → "80224B") */
export function extractZipCode(postNumber: string): string {
  const clean = postNumber.replace(/-/g, '');
  return clean.slice(-6);
}

// ---------------------------------------------------------------------------
// 2.2 列印託運單(宅配) PrintOBT
// ---------------------------------------------------------------------------

export interface PrintOBTOrder {
  /** 託運單號，使用系統分配時填空字串 */
  obtNumber?: string;
  orderId: string;
  thermosphere: string;
  spec: string;
  receiptLocation?: string;
  receiptStationNo?: string;
  recipientName: string;
  recipientTel: string;
  recipientMobile: string;
  recipientAddress: string;
  senderName: string;
  senderTel: string;
  senderMobile: string;
  senderZipCode: string;
  senderAddress: string;
  /** yyyyMMdd */
  shipmentDate: string;
  /** yyyyMMdd */
  deliveryDate: string;
  deliveryTime: string;
  isFreight?: 'Y' | 'N';
  isCollection?: 'Y' | 'N';
  collectionAmount?: number;
  isSwipe?: 'Y' | 'N';
  isMobilePay?: 'Y' | 'N';
  isDeclare?: 'Y' | 'N';
  declareAmount?: number;
  productTypeId: string;
  productName: string;
  memo?: string;
}

export interface PrintOBTRequest {
  /** 列印類別 01=使用速達標準版型(系統分配單號) */
  printType?: string;
  printOBTType: string;
  orders: PrintOBTOrder[];
}

export interface PrintOBTResponseData {
  PrintDateTime: string;
  Orders: { OBTNumber: string; OrderId: string }[];
  FileNo: string;
}

export interface PrintOBTResponse extends TcatBaseResponse {
  Data: PrintOBTResponseData | null;
}

export async function printOBT(req: PrintOBTRequest): Promise<PrintOBTResponse> {
  return callApi<PrintOBTResponse>('PrintOBT', {
    PrintType: req.printType ?? '01',
    PrintOBTType: req.printOBTType,
    Orders: req.orders.map((o) => ({
      OBTNumber: o.obtNumber ?? '',
      OrderId: o.orderId,
      Thermosphere: o.thermosphere,
      Spec: o.spec,
      ReceiptLocation: o.receiptLocation ?? '01',
      ReceiptStationNo: o.receiptStationNo ?? '',
      RecipientName: o.recipientName,
      RecipientTel: o.recipientTel,
      RecipientMobile: o.recipientMobile,
      RecipientAddress: o.recipientAddress,
      SenderName: o.senderName,
      SenderTel: o.senderTel,
      SenderMobile: o.senderMobile,
      SenderZipCode: o.senderZipCode,
      SenderAddress: o.senderAddress,
      ShipmentDate: o.shipmentDate,
      DeliveryDate: o.deliveryDate,
      DeliveryTime: o.deliveryTime,
      IsFreight: o.isFreight ?? 'N',
      IsCollection: o.isCollection ?? 'N',
      CollectionAmount: o.collectionAmount ?? 0,
      IsSwipe: o.isSwipe ?? 'N',
      IsMobilePay: o.isMobilePay ?? 'N',
      IsDeclare: o.isDeclare ?? 'N',
      DeclareAmount: o.declareAmount ?? 0,
      ProductTypeId: o.productTypeId,
      ProductName: o.productName,
      Memo: o.memo ?? '',
    })),
  });
}

// ---------------------------------------------------------------------------
// 2.3 列印託運單(撿貨明細) PrintOBTByPickingList
// ---------------------------------------------------------------------------

export interface PickingDetailBody {
  orderId: string;
  productTypeId: string;
  productName: string;
  quantity: number;
  price: number;
  amount: number;
  column01?: string;
  column02?: string;
  column03?: string;
  column04?: string;
}

export interface PickingDetail {
  title: { column01?: string; column02?: string; column03?: string; column04?: string };
  body: PickingDetailBody[];
  totalQuantity?: number;
  totalAmount?: number;
  footer?: { row01?: string; row02?: string; row03?: string; row04?: string };
}

export interface PrintOBTPickingOrder extends Omit<PrintOBTOrder, 'productTypeId' | 'productName'> {
  productTypeId?: string;
  productName?: string;
  detail: PickingDetail;
}

export interface PrintOBTPickingRequest {
  printType?: string;
  printOBTType: string;
  orders: PrintOBTPickingOrder[];
}

export interface PrintOBTPickingResponse extends TcatBaseResponse {
  Data: {
    PrintDateTime: string;
    Orders: {
      OBTNumber: string;
      Picking: { Details: { OrderId: string }[] };
    }[];
    FileNo: string;
  } | null;
}

export async function printOBTByPickingList(
  req: PrintOBTPickingRequest,
): Promise<PrintOBTPickingResponse> {
  return callApi<PrintOBTPickingResponse>('PrintOBTByPickingList', {
    PrintType: req.printType ?? '01',
    PrintOBTType: req.printOBTType,
    Orders: req.orders.map((o) => ({
      OBTNumber: o.obtNumber ?? '',
      Thermosphere: o.thermosphere,
      Spec: o.spec,
      ReceiptLocation: o.receiptLocation ?? '01',
      ReceiptStationNo: o.receiptStationNo ?? '',
      RecipientName: o.recipientName,
      RecipientTel: o.recipientTel,
      RecipientMobile: o.recipientMobile,
      RecipientAddress: o.recipientAddress,
      SenderName: o.senderName,
      SenderTel: o.senderTel,
      SenderMobile: o.senderMobile,
      SenderZipCode: o.senderZipCode,
      SenderAddress: o.senderAddress,
      ShipmentDate: o.shipmentDate,
      DeliveryDate: o.deliveryDate,
      DeliveryTime: o.deliveryTime,
      IsFreight: o.isFreight ?? 'N',
      IsCollection: o.isCollection ?? 'N',
      CollectionAmount: o.collectionAmount ?? 0,
      IsSwipe: o.isSwipe ?? 'N',
      IsMobilePay: o.isMobilePay ?? 'N',
      IsDeclare: o.isDeclare ?? 'N',
      DeclareAmount: o.declareAmount ?? 0,
      ProductTypeId: o.productTypeId ?? '',
      ProductName: o.productName ?? '',
      Memo: o.memo ?? '',
      Detail: {
        Title: {
          Column01: o.detail.title.column01 ?? '',
          Column02: o.detail.title.column02 ?? '',
          Column03: o.detail.title.column03 ?? '',
          Column04: o.detail.title.column04 ?? '',
        },
        Body: o.detail.body.map((b) => ({
          OrderId: b.orderId,
          ProductTypeId: b.productTypeId,
          ProductName: b.productName,
          Quantity: b.quantity,
          Price: b.price,
          Amount: b.amount,
          Column01: b.column01 ?? '',
          Column02: b.column02 ?? '',
          Column03: b.column03 ?? '',
          Column04: b.column04 ?? '',
        })),
        TotalQuantity: o.detail.totalQuantity,
        TotalAmount: o.detail.totalAmount,
        Footer: {
          Row01: o.detail.footer?.row01 ?? '',
          Row02: o.detail.footer?.row02 ?? '',
          Row03: o.detail.footer?.row03 ?? '',
          Row04: o.detail.footer?.row04 ?? '',
        },
      },
    })),
  });
}

// ---------------------------------------------------------------------------
// 2.4 列印託運單(快速到店) PrintOBTByB2S
// ---------------------------------------------------------------------------

export interface PrintOBTB2SOrder {
  obtNumber?: string;
  orderId: string;
  thermosphere: string;
  /** 快速到店最大 120cm */
  spec: string;
  receiveStoreId: string;
  recipientName: string;
  recipientTel: string;
  recipientMobile: string;
  senderName: string;
  senderTel: string;
  senderMobile: string;
  senderZipCode: string;
  senderAddress: string;
  isCollection?: 'Y' | 'N';
  /** 代收金額上限 20000 */
  collectionAmount?: number;
  fbName?: string;
  memo?: string;
}

export interface PrintOBTB2SRequest {
  printType?: string;
  printOBTType: string;
  orders: PrintOBTB2SOrder[];
}

export interface PrintOBTB2SResponse extends TcatBaseResponse {
  Data: {
    PrintDateTime: string;
    Orders: { OBTNumber: string; OrderId: string; DeliveryId: string }[];
    FileNo: string;
  } | null;
}

export async function printOBTByB2S(req: PrintOBTB2SRequest): Promise<PrintOBTB2SResponse> {
  return callApi<PrintOBTB2SResponse>('PrintOBTByB2S', {
    PrintType: req.printType ?? '01',
    PrintOBTType: req.printOBTType,
    Orders: req.orders.map((o) => ({
      OBTNumber: o.obtNumber ?? '',
      OrderId: o.orderId,
      Thermosphere: o.thermosphere,
      Spec: o.spec,
      ReceiveStoreId: o.receiveStoreId,
      RecipientName: o.recipientName,
      RecipientTel: o.recipientTel,
      RecipientMobile: o.recipientMobile,
      SenderName: o.senderName,
      SenderTel: o.senderTel,
      SenderMobile: o.senderMobile,
      SenderZipCode: o.senderZipCode,
      SenderAddress: o.senderAddress,
      IsCollection: o.isCollection ?? 'N',
      CollectionAmount: o.collectionAmount ?? 0,
      FBName: o.fbName ?? '',
      Memo: o.memo ?? '',
    })),
  });
}

// ---------------------------------------------------------------------------
// 2.5 下載託運單 DownloadOBT
// ---------------------------------------------------------------------------

export interface DownloadOBTRequest {
  fileNo: string;
  /** 指定要下載的託運單號 (用於補印) */
  obtNumbers?: string[];
}

export async function downloadOBT(req: DownloadOBTRequest): Promise<ArrayBuffer> {
  const body: Record<string, unknown> = { FileNo: req.fileNo };
  if (req.obtNumbers?.length) {
    body.Orders = req.obtNumbers.map((n) => ({ OBTNumber: n }));
  }
  return callApiBinary('DownloadOBT', body);
}

// ---------------------------------------------------------------------------
// 2.6 呼叫黑貓 Call
// ---------------------------------------------------------------------------

export interface CallTcatRequest {
  customerName?: string;
  contactName: string;
  contactGender?: '01' | '02';
  contactTelArea: string;
  contactTelNumber: string;
  contactTelExt?: string;
  contactMobile: string;
  contactAddress: string;
  normalQuantity: number;
  coldQuantity: number;
  freezeQuantity: number;
  isContact?: 'Y' | 'N';
  isTrolley?: 'Y' | 'N';
  memo?: string;
}

export interface CallTcatResponse extends TcatBaseResponse {}

export async function callTcat(req: CallTcatRequest): Promise<CallTcatResponse> {
  return callApi<CallTcatResponse>('Call', {
    CustomerName: req.customerName ?? '',
    ContactName: req.contactName,
    ContactGender: req.contactGender ?? '',
    ContactTelArea: req.contactTelArea,
    ContactTelNumber: req.contactTelNumber,
    ContactTelExt: req.contactTelExt ?? '',
    ContactMobile: req.contactMobile,
    ContactAddress: req.contactAddress,
    NormalQuantity: req.normalQuantity,
    ColdQuantity: req.coldQuantity,
    FreezeQuantity: req.freezeQuantity,
    IsContact: req.isContact ?? 'N',
    IsTrolley: req.isTrolley ?? 'N',
    Memo: req.memo ?? '',
  });
}

// ---------------------------------------------------------------------------
// 2.7 逆物流-新增 ReserveAdd
// ---------------------------------------------------------------------------

export interface ReverseLogisticsOrder {
  obtNumber?: string;
  orderId?: string;
  thermosphere: string;
  spec: string;
  recipientName: string;
  recipientTel: string;
  recipientMobile: string;
  recipientAddress: string;
  senderName: string;
  senderTel: string;
  senderMobile: string;
  senderAddress: string;
  /** yyyyMMdd, D+1 ~ D+7 */
  takeDate: string;
  deliveryTime: string;
  isFreight?: 'Y' | 'N';
  productName?: string;
  memo?: string;
  recipientZipCode?: string;
  senderZipCode?: string;
}

export interface ReserveAddRequest {
  printType?: string;
  order: ReverseLogisticsOrder;
}

export interface ReserveAddResponse extends TcatBaseResponse {
  Data: {
    Order: { OBTNumber: string; OrderId: string };
  } | null;
}

export async function reserveAdd(req: ReserveAddRequest): Promise<ReserveAddResponse> {
  const o = req.order;
  return callApi<ReserveAddResponse>('ReserveAdd', {
    PrintType: req.printType ?? '01',
    Order: {
      OBTNumber: o.obtNumber ?? '',
      OrderId: o.orderId ?? '',
      Thermosphere: o.thermosphere,
      Spec: o.spec,
      RecipientName: o.recipientName,
      RecipientTel: o.recipientTel,
      RecipientMobile: o.recipientMobile,
      RecipientAddress: o.recipientAddress,
      SenderName: o.senderName,
      SenderTel: o.senderTel,
      SenderMobile: o.senderMobile,
      SenderAddress: o.senderAddress,
      TakeDate: o.takeDate,
      DeliveryTime: o.deliveryTime,
      IsFreight: o.isFreight ?? 'N',
      ProductName: o.productName ?? '',
      Memo: o.memo ?? '',
      RecipientZipCode: o.recipientZipCode ?? '',
      SenderZipCode: o.senderZipCode ?? '',
    },
  });
}

// ---------------------------------------------------------------------------
// 2.8 逆物流-修改 ReserveEdit
// ---------------------------------------------------------------------------

export interface ReserveEditRequest {
  obtNumber: string;
  order: ReverseLogisticsOrder;
}

export interface ReserveEditResponse extends TcatBaseResponse {}

export async function reserveEdit(req: ReserveEditRequest): Promise<ReserveEditResponse> {
  const o = req.order;
  return callApi<ReserveEditResponse>('ReserveEdit', {
    OBTNumber: req.obtNumber,
    Order: {
      OrderId: o.orderId ?? '',
      Thermosphere: o.thermosphere,
      Spec: o.spec,
      RecipientName: o.recipientName,
      RecipientTel: o.recipientTel,
      RecipientMobile: o.recipientMobile,
      RecipientAddress: o.recipientAddress,
      SenderName: o.senderName,
      SenderTel: o.senderTel,
      SenderMobile: o.senderMobile,
      SenderAddress: o.senderAddress,
      TakeDate: o.takeDate,
      DeliveryTime: o.deliveryTime,
      IsFreight: o.isFreight ?? 'N',
      ProductName: o.productName ?? '',
      Memo: o.memo ?? '',
      RecipientZipCode: o.recipientZipCode ?? '',
      SenderZipCode: o.senderZipCode ?? '',
    },
  });
}

// ---------------------------------------------------------------------------
// 2.9 逆物流-刪除 ReserveDelete
// ---------------------------------------------------------------------------

export interface ReserveDeleteResponse extends TcatBaseResponse {}

export async function reserveDelete(obtNumber: string): Promise<ReserveDeleteResponse> {
  return callApi<ReserveDeleteResponse>('ReserveDelete', {
    OBTNumber: obtNumber,
  });
}

// ---------------------------------------------------------------------------
// 2.10 逆物流-單筆查詢 ReserveQuery
// ---------------------------------------------------------------------------

export interface ReserveQueryResponse extends TcatBaseResponse {
  Data: {
    Order: {
      OBTNumber: string;
      OrderId: string;
      Thermosphere: string;
      Spec: string;
      RecipientName: string;
      RecipientTel: string;
      RecipientMobile: string;
      RecipientAddress: string;
      SenderName: string;
      SenderTel: string;
      SenderMobile: string;
      SenderAddress: string;
      TakeDate: string;
      DeliveryTime: string;
      IsFreight: string;
      ProductName: string;
      Memo: string;
      /** 01=未送出集貨(可修改/刪除), 99=已送出集貨(不可修改/刪除) */
      Status: '01' | '99';
      RecipientZipCode: string;
      SenderZipCode: string;
    };
  } | null;
}

export async function reserveQuery(obtNumber: string): Promise<ReserveQueryResponse> {
  return callApi<ReserveQueryResponse>('ReserveQuery', {
    OBTNumber: obtNumber,
  });
}

// ---------------------------------------------------------------------------
// 2.11 查詢託運單貨態 OBTStatus
// ---------------------------------------------------------------------------

export interface OBTStatusItem {
  StatusId: string;
  StatusName: string;
  CreateDateTime: string;
  StationName: string;
}

export interface OBTStatusEntry {
  OBTNumber: string;
  OrderId: string;
  StationName: string;
  CreateDateTime: string;
  CustomerId: string;
  StatusId: string;
  StatusName: string;
  StatusList: OBTStatusItem[];
}

export interface OBTStatusResponse extends TcatBaseResponse {
  Data: {
    OBTs: OBTStatusEntry[];
  } | null;
}

/**
 * 查詢託運單貨態 (上限 10 筆)
 * 注意: 每日最多 3000 次，同時最多 3 個查詢，相同單號每 2 小時限查一次
 */
export async function queryOBTStatus(obtNumbers: string[]): Promise<OBTStatusResponse> {
  if (obtNumbers.length > 10) {
    throw new Error('查詢託運單貨態上限為 10 筆');
  }
  return callApi<OBTStatusResponse>('OBTStatus', {
    OBTNumbers: obtNumbers,
  });
}

// ---------------------------------------------------------------------------
// 貨態代碼表
// ---------------------------------------------------------------------------

export const StatusCodes: Record<string, string> = {
  '100': '已集貨',
  '111': '轉運中',
  '151': '配送中',
  '152': '空運中',
  '153': '當配下車',
  '154': '當配上車',
  '155': '轉寄',
  '159': '暫置營業所',
  '161': '一般退貨',
  '168': '假日暫置',
  '183': '地址錯誤',
  '184': '郵政信箱',
  '185': '航班延誤',
  '186': '航班取消',
  '202': '轉交配送中',
  '204': '委外人員配送中',
  '205': '二迴配送',
  '208': '轉交超商配達',
  '209': '超商取回',
  '211': '不在家',
  '212': '公司行號休息',
  '213': '地址不明',
  '214': '搬家',
  '215': '拒收',
  '216': '另約時間',
  '301': '配完',
  '302': 'BASE 列管',
  '303': '代收退貨',
  '305': '退貨配完',
  '308': '超商通知取回',
  '309': 'B2S 退貨',
  '420': '轉交超商配達刪除',
};

// ---------------------------------------------------------------------------
// 官網貨態查詢連結
// ---------------------------------------------------------------------------

/** 用託運單號產生黑貓官網貨態查詢連結 */
export function getTrackingUrl(obtNumber: string): string {
  return `https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${encodeURIComponent(obtNumber)}`;
}

/** 用訂單編號產生契客專區貨態查詢連結 (需客戶代號及密碼) */
export function getContractTrackingUrl(
  custId: string,
  custPw: string,
  orderId: string,
): string {
  return `https://www.takkyubin.com.tw/ymtcontract/Status/Check.aspx?CustID=${encodeURIComponent(custId)}&CustPW=${encodeURIComponent(custPw)}&OrderID=${encodeURIComponent(orderId)}`;
}

// ---------------------------------------------------------------------------
// 7-11 快速到店 電子地圖 (倉到店)
// ---------------------------------------------------------------------------

/** 7-11 電子地圖溫層類別 */
export const StoreCategory = {
  Normal: '13',  // 常溫
  Frozen: '14',  // 冷凍
  Cold: '15',    // 冷藏
} as const;

const EMAP_ENDPOINTS = {
  test: 'http://egs.suda.com.tw:8080',
  production: 'https://appservice.ezcat.com.tw',
} as const;

export interface EMapParams {
  /** 結果回傳之網址 */
  returnUrl: string;
  /** 自訂識別 key，回傳時原樣帶回 */
  tempVar?: string;
  /** 溫層 (預設常溫 13) */
  storeCategory?: string;
}

/** 取得 7-11 電子地圖 (PC 版) URL 及 POST 表單參數 */
export async function getEMapFormData(params: EMapParams) {
  const settings = await getTcatSettings();
  const base = settings.sandbox ? EMAP_ENDPOINTS.test : EMAP_ENDPOINTS.production;
  return {
    url: `${base}/Map.aspx`,
    fields: {
      CustomerID: settings.customerId,
      ReturnUrl: params.returnUrl,
      TempVar: params.tempVar ?? '',
      StoreCategory: params.storeCategory ?? StoreCategory.Normal,
    },
  };
}

/** 取得 7-11 電子地圖 (手機版) URL 及 POST 表單參數 */
export async function getEMapMobileFormData(params: EMapParams) {
  const settings = await getTcatSettings();
  const base = settings.sandbox ? EMAP_ENDPOINTS.test : EMAP_ENDPOINTS.production;
  return {
    url: `${base}/MobileMap.aspx`,
    fields: {
      CustomerID: settings.customerId,
      ReturnUrl: params.returnUrl,
      TempVar: params.tempVar ?? '',
      StoreCategory: params.storeCategory ?? StoreCategory.Normal,
    },
  };
}

/** 7-11 電子地圖回傳的門市資料 */
export interface EMapStoreResult {
  storeid: string;
  storename: string;
  storeaddress: string;
  /** 0=本島, 1=外島 */
  outside: '0' | '1';
  /** 配送週期 (日一二三四五六), e.g. "1111110" */
  ship: string;
  tempVar?: string;
}

// ---------------------------------------------------------------------------
// 黑貓自取站地圖查詢
// ---------------------------------------------------------------------------

const STATION_MAP_ENDPOINTS = {
  test: 'http://61.57.232.216/TCAT/CAT0001/CAT0001MM1',
  production: 'http://103.234.81.15/TCAT/CAT0001/CAT0001MM1',
} as const;

export interface StationMapParams {
  /** 廠商代號 (預設對應統編) */
  uid: string;
  /** 交易代號 (最多 30 碼英數字) */
  tradeId: string;
  /** 網站金鑰 (預設 16151427) */
  pkey?: string;
}

/** 取得黑貓自取站地圖查詢 URL (帶參數，可回傳選擇結果) */
export async function getStationMapUrl(params: StationMapParams): Promise<string> {
  const settings = await getTcatSettings();
  const base = settings.sandbox ? STATION_MAP_ENDPOINTS.test : STATION_MAP_ENDPOINTS.production;
  const qs = new URLSearchParams({
    UID: params.uid,
    CUST_NO: settings.customerId,
    TRADE_ID: params.tradeId,
    PKEY: params.pkey ?? '16151427',
  });
  return `${base}?${qs.toString()}`;
}

/** 黑貓自取站地圖回傳的站所資料 */
export interface StationMapResult {
  CUST_NO: string;
  TRADE_ID: string;
  OFFICE_NO: string;
  OFFICE_NAME: string;
  OFFICE_ADDRESS: string;
  POSTCODE_NO: string;
}

// ---------------------------------------------------------------------------
// 配送日計算 (跳過不配送日)
// ---------------------------------------------------------------------------

interface TaiwanCalendarDay {
  date: string;       // YYYYMMDD
  week: string;       // 一二三四五六日
  isHoliday: boolean;
  description: string;
}

// Cache holidays per year
const holidayCache: Record<number, Set<string>> = {};
const holidayCacheTime: Record<number, number> = {};
const HOLIDAY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getHolidays(year: number): Promise<Set<string>> {
  const now = Date.now();
  if (holidayCache[year] && now - (holidayCacheTime[year] || 0) < HOLIDAY_CACHE_TTL) {
    return holidayCache[year];
  }

  try {
    const res = await fetch(
      `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const days: TaiwanCalendarDay[] = await res.json();

    const holidays = new Set<string>();
    for (const day of days) {
      if (day.isHoliday && day.description) {
        // Only add named holidays (not regular weekends)
        holidays.add(day.date);
      }
    }
    holidayCache[year] = holidays;
    holidayCacheTime[year] = now;
    return holidays;
  } catch {
    // If fetch fails, return empty set (holidays won't be skipped)
    return holidayCache[year] || new Set();
  }
}

export interface DeliveryDateOptions {
  noSunday?: boolean;
  noSaturday?: boolean;
  noHolidays?: boolean;
}

/**
 * 取得配送設定 from site_settings
 */
export async function getDeliverySettings(): Promise<DeliveryDateOptions> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'tcat_no_delivery_sunday',
      'tcat_no_delivery_saturday',
      'tcat_no_delivery_holidays',
    ]);

  const settings: Record<string, string> = {};
  for (const row of data || []) settings[row.key] = String(row.value || '');

  return {
    noSunday: settings.tcat_no_delivery_sunday !== 'false',     // default true
    noSaturday: settings.tcat_no_delivery_saturday === 'true',  // default false
    noHolidays: settings.tcat_no_delivery_holidays !== 'false', // default true
  };
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * 計算下一個可配送日 (從 baseDate 的隔天開始算)
 * 最多往後找 14 天，找不到就回傳 baseDate + 1
 */
export async function getNextDeliveryDate(
  baseDate: Date,
  options: DeliveryDateOptions,
): Promise<Date> {
  const candidate = new Date(baseDate);
  candidate.setDate(candidate.getDate() + 1);

  // Preload holidays for the relevant year(s)
  const years = new Set([candidate.getFullYear()]);
  const check14 = new Date(candidate);
  check14.setDate(check14.getDate() + 14);
  years.add(check14.getFullYear());

  const holidaySets: Set<string>[] = [];
  if (options.noHolidays) {
    for (const y of years) {
      holidaySets.push(await getHolidays(y));
    }
  }
  const allHolidays = new Set<string>();
  for (const s of holidaySets) {
    for (const d of s) allHolidays.add(d);
  }

  for (let i = 0; i < 14; i++) {
    const dayOfWeek = candidate.getDay(); // 0=Sun, 6=Sat
    const dateStr = fmtDate(candidate);

    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isHoliday = allHolidays.has(dateStr);

    const blocked =
      (options.noSunday && isSunday) ||
      (options.noSaturday && isSaturday) ||
      (options.noHolidays && isHoliday);

    if (!blocked) return new Date(candidate);

    candidate.setDate(candidate.getDate() + 1);
  }

  // Fallback: baseDate + 1
  const fallback = new Date(baseDate);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}
