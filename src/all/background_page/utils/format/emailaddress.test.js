/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */

import goog from "./emailaddress";
import { parseScenarios, getTokenScenarios, isEscapedDlQuoteScenarios } from "./emailaddress.test.data";

/**
 * Unit tests for the GPG User ID parser.
 * Tests RFC 2822 (Address Specification) and RFC 4880 (OpenPGP User ID Packet) compliance.
 * @see https://datatracker.ietf.org/doc/html/rfc2822#section-3.4
 * @see https://datatracker.ietf.org/doc/html/rfc4880#section-5.11
 */
describe("goog.format.EmailAddress", () => {
  describe("::parse", () => {
    it.each(parseScenarios)("should parse %s", (_description, input, expectedName, expectedEmail) => {
      expect.assertions(2);
      const result = goog.format.EmailAddress.parse(input);
      expect(result.name_).toStrictEqual(expectedName);
      expect(result.address_).toStrictEqual(expectedEmail);
    });
  });

  describe("::getToken_", () => {
    it.each(getTokenScenarios)("should extract %s", (_description, input, position, expectedToken) => {
      expect.assertions(1);
      const result = goog.format.EmailAddress.getToken_(input, position);
      expect(result).toStrictEqual(expectedToken);
    });
  });

  describe("::isEscapedDlQuote_", () => {
    it.each(isEscapedDlQuoteScenarios)(
      "should return correct result for %s",
      (_description, input, position, expectedResult) => {
        expect.assertions(1);
        const result = goog.format.EmailAddress.isEscapedDlQuote_(input, position);
        expect(result).toStrictEqual(expectedResult);
      },
    );
  });
});
