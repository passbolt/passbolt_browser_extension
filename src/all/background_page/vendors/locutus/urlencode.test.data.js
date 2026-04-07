/**
 * Vendored from: locutus v3.0.28
 * Source: https://github.com/locutusjs/locutus/blob/main/src/php/url/urlencode.ts
 * License: MIT
 *
 * SECURITY NOTE: Monitor upstream for advisories:
 * https://github.com/advisories?query=locutus
 *
 * Last reviewed: 2026-03-27
 */

export function urlencode(str) {
  str = String(str);

  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E")
    .replace(/%20/g, "+");
}
