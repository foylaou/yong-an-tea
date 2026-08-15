'use client';

import { useEffect, useId, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
    onDecoded: (text: string) => void;
    onClose: () => void;
    title?: string;
    hint?: string;
}

export function QrScannerModal({
    onDecoded,
    onClose,
    title = '掃描會員 QR code',
    hint = '將客戶的會員條碼對準相機',
}: QrScannerModalProps) {
    // Unique per instance — two scanners could otherwise collide on the same
    // DOM id if a caller ever mounts more than one at once (this component is
    // now shared by the customer-QR and coupon-QR scan flows).
    const elementId = `pos-qr-scanner-${useId()}`;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const decodedRef = useRef(false);
    // Serializes start()/stop() across React 18 Strict Mode's dev-only
    // mount→cleanup→mount double-invoke of the effect below. React does
    // NOT await a cleanup function's returned promise before running the
    // next mount, so without this queue the second scanner.start() call
    // fires while the first is still mid-teardown — and since useId()
    // gives both invocations the *same* elementId (same component
    // instance), they race to attach competing <video> elements to the
    // same div, producing the double-camera-feed bug. Chaining every
    // start/stop off this ref (which survives across the double-invoke)
    // guarantees the second scanner never starts until the first has
    // fully stopped and cleared.
    const queueRef = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    useEffect(() => {
        let cancelled = false;
        let scanner: Html5Qrcode | null = null;

        queueRef.current = queueRef.current.then(async () => {
            if (cancelled) return;
            scanner = new Html5Qrcode(elementId);
            scannerRef.current = scanner;
            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (cancelled || decodedRef.current) return;
                        decodedRef.current = true;
                        onDecoded(decodedText);
                    },
                    undefined
                );
            } catch {
                // Camera unavailable/denied — leave the modal open with its "找不到客戶" fallback via search.
            }
        });

        return () => {
            cancelled = true;
            queueRef.current = queueRef.current.then(async () => {
                if (!scanner) return;
                // html5-qrcode's stop()/clear() both throw *synchronously*
                // (not rejected Promises) when called outside the exact
                // state they expect — stop() if the scanner isn't
                // RUNNING/PAUSED, clear() if a scan is still stopping.
                // Every step needs its own try/catch, and clear() must be
                // awaited *after* stop() resolves, not fired alongside it.
                try {
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }
                } catch {
                    // already stopped/never started — nothing to do
                }
                try {
                    scanner.clear();
                } catch {
                    // still tearing down — nothing left to clean up visually
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <dialog ref={dialogRef} onClose={onClose} className="modal">
            <div className="modal-box max-w-sm">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-base-content/60 mt-1 text-sm">{hint}</p>
                <div
                    id={elementId}
                    className="mt-4 overflow-hidden rounded-box"
                />
                <div className="modal-action">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-outline"
                    >
                        取消
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>
                    close
                </button>
            </form>
        </dialog>
    );
}
