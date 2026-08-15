import type { CSSProperties } from 'react';

// Shared inline styles for the admin-facing LIFF pages (src/pages/liff/admin-*).
// Plain inline styles rather than Tailwind classes — these pages render
// inside LINE's in-app browser as a standalone mobile view, not part of the
// storefront's own themed layout, so there's no reason to pull in its
// Tailwind config/reset.
export const liffStyles = {
    page: {
        minHeight: '100dvh',
        fontFamily: 'sans-serif',
        background: '#f7f7f7',
        paddingBottom: 24,
    } satisfies CSSProperties,
    container: {
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
        padding: '20px 16px',
        boxSizing: 'border-box',
    } satisfies CSSProperties,
    h1: {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 16,
    } satisfies CSSProperties,
    card: {
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #eee',
        padding: 14,
        marginBottom: 10,
    } satisfies CSSProperties,
    primaryButton: {
        padding: '10px 16px',
        fontSize: 14,
        borderRadius: 8,
        background: '#06C755',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
    } satisfies CSSProperties,
    outlineButton: {
        padding: '10px 16px',
        fontSize: 14,
        borderRadius: 8,
        background: '#fff',
        color: '#333',
        border: '1px solid #ccc',
        cursor: 'pointer',
    } satisfies CSSProperties,
    dangerButton: {
        padding: '10px 16px',
        fontSize: 14,
        borderRadius: 8,
        background: '#fff',
        color: '#c00',
        border: '1px solid #f3c0c0',
        cursor: 'pointer',
    } satisfies CSSProperties,
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: 14,
        borderRadius: 8,
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    } satisfies CSSProperties,
    label: {
        display: 'block',
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        marginTop: 10,
    } satisfies CSSProperties,
    errorText: {
        color: '#c00',
        fontSize: 13,
        marginTop: 8,
    } satisfies CSSProperties,
    successText: {
        color: '#0a7d2c',
        fontSize: 13,
        marginTop: 8,
    } satisfies CSSProperties,
    badge: (bg: string, color: string): CSSProperties => ({
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: 11,
        borderRadius: 999,
        background: bg,
        color,
    }),
};
