#!/usr/bin/env node
// Works around a still-open sharp/Next.js file-tracing gap (see the comment on
// serverExternalPackages in next.config.ts): @img/sharp-<platform>'s compiled
// .node addon dlopen()s its @img/sharp-libvips-<platform> sibling via a
// hardcoded @rpath/$ORIGIN-relative lookup baked in at build time, so neither
// Node's require() graph nor any static tracer (webpack, @vercel/nft) ever
// sees that dependency. It's left out of .next/standalone/node_modules, and
// sharp crashes at runtime on Vercel with:
//   ERR_DLOPEN_FAILED: libvips-cpp.so...: cannot open shared object file
//
// Runs after `next build` (see the "build" script in package.json).
//
// Because the failing lookup is a native dynamic-linker path relative to the
// .node file's own (symlink-resolved) directory — not a Node module-resolution
// path — the fix has to land @img/sharp-libvips-<platform> as an actual sibling
// *inside the same pnpm store folder* as @img/sharp-<platform>, matching
// pnpm's real on-disk layout (confirmed by reproducing the exact ERR_DLOPEN_FAILED
// locally on darwin and inspecting node_modules/.pnpm/@img+sharp-darwin-arm64@*/
// node_modules/@img/, where pnpm itself symlinks sharp-libvips-darwin-arm64
// next to sharp-darwin-arm64). A flat copy elsewhere in node_modules is *not*
// enough, even though it would satisfy plain Node require() resolution.
//
// The exact version matters too, and can't be guessed by globbing the pnpm
// store for "any" @img/sharp-libvips-<platform>@* folder: this project's
// dependency tree carries more than one sharp version at once (an old one
// pulled in transitively — see the Dependabot-alert override in
// pnpm-workspace.yaml), so more than one libvips version can be on disk, and
// copying the wrong one just fails the same dlopen() with a version-mismatched
// .so/.dylib. Instead we read the *exact* required version straight out of
// @img/sharp-<platform>'s own package.json dependencies.
//
// Safe to run for local (non-standalone) builds too — it just no-ops when
// there's no .next/standalone, or the platform's binary was never installed
// (e.g. the linux-x64 package on a macOS dev machine).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const standaloneNodeModules = path.join(projectRoot, '.next', 'standalone', 'node_modules');
const sourceNodeModules = path.join(projectRoot, 'node_modules');

// Only the linux-x64 binary actually runs anywhere we deploy (Vercel).
const PLATFORM_PACKAGE = '@img/sharp-linux-x64';
const LIBVIPS_NAME = 'sharp-libvips-linux-x64'; // unscoped last segment, reused a lot below
const LIBVIPS_PACKAGE = `@img/${LIBVIPS_NAME}`;

// pnpm's central store names each package's folder "<scope>+<name>@<version>"
// (e.g. "@img+sharp-linux-x64@0.35.0").
function pnpmStorePath(nodeModulesDir, pkgName, version) {
  const encoded = `${pkgName.replace('/', '+')}@${version}`;
  return path.join(nodeModulesDir, '.pnpm', encoded, 'node_modules', ...pkgName.split('/'));
}

// Same idea but for when the version isn't known yet — used only to locate
// @img/sharp-linux-x64 itself, which this project pins to a single version
// directly (unlike its libvips dependency, nothing else in the tree pulls in
// a second copy of it).
function findPnpmStoreDirByPrefix(nodeModulesDir, pkgName) {
  const pnpmDir = path.join(nodeModulesDir, '.pnpm');
  if (!fs.existsSync(pnpmDir)) return null;
  const encodedPrefix = `${pkgName.replace('/', '+')}@`;
  const match = fs.readdirSync(pnpmDir).find((name) => name.startsWith(encodedPrefix));
  if (!match) return null;
  const dir = path.join(pnpmDir, match, 'node_modules', ...pkgName.split('/'));
  return fs.existsSync(dir) ? dir : null;
}

if (!fs.existsSync(standaloneNodeModules)) {
  console.log('[copy-sharp-libvips] no .next/standalone output found, skipping');
  process.exit(0);
}

const standalonePlatformDir = findPnpmStoreDirByPrefix(standaloneNodeModules, PLATFORM_PACKAGE);
if (!standalonePlatformDir) {
  console.log(`[copy-sharp-libvips] ${PLATFORM_PACKAGE} not in standalone output, skipping (not built for this platform)`);
  process.exit(0);
}

// Sibling of @img/sharp-linux-x64 within the *same* pnpm store folder — this
// exact directory is what the compiled addon's relative dlopen() lookup needs.
const dest = path.join(path.dirname(standalonePlatformDir), LIBVIPS_NAME);
if (fs.existsSync(dest)) {
  console.log(`[copy-sharp-libvips] ${LIBVIPS_PACKAGE} already present in standalone output, skipping`);
  process.exit(0);
}

const platformPkgJson = JSON.parse(fs.readFileSync(path.join(standalonePlatformDir, 'package.json'), 'utf8'));
const requiredVersion = platformPkgJson.dependencies?.[LIBVIPS_PACKAGE] ?? platformPkgJson.optionalDependencies?.[LIBVIPS_PACKAGE];
if (!requiredVersion) {
  console.log(`[copy-sharp-libvips] ${PLATFORM_PACKAGE}'s package.json doesn't declare a ${LIBVIPS_PACKAGE} dependency, skipping`);
  process.exit(0);
}

const src = pnpmStorePath(sourceNodeModules, LIBVIPS_PACKAGE, requiredVersion);
if (!fs.existsSync(src)) {
  console.log(`[copy-sharp-libvips] ${LIBVIPS_PACKAGE}@${requiredVersion} not installed locally (different build platform?), skipping`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true, dereference: true });
console.log(`[copy-sharp-libvips] copied ${LIBVIPS_PACKAGE}@${requiredVersion} next to ${PLATFORM_PACKAGE} in standalone output`);
