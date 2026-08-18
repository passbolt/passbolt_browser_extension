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

import CryptoRandomValuesService from "./cryptoRandomValuesService";

describe("RandomValue service", () => {
  it(`should provide a random value`, async () => {
    expect.assertions(1);
    const value = CryptoRandomValuesService.randomValuesArray(32);
    expect(value.length).toEqual(32);
  });

  describe("::randomHex", () => {
    it("should generate a non-zero hexadecimal string of the requested bits length", () => {
      expect.assertions(3);
      const hex = CryptoRandomValuesService.randomHex(512);
      expect(hex).toHaveLength(128);
      expect(hex).toMatch(/^[0-9a-f]+$/);
      expect(hex).toMatch(/[^0]/);
    });

    it("should throw if bits is not an integer multiple of 8 between 8 and 65536", () => {
      expect.assertions(7);
      const expectedError = new Error("Number of bits must be an integer multiple of 8 between 8 and 65536.");
      expect(() => CryptoRandomValuesService.randomHex("512")).toThrow(expectedError);
      expect(() => CryptoRandomValuesService.randomHex(512.5)).toThrow(expectedError);
      expect(() => CryptoRandomValuesService.randomHex(9)).toThrow(expectedError);
      expect(() => CryptoRandomValuesService.randomHex(510)).toThrow(expectedError);
      expect(() => CryptoRandomValuesService.randomHex(0)).toThrow(expectedError);
      expect(() => CryptoRandomValuesService.randomHex(65544)).toThrow(expectedError);
      expect(() => CryptoRandomValuesService.randomHex()).toThrow(expectedError);
    });
  });
});
