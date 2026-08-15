import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // NOT `output: 'standalone'` — that's a self-hosting/Docker artifact
    // (.next/standalone) that Vercel's own deploy pipeline never reads; it has
    // its own serverless-function packaging. An earlier attempt at this sharp
    // fix targeted .next/standalone and, unsurprisingly in hindsight, changed
    // nothing on Vercel. Don't reintroduce it without a self-hosted deploy target.
    //
    // sharp bundles a native libvips binary; letting Next's bundler trace/inline
    // it drops the shared library it dlopen()s at runtime, crashing serverless
    // routes on Vercel with ERR_DLOPEN_FAILED. Marking it external makes Next
    // require() it straight from node_modules instead of bundling it.
    //
    // @img/sharp-linux-x64's own require() of its @img/sharp-libvips-linux-x64
    // sibling is dynamic, so static tracing (both webpack's and @vercel/nft's,
    // which is what Vercel's own function packaging is built on) can't discover
    // it — see the still-open https://github.com/lovell/sharp/issues/4543 and
    // https://github.com/lovell/sharp/issues/4567. outputFileTracingIncludes
    // below is the documented, builder-agnostic escape hatch for exactly this
    // ("some [files] were not detected on a per-page basis") — but it only takes
    // effect under Turbopack tracing in this Next version, not `next build
    // --webpack` (confirmed locally: identical outputFileTracingIncludes config
    // was silently a no-op under --webpack, present in the trace under Turbopack).
    // Next 16.2's Turbopack tracer had its own separate bug losing this same
    // package regardless of this setting; we're past that now on 16.3.1, so
    // plain `next build` (Turbopack) is what "build" runs — don't add --webpack
    // back without re-verifying outputFileTracingIncludes still works.
    //
    // Downgrading sharp isn't an option either — 0.35.0+ is pinned via the
    // override below to clear a Dependabot alert for inherited libvips CVEs.
    serverExternalPackages: ['sharp'],
    // The glob below deliberately goes through @img/sharp-linux-x64's OWN pnpm
    // store folder (.../@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64,
    // a symlink pnpm creates there) rather than sharp-libvips-linux-x64's own
    // store folder. Both contain the same files, but outputFileTracingIncludes
    // preserves the matched glob's own path when copying — and the compiled
    // .node addon's dlopen() call looks for its libvips sibling relative to
    // *its own* location (inside @img+sharp-linux-x64@.../node_modules/@img/),
    // not libvips's independent store folder. Pointing the glob at the wrong
    // one silently produces a copy dlopen() never looks at.
    outputFileTracingIncludes: {
        '/api/admin/upload/**': ['./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**'],
        '/api/admin/upload-prepare/**': ['./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**'],
        '/api/admin/upload-commit/**': ['./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**'],
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
