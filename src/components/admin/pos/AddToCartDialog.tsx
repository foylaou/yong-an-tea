'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdminProduct, ProductVariant } from '@/types/admin-product';

interface AddToCartDialogProps {
  product: AdminProduct;
  onConfirm: (variant: ProductVariant | undefined, quantity: number) => void;
  onClose: () => void;
}

function variantPrice(variant: ProductVariant): number {
  return variant.discount_price || variant.price;
}

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

export function AddToCartDialog({ product, onConfirm, onClose }: AddToCartDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState('1');
  const [step, setStep] = useState<'quantity' | 'variant'>('quantity');

  const variants = product.product_variants || [];
  const hasVariants = variants.length > 0;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function pressKey(key: string) {
    if (key === 'clear') {
      setQuantity('1');
      return;
    }
    if (key === 'back') {
      setQuantity((q) => (q.length > 1 ? q.slice(0, -1) : '1'));
      return;
    }
    setQuantity((q) => {
      const next = q === '1' && key !== '0' ? key : q + key;
      const parsed = parseInt(next, 10);
      if (Number.isNaN(parsed) || parsed > 999) return q;
      return String(parsed);
    });
  }

  function handleQuantityConfirmed() {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    if (hasVariants) {
      setStep('variant');
    } else {
      onConfirm(undefined, qty);
    }
  }

  function handleVariantPicked(variant: ProductVariant) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    onConfirm(variant, qty);
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="modal">
      <div className="modal-box max-w-sm">
        <h3 className="text-lg font-semibold">{product.title}</h3>

        {step === 'quantity' ? (
          <>
            <p className="text-base-content/60 mt-1 text-sm">選擇數量</p>
            <div className="bg-base-200 mt-4 rounded-box py-4 text-center text-4xl font-bold tabular-nums">{quantity}</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {KEYPAD_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => pressKey(key)}
                  className="btn btn-lg btn-outline"
                >
                  {key === 'clear' ? 'C' : key === 'back' ? <span className="iconify lucide--delete size-5" /> : key}
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn btn-outline">
                取消
              </button>
              <button type="button" onClick={handleQuantityConfirmed} className="btn btn-primary flex-1">
                {hasVariants ? '下一步：選擇規格' : '加入購物車'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-base-content/60 mt-1 text-sm">選擇規格（數量 x{quantity}）</p>
            <div className="mt-4 space-y-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleVariantPicked(variant)}
                  className="border-base-300 hover:border-primary hover:bg-primary/5 flex w-full items-center justify-between rounded-box border p-3 text-left"
                >
                  <span className="font-medium">{variant.name}</span>
                  <span className="text-primary font-semibold">${variantPrice(variant).toLocaleString()}</span>
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button type="button" onClick={() => setStep('quantity')} className="btn btn-outline">
                上一步
              </button>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                取消
              </button>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
