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
import "../../../../../test/mocks/mockCryptoKey";
import GenerateSsoIvService from "./generateSsoIvService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GenerateSsoIv service", () => {
  it("should generate an IV compatible with SSO's algorithm by default", async() => {
    expect.assertions(3);

    const iv = await GenerateSsoIvService.generateIv();
    expect(iv).toBeInstanceOf(Uint8Array);
    expect(iv.length).toBe(12);
    expect(crypto.getRandomValues).toHaveBeenCalledTimes(1);
  });

  it("should generate an IV with the demanded size", async() => {
    expect.assertions(3);

    const iv2 = await GenerateSsoIvService.generateIv(6);
    expect(iv2).toBeInstanceOf(Uint8Array);
    expect(iv2.length).toBe(6);
    expect(crypto.getRandomValues).toHaveBeenCalledTimes(1);
  });
});
