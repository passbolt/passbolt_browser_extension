/**
 * Vendored from: locutus v3.0.28
 * Source: https://github.com/locutusjs/locutus/blob/main/src/php/strings/stripslashes.ts
 * License: MIT
 *
 * SECURITY NOTE: Monitor upstream for advisories:
 * https://github.com/advisories?query=locutus
 *
 * Last reviewed: 2026-03-27
 */

export function stripslashes(str) {
  return String(str).replace(/\\(.?)/g, function (s, n1) {
    switch (n1) {
      case "\\":
        return "\\";
      case "0":
        return "\u0000";
      case "":
        return "";
      default:
        return n1;
    }
  });
}
