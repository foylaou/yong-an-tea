import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    // sharp's @img/sharp-<platform> optional dependency reaches its native libvips
    // binary through a sibling @img/sharp-libvips-<platform> package via a pnpm
    // symlink, but sharp dlopen()s that .so from a runtime-computed path rather
    // than a static require — so Next's standalone-output file tracer (@vercel/nft)
    // can't see the dependency via static analysis and never copies the real
    // libvips package into the deployed function, crashing on Vercel with
    // ERR_DLOPEN_FAILED. Confirmed by building this repo for linux/x64 in Docker
    // and inspecting .next/standalone directly — the libvips-linux-x64 package was
    // simply absent. serverExternalPackages keeps sharp from being pointlessly
    // re-bundled; outputFileTracingIncludes below is what actually pulls in the
    // missing libvips binary for the routes that use sharp.
    //
    // `pnpm run build` also passes `--webpack`: Next 16.2's Turbopack has its own
    // separate, upstream-confirmed bug with sharp on Vercel
    // (https://github.com/lovell/sharp/issues/4567, fixed in 16.3 canary, not yet
    // backported) — keep that until upgrading past Next 16.2.
    serverExternalPackages: ['sharp'],
    outputFileTracingIncludes: {
        '/api/admin/upload': [
            './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
            './node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
        ],
        '/api/admin/upload-prepare': [
            './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
            './node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
        ],
        '/api/admin/upload-commit': [
            './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
            './node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*',
        ],
    },
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
