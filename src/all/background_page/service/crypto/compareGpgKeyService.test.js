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
 * @since         3.6.0
 */

/**
 * Unit tests on CompareGpgKeyService in regard of specifications
 */

import CompareGpgKeyService from "./compareGpgKeyService";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("CompareGpgKeyService", () => {
  describe("CompareGpgKeyService::areKeysTheSame", () => {
    it("Should validate with 2 identical keys", async() => {
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const result = await CompareGpgKeyService.areKeysTheSame(key, key);

      expect.assertions(1);
      expect(result).toBe(true);
    }, 10 * 1000);

    it("should reject if keys are different", async() => {
      const keyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const keyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const result = await CompareGpgKeyService.areKeysTheSame(keyA, keyB);

      expect.assertions(1);
      expect(result).toBe(false);
    }, 10 * 1000);

    it("should reject if keys share the same fingerprint but one has an expiration date", async() => {
      const keyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const keyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public_with_expiration_date);
      const result = await CompareGpgKeyService.areKeysTheSame(keyA, keyB);

      expect.assertions(1);
      expect(result).toBe(false);
    }, 10 * 1000);
  });
});
