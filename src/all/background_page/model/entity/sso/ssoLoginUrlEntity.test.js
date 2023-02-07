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
 * @since         3.9.0
 */
import EntityValidationError from "../abstract/entityValidationError";
import EntitySchema from "../abstract/entitySchema";
import SsoLoginUrlEntity from "./ssoLoginUrlEntity";
import each from "jest-each";

describe("Sso Login URL Entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SsoLoginUrlEntity.ENTITY_NAME, SsoLoginUrlEntity.getSchema());
  });

  it("constructor works if a valid DTO is provided", () => {
    const availableUrl = [
      'https://login.microsoftonline.com',
      'https://login.microsoftonline.us',
      'https://login.partner.microsoftonline.cn',
    ];

    expect.assertions(availableUrl.length);

    for (let i = 0; i < availableUrl.length; i++) {
      const dto = {
        url: availableUrl[i]
      };
      const entity = new SsoLoginUrlEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    }
  });

  each([
    {scenario: 'Global microsoft online url', url: 'https://login.microsoftonline.com'},
    {scenario: 'US microsoft online url', url: 'https://login.microsoftonline.us'},
    {scenario: 'China microsoft online url', url: 'https://login.partner.microsoftonline.cn'}
  ]).describe("Should accept supported url", test => {
    it(`Should accept supported url: ${test.scenario}`, async() => {
      const dto = {
        url: test.url
      };
      const entity = new SsoLoginUrlEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });
  });

  each([
    {scenario: 'Authorize domain with insecure protocol', url: 'http://login.microsoftonline.com'},
    {scenario: 'Authorize domain with wrong protocol', url: 'ftp://login.microsoftonline.us'},
    {scenario: 'Authorize domain with no protocol', url: 'login.microsoftonline.us'},
    {scenario: 'Not a supported domain', url: 'https://login.microsoft.com'},
    {scenario: 'Authorized domain and protocol but wrong port', url: 'https://login.microsoftonline.com:4443'},
    {scenario: 'Xss attack', url: 'javascript:alert("hey, here is an XSS")'},
    {scenario: 'Subdomain attack', url: 'https://attacker.login.microsoftonline.com'},
    {scenario: 'Regex wild mark attack', url: 'https://loginxmicrosoftonline.com'},
    {scenario: 'Query parameter attack', url: 'https://attacker.com?domain=https://login.microsoftonline.com'},
    {scenario: 'Hash attack', url: 'https://attacker.com#https://login.microsoftonline.com'},
  ]).describe("Should not accept unsupported or attacker url", test => {
    it(`Should not accept unsupported or attacker url: ${test.scenario}`, async() => {
      const dto = {
        url: test.url
      };

      try {
        new SsoLoginUrlEntity(dto);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
      }
    });
  });
});
