/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2026 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2026 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.9.0
 */

/**
 * Parse "Name <email>" into { name, email }.
 * @param {string} addr
 * @returns {{name: string, email: string}}
 */
export function parseGpgUserId(addr) {
  if (!addr || typeof addr !== "string") {
    return { name: "", email: "" };
  }

  const { name: rawName, email: rawEmail } = extractParts(addr);

  const name = cleanName(rawName);
  const email = rawEmail.replace(/[\s\xa0]+/g, " ").trim();

  return { name, email };
}

/**
 * Extract raw name and email from addr.
 * @param {string} addr
 * @returns {{name: string, email: string}}
 */
export function extractParts(addr) {
  // First, find all <...> pairs (ignoring those inside quotes)
  const anglePairs = findAngleBracketPairs(addr);

  if (anglePairs.length > 0) {
    const first = anglePairs[0];
    const last = anglePairs[anglePairs.length - 1];
    return {
      name: addr.slice(0, first.start),
      email: addr.slice(last.start + 1, last.end),
    };
  }

  // No angle brackets found
  if (addr.includes("@")) {
    return { name: "", email: addr };
  }
  return { name: addr, email: "" };
}

/**
 * Find all <...> pairs, skipping any inside quoted strings.
 * @param {string} input
 * @returns {Array<{start: number, end: number}>}
 */
export function findAngleBracketPairs(input) {
  const pairs = [];

  for (let position = 0; position < input.length; position++) {
    const character = input[position];

    // Skip escaped characters (handles \", \\, etc. outside quoted strings)
    if (character === "\\") {
      position++;
      continue;
    }

    if (character === '"') {
      const closingQuote = findClosingQuote(input, position);
      position = closingQuote > -1 ? closingQuote : position;
      continue;
    }

    if (character === "<") {
      const closingBracketPosition = input.indexOf(">", position + 1);
      if (closingBracketPosition !== -1) {
        pairs.push({ start: position, end: closingBracketPosition });
        position = closingBracketPosition;
      }
    }
  }

  return pairs;
}

/**
 * Find closing quote, handling \" escapes.
 * @param {string} input
 * @param {number} openingQuotePosition
 * @returns {number} Position of closing quote, or -1 if not found
 */
export function findClosingQuote(input, openingQuotePosition) {
  for (let position = openingQuotePosition + 1; position < input.length; position++) {
    const character = input[position];

    if (character === "\\") {
      position++; // Skip the escaped character
      continue;
    }

    if (character === '"') {
      return position;
    }
  }
  return -1;
}

/**
 * Clean name: collapse whitespace, strip outer quotes, unescape.
 * @param {string} name
 * @returns {string}
 */
export function cleanName(name) {
  name = name.replace(/[\s\xa0]+/g, " ").trim();

  // Strip matching outer quotes
  if (name.length >= 2) {
    const firstChar = name[0];
    const lastChar = name.at(-1);
    const isDoubleQuoted = firstChar === '"' && lastChar === '"';
    const isSingleQuoted = firstChar === "'" && lastChar === "'";
    if (isDoubleQuoted || isSingleQuoted) {
      name = name.slice(1, -1);
    }
  }

  // Unescape \" and \\
  return name.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}
