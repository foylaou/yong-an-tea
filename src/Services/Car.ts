export const bufferUtils = {
    /**
     * 將 ArrayBuffer 轉換為 Base64URL 字串
     *
     * @param {ArrayBuffer} buffer 要轉換的 ArrayBuffer
     * @returns {string} Base64URL 格式的字串
     */
    bufferToBase64URLString(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        const chars: string[] = Array.from(bytes).map(byte => String.fromCharCode(byte));
        const base64 = btoa(chars.join(''));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },
    arrayBufferToBase64Url(buffer: ArrayBuffer): string {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },
    base64UrlDecode(input: string): string {
        // 將 Base64URL 字串還原成標準 Base64 格式
        let base64 = input.replace(/-/g, '+').replace(/_/g, '/');

        // 如果字串長度不是 4 的倍數，補 `=`（因 Base64 需 4 的倍數）
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        // 使用 `atob()` 解碼
        return decodeURIComponent(escape(atob(base64)));
    }
}