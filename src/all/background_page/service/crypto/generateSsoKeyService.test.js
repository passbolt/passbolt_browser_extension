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
import each from "jest-each";
import GenerateSsoKeyService from "./generateSsoKeyService";

describe("GenerateSsoKeyService service", () => {
  each([
    {isExtractable: false, scenario: "non extractable"},
    {isExtractable: true, scenario: "extractable"}
  ]).describe("Should generate a key according to the SSO specification", props => {
    it(`for a key of type: ${props.scenario}`, async() => {
      expect.assertions(1);
      const exepctedAlgo = {
        name: 'AES-GCM',
        length: 256
      };

      const expectedCapabilities = ['encrypt', 'decrypt'];
      const expectedFakeKey = await crypto.subtle.generateKey(exepctedAlgo, props.isExtractable, expectedCapabilities);

      const key = await GenerateSsoKeyService.generateSsoKey(props.isExtractable);
      expect(key).toStrictEqual(expectedFakeKey);
    });
  });
});
