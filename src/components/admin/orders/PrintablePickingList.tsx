'use client';

import { useEffect } from 'react';

interface PrintablePickingListProps {
  orders: any[];
  siteName: string;
}

const paymentMethodLabel: Record<string, string> = {
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
};

const shippingMethodLabel: Record<string, string> = {
  tcat: '黑貓宅配',
  tcat_b2s: '7-11 超商取貨',
};

export default function PrintablePickingList({
  orders,
  siteName,
}: PrintablePickingListProps) {
  useEffect(() => {
    // Auto-trigger print dialog after render
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .order-slip {
            page-break-after: always;
          }
          .order-slip:last-child {
            page-break-after: auto;
          }
        }
        @media screen {
          body {
            background: #f3f4f6;
          }
        }
      `}</style>

      {/* Screen-only toolbar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => window.print()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          列印
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          關閉
        </button>
        <span className="text-sm text-gray-500">
          共 {orders.length} 筆訂單
        </span>
      </div>

      <div className="max-w-[210mm] mx-auto">
        {orders.map((order) => {
          const address = order.shipping_address || {};
          const items = order.order_items || [];
          const isB2S = order.shipping_method === 'tcat_b2s';

          return (
            <div
              key={order.id}
              className="order-slip bg-white p-8 my-4 print:my-0 print:shadow-none shadow-sm"
              style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-black pb-3 mb-4">
                <div>
                  <h1 className="text-xl font-bold">{siteName}</h1>
                  <p className="text-sm text-gray-600 mt-1">撿貨明細 / 託運單</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-mono font-bold text-lg">{order.order_number}</p>
                  <p className="text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Customer & Shipping info - 2 columns */}
              <div className="grid grid-cols-2 gap-6 mb-4 text-sm">
                <div className="border border-gray-300 rounded p-3">
                  <h3 className="font-bold text-xs text-gray-500 uppercase mb-2">
                    收件人資訊
                  </h3>
                  <p className="font-medium text-base">{order.customer_name}</p>
                  <p>{order.customer_phone}</p>
                  <p className="text-gray-500">{order.customer_email}</p>
                </div>

                <div className="border border-gray-300 rounded p-3">
                  <h3 className="font-bold text-xs text-gray-500 uppercase mb-2">
                    {isB2S ? '取貨門市' : '寄送地址'}
                  </h3>
                  {isB2S ? (
                    <>
                      <p className="font-medium">
                        {shippingMethodLabel[order.shipping_method] || order.shipping_method}
                      </p>
                      {order.store_name && (
                        <p>{order.store_name} ({order.store_id})</p>
                      )}
                      {order.store_address && (
                        <p className="text-gray-600">{order.store_address}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        {shippingMethodLabel[order.shipping_method] || '黑貓宅配'}
                      </p>
                      <p>
                        {address.postal_code && `${address.postal_code} `}
                        {address.city}
                        {address.district}
                        {address.address_line1}
                        {address.address_line2 && ` ${address.address_line2}`}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Payment & tracking row */}
              <div className="flex gap-4 mb-4 text-sm">
                <div className="border border-gray-300 rounded px-3 py-2 flex-1">
                  <span className="text-gray-500">付款方式：</span>
                  <span className="font-medium">
                    {paymentMethodLabel[order.payment_method] || order.payment_method}
                  </span>
                </div>
                {order.tracking_number && (
                  <div className="border border-gray-300 rounded px-3 py-2 flex-1">
                    <span className="text-gray-500">物流編號：</span>
                    <span className="font-mono font-medium">{order.tracking_number}</span>
                  </div>
                )}
              </div>

              {/* Company invoice */}
              {order.company_name && order.company_tax_id && (
                <div className="mb-4 text-sm border border-gray-300 rounded px-3 py-2">
                  <span className="text-gray-500">公司發票：</span>
                  <span className="font-medium">{order.company_name}</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-gray-500">統編：</span>
                  <span className="font-mono font-medium">{order.company_tax_id}</span>
                </div>
              )}

              {/* Items table */}
              <table className="w-full text-sm border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center w-10">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">商品名稱</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-20">單價</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-16">數量</th>
                    <th className="border border-gray-300 px-3 py-2 text-right w-20">小計</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-14 no-print">
                      <span className="text-xs">已撿</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="font-medium">{item.product_title}</span>
                        {item.variant_label && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({item.variant_label})
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        ${Number(item.price).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-bold text-base">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ${Number(item.subtotal).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center no-print">
                        {/* Checkbox for manual picking verification on screen */}
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">商品小計</span>
                    <span>${Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">運費</span>
                    <span>
                      {Number(order.shipping_fee) === 0
                        ? '免運費'
                        : `$${Number(order.shipping_fee).toLocaleString()}`}
                    </span>
                  </div>
                  {Number(order.cod_fee) > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">代收手續費</span>
                      <span>${Number(order.cod_fee).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between py-1 text-red-600">
                      <span>折扣</span>
                      <span>-${Number(order.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-black font-bold text-base mt-1">
                    <span>合計</span>
                    <span>${Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.note && (
                <div className="mt-4 border border-gray-300 rounded p-3 text-sm">
                  <span className="text-gray-500 font-bold">備註：</span>
                  <span>{order.note}</span>
                </div>
              )}

              {/* Footer spacer for picking confirmation */}
              <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-xs text-gray-400 flex justify-between">
                <span>撿貨人員簽名：_________________</span>
                <span>日期：_________________</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
