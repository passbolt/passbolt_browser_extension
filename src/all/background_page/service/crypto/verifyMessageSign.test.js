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
 * @since         4.3.0
 */

import {pgpKeys} from 'passbolt-styleguide/test/fixture/pgpKeys/keys';
import {OpenpgpAssertion} from '../../utils/openpgp/openpgpAssertions';
import SignMessageService from "./signMessageService";
import VerifyMessageService from './verifyMessageSign';
import * as openpgp from 'openpgp';
import {signedClearMessage, signedMessage} from './verifyMessageSign.test.data';

describe("VerifyMessageService service", () => {
  describe("verifyMessage method", () => {
    it("should verify a signed message", async() => {
      expect.assertions(1);

      const message = await signedMessage();
      const readSignedMessage = await openpgp.readMessage({
        armoredMessage: message // parse armored message
      });
      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.public]);

      await expect(VerifyMessageService.verifyMessage(readSignedMessage, verificationKeys)).resolves.not.toThrow();
    });

    it("should throw an error in case an invalid message", async() => {
      expect.assertions(1);

      const adminDecryptedKey = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.private_decrypted]);
      const promise = VerifyMessageService.verifyMessage("", adminDecryptedKey);

      return expect(promise).rejects.toThrowError(new TypeError("The message should be a valid openpgp message."));
    });
    it("should throw an error in case an invalid private key", async() => {
      expect.assertions(1);
      const messageToSign = await openpgp.createMessage({text: 'my-account-kit'});
      const promise = VerifyMessageService.verifyMessage(messageToSign, [""]);

      return expect(promise).rejects.toThrowError(new Error("The key should be a valid openpgp key."));
    });

    it("should throw an error in case the signature cannot be verified", async() => {
      expect.assertions(1);

      const messageToSign = await openpgp.createMessage({text: 'my-account-kit'});
      const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);

      const signedMessage = await SignMessageService.signMessage(messageToSign, [adminDecryptedKey]);
      //verify the signature
      const readSignedMessage = await openpgp.readMessage({
        armoredMessage: signedMessage // parse armored message
      });

      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.public]);

      await expect(VerifyMessageService.verifyMessage(readSignedMessage, verificationKeys)).rejects.toThrowError(new Error("Could not find signing key with key ID 5b1b332ed06426d3"));
    });
  });

  describe("VerifyClearMessage method", () => {
    it("should verify a signed clear message", async() => {
      expect.assertions(1);

      const message = await signedClearMessage();
      const readSignedMessage = await openpgp.readCleartextMessage({
        cleartextMessage: message // parse armored message
      });
      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.public]);

      await expect(VerifyMessageService.verifyClearMessage(readSignedMessage, verificationKeys)).resolves.not.toThrow();
    });

    it("should throw an error in case an invalid message", async() => {
      expect.assertions(1);

      const adminDecryptedKey = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.private_decrypted]);
      const promise = VerifyMessageService.verifyClearMessage("", adminDecryptedKey);

      return expect(promise).rejects.toThrowError(new TypeError("The message should be a valid openpgp clear text message."));
    });
    it("should throw an error in case an invalid private key", async() => {
      expect.assertions(1);
      const messageToSign = await openpgp.createCleartextMessage({text: 'my-account-kit'});
      const promise = VerifyMessageService.verifyClearMessage(messageToSign, [""]);

      return expect(promise).rejects.toThrowError(new Error("The key should be a valid openpgp key."));
    });

    it("should throw an error in case the signature cannot be verified", async() => {
      expect.assertions(1);

      const messageToSign = await openpgp.createCleartextMessage({text: 'my-account-kit'});
      const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);

      const signedMessage = await SignMessageService.signClearMessage(messageToSign, [adminDecryptedKey]);
      //verify the signature
      const readSignedMessage = await openpgp.readCleartextMessage({
        cleartextMessage: signedMessage // parse armored message
      });

      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.public]);

      await expect(VerifyMessageService.verifyClearMessage(readSignedMessage, verificationKeys)).rejects.toThrowError(new Error("Could not find signing key with key ID 5b1b332ed06426d3"));
    });
  });
});
