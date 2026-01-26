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

import { parseGpgUserId, extractParts, findAngleBracketPairs, findClosingQuote, cleanName } from "./gpgUserIdParser";
import {
  parseScenarios,
  extractPartsScenarios,
  findAngleBracketPairsScenarios,
  findClosingQuoteScenarios,
  cleanNameScenarios,
} from "./gpgUserIdParser.test.data";

/**
 * Unit tests for the GPG User ID parser.
 * Tests RFC 2822 (Address Specification) and RFC 4880 (OpenPGP User ID Packet) compliance.
 * @see https://datatracker.ietf.org/doc/html/rfc2822#section-3.4
 * @see https://datatracker.ietf.org/doc/html/rfc4880#section-5.11
 */
describe("parseGpgUserId", () => {
  it.each(parseScenarios)("should parse %s", (_description, input, expectedName, expectedEmail) => {
    expect.assertions(2);
    const result = parseGpgUserId(input);
    expect(result.name).toStrictEqual(expectedName);
    expect(result.email).toStrictEqual(expectedEmail);
  });
});

describe("extractParts", () => {
  it.each(extractPartsScenarios)("should handle %s", (_description, input, expectedName, expectedEmail) => {
    expect.assertions(1);
    expect(extractParts(input)).toStrictEqual({ name: expectedName, email: expectedEmail });
  });
});

describe("findAngleBracketPairs", () => {
  it.each(findAngleBracketPairsScenarios)("should handle %s", (_description, input, expectedPairs) => {
    expect.assertions(1);
    expect(findAngleBracketPairs(input)).toStrictEqual(expectedPairs);
  });
});

describe("findClosingQuote", () => {
  it.each(findClosingQuoteScenarios)("should handle %s", (_description, input, openingPosition, expectedPosition) => {
    expect.assertions(1);
    expect(findClosingQuote(input, openingPosition)).toBe(expectedPosition);
  });
});

describe("cleanName", () => {
  it.each(cleanNameScenarios)("should handle %s", (_description, input, expected) => {
    expect.assertions(1);
    expect(cleanName(input)).toBe(expected);
  });
});
