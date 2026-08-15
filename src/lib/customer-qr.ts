/**
 * Namespaced QR encoding for a customer's member barcode — shared between
 * admin POS scanning (CustomerQrModal / CustomerPicker) and the LIFF
 * admin-coupon page, so both read/write the exact same format instead of
 * drifting into two encodings for the same concept.
 */
export function encodeCustomerQr(customerId: string): string {
  return `yat-customer:${customerId}`;
}

export function decodeCustomerQr(text: string): string | null {
  return text.startsWith('yat-customer:') ? text.slice('yat-customer:'.length) : null;
}
