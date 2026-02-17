/**
 * Parse an aspect ratio from a hint string like "74x74", "374x243", etc.
 * Returns the numeric ratio (width / height) or undefined if unparseable (free crop).
 */
export function parseAspectRatio(hint?: string): number | undefined {
  if (!hint) return undefined;
  const match = hint.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return undefined;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!w || !h) return undefined;
  return w / h;
}
