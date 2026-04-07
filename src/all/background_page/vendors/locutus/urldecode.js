/**
 * Vendored from: locutus v3.0.28
 * Source: https://github.com/locutusjs/locutus/blob/main/src/php/url/urldecode.ts
 * License: MIT
 *
 * SECURITY NOTE: Monitor upstream for advisories:
 * https://github.com/advisories?query=locutus
 *
 * Last reviewed: 2026-03-27
 */

export function urldecode(str) {
  return decodeURIComponent(
    String(str)
      .replace(/%(?![\da-f]{2})/gi, function () {
        // PHP tolerates poorly formed escape sequences
        return "%25";
      })
      .replace(/\+/g, "%20"),
  );
}
