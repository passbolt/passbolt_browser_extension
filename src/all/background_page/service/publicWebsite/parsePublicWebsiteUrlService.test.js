/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.7.0
 */

import each from "jest-each";
import ParsePublicWebsiteUrlService from "./parsePublicWebsiteUrlService";

describe("ParsePublicWebsiteUrlService", () => {
  describe("ParsePublicWebsiteUrlService:parse", () => {
    each([
      {scenario: "Passbolt website home page", url: "https://www.passbolt.com"},
      {scenario: "Passbolt website random page", url: "https://www.passbolt.com/roadmap"},
      {scenario: "Passbolt website home page and hash", url: "https://www.passbolt.com#hash"},
      {scenario: "Passbolt website random page and hash", url: "https://www.passbolt.com/roadmap#hash"},
    ]).describe("should parse", _props => {
      it(`should parse: ${_props.scenario}`, () => {
        const parseResult = ParsePublicWebsiteUrlService.regex.test(_props.url);
        expect.assertions(1);
        expect(parseResult).toBeTruthy();
      });
    });

    each([
      {scenario: "No domain given", url: "www.passbolt.com"},
      {scenario: "Not in https", url: "http://www.passbolt.com"},
      {scenario: "From the blog", url: "https://blog.passbolt.com"},
      {scenario: "Domain look alike attack", url: "https://www.passbolt.com.attacker.com"},
      {scenario: "Domain look alike as parameter attack", url: "https://www.attacker.com?https://www.passbolt.com"},
      {scenario: "Domain look alike as hash attack", url: "https://www.attacker.com#https://www.passbolt.com"},
    ]).describe("should not parse", _props => {
      it(`should not parse: ${_props.scenario}`, () => {
        const parseResult = ParsePublicWebsiteUrlService.regex.test(_props.url);
        expect.assertions(1);
        expect(parseResult).toBeFalsy();
      });
    });
  });
});
