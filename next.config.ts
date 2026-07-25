import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    // sharp bundles a native libvips binary; letting Next's bundler trace/inline it
    // drops the shared library it dlopen()s at runtime, crashing serverless routes
    // on Vercel with ERR_DLOPEN_FAILED. Marking it external makes Next require() it
    // straight from node_modules instead, where the standalone-output file tracer
    // copies the whole package (binaries included).
    //
    // This alone isn't enough on Next 16.2's Turbopack: its file tracer still fails
    // to include sharp's sibling @img/sharp-libvips-linux-x64 package on Vercel
    // (open upstream, fixed in 16.3 canary but not yet backported —
    // https://github.com/lovell/sharp/issues/4567). `pnpm run build` therefore also
    // passes `--webpack`; keep that until upgrading past Next 16.2.
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
