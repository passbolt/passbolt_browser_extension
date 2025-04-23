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
 * @since         5.1.0
 */

/**
 * Unit tests on FindSignatureService in regard of specifications
 */

import DecryptMessageService from "./decryptMessageService";
import EncryptMessageService from "./encryptMessageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import FindSignatureService from "./findSignatureService";
import ExternalGpgSignatureEntity from "passbolt-styleguide/src/shared/models/entity/gpgkey/externalGpgSignatureEntity";

describe("FindSignatureService", () => {
  describe("::findSignatureForGpgKey", () => {
    it("should find the correct signature from an expected key", async() => {
      expect.assertions(1);

      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKeyA, verifyingKeyB],
        {
          returnOnlyData: false
        });
      const result = await FindSignatureService.findSignatureForGpgKey(resultDecrypt.signatures, verifyingKeyA);
      const signatureExpected = await resultDecrypt.signatures[0].signature;

      const expected = new ExternalGpgSignatureEntity({
        issuer_fingerprint: verifyingKeyA.getFingerprint(),
        is_verified: true,
        created: signatureExpected.packets[0]?.created.toISOString()
      });

      expect(result).toEqual(expected);
    }, 10 * 1000);

    it("should return nothing if the signature cannot be found", async() => {
      expect.assertions(1);

      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKeyA],
        {
          returnOnlyData: false
        });

      const result = await FindSignatureService.findSignatureForGpgKey(resultDecrypt.signatures, verifyingKeyB);

      expect(result).toBeNull();
    }, 10 * 1000);

    it("should work with unverified keys", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, null,
        {
          returnOnlyData: false
        });
      const result = await FindSignatureService.findSignatureForGpgKey(resultDecrypt.signatures, verifyingKeyA);
      const signatureExpected = await resultDecrypt.signatures[0].signature;

      const expected = new ExternalGpgSignatureEntity({
        issuer_fingerprint: verifyingKeyA.getFingerprint(),
        is_verified: false,
        created: signatureExpected.packets[0]?.created.toISOString()
      });

      expect(result).toEqual(expected);
    }, 10 * 1000);
  });
});
