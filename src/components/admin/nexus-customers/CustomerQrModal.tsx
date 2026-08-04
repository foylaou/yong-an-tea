'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

/** Encoded content for a customer's QR — namespaced so POS scanning can't confuse it with an unrelated QR code. */
export function encodeCustomerQr(customerId: string): string {
  return `yat-customer:${customerId}`;
}

export function decodeCustomerQr(text: string): string | null {
  return text.startsWith('yat-customer:') ? text.slice('yat-customer:'.length) : null;
}

interface CustomerQrModalProps {
  customer: { id: string; name: string };
  onClose: () => void;
}

export function CustomerQrModal({ customer, onClose }: CustomerQrModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    QRCode.toDataURL(encodeCustomerQr(customer.id), { width: 320, margin: 2 }).then(setDataUrl);
  }, [customer.id]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} onClose={onClose} className="modal">
      <div className="modal-box max-w-sm text-center">
        <h3 className="text-lg font-semibold">{customer.name} 的會員條碼</h3>
        <p className="text-base-content/60 mt-1 text-sm">結帳時可用銷售模式的「掃碼」功能快速帶入這位客戶</p>
        <div className="mt-4 flex justify-center">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`${customer.name} 的會員 QR code`} className="rounded-box border-base-300 border" />
          ) : (
            <div className="skeleton h-80 w-80" />
          )}
        </div>
        <div className="modal-action justify-center">
          <button type="button" onClick={onClose} className="btn btn-outline">
            關閉
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
