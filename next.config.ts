import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    // sharp bundles a native libvips binary; letting Next's bundler trace/inline it
    // (webpack or Turbopack) drops the shared library it dlopen()s at runtime, which
    // crashes serverless routes on Vercel with ERR_DLOPEN_FAILED. Marking it external
    // makes Next require() it straight from node_modules instead, where the
    // standalone-output file tracer copies the whole package (binaries included).
    serverExternalPackages: ['sharp'],
    images: {
        qualities: [70, 75, 90, 100],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pdborsoflyriklvlcknh.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },

    turbopack: {
        root: import.meta.dirname,
    },

    experimental: {
        proxyClientMaxBodySize: '100mb',
    },
};

export default nextConfig;
