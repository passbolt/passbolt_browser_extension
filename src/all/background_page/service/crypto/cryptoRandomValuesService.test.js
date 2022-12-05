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
  it(`should provide a random value`, async() => {
    expect.assertions(2);
    const value = CryptoRandomValuesService.randomValuesArray(32);
    expect(value.length).toEqual(32);
    // Warning: crypto getRandomValues can't be mock properly
    expect(self.crypto.getRandomValues).toHaveBeenCalledWith(value);
  });
});
