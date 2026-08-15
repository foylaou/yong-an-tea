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
    //
    // Even with --webpack, @img/sharp-linux-x64's own (dynamic, so untraceable by
    // both webpack's and @vercel/nft's static analysis) require() of its
    // @img/sharp-libvips-linux-x64 sibling still gets dropped from .next/standalone
    // — see the still-open https://github.com/lovell/sharp/issues/4543.
    // outputFileTracingIncludes doesn't help either: it's a no-op under --webpack
    // builds in this Next version (only wired up for the Turbopack/turbotrace path).
    // Downgrading sharp isn't an option — 0.35.0+ is pinned via the override below
    // to clear a Dependabot alert for inherited libvips CVEs. `pnpm run build`
    // therefore also runs scripts/copy-sharp-libvips.js afterward, which copies the
    // missing package into .next/standalone/node_modules by hand.
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
