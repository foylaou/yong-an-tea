'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  onDecoded: (text: string) => void;
  onClose: () => void;
}

const ELEMENT_ID = 'pos-qr-scanner';

export function QrScannerModal({ onDecoded, onClose }: QrScannerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const decodedRef = useRef(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (decodedRef.current) return;
          decodedRef.current = true;
          onDecoded(decodedText);
        },
        undefined
      )
      .catch(() => {
        // Camera unavailable/denied — leave the modal open with its "找不到客戶" fallback via search.
      });

    return () => {
      scanner.stop().catch(() => {});
      scanner.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog ref={dialogRef} onClose={onClose} className="modal">
      <div className="modal-box max-w-sm">
        <h3 className="text-lg font-semibold">掃描會員 QR code</h3>
        <p className="text-base-content/60 mt-1 text-sm">將客戶的會員條碼對準相機</p>
        <div id={ELEMENT_ID} className="mt-4 overflow-hidden rounded-box" />
        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn btn-outline">
            取消
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
