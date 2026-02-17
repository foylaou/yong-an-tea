import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        qualities: [70, 75, 90, 100],
    },

    turbopack: {
        root: import.meta.dirname,
    },

    experimental: {
        proxyClientMaxBodySize: '100mb',
    },
};

export default nextConfig;
