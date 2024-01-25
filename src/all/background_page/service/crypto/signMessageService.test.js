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

import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import {OpenpgpAssertion} from '../../utils/openpgp/openpgpAssertions';
import SignMessageService from "./signMessageService";
import VerifyMessageService from './verifyMessageSign';
import * as openpgp from 'openpgp';

describe("SignMessageService service", () => {
  describe("signMessage method", () => {
    it("should sign a given message key with a provide key provided", async() => {
      expect.assertions(1);

      const messageToSign = await openpgp.createMessage({text: 'my-account-kit'});
      const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);

      const signedMessage = await SignMessageService.signMessage(messageToSign, [adminDecryptedKey]);
      //verify the signature
      const readSignedMessage = await openpgp.readMessage({
        armoredMessage: signedMessage // parse armored message
      });

      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.public]);

      await expect(VerifyMessageService.verifyMessage(readSignedMessage, verificationKeys)).resolves.not.toThrow();
    });

    it("should throw an error in case an invalid message", async() => {
      expect.assertions(1);

      const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);
      const promise = SignMessageService.signMessage("", [adminDecryptedKey]);

      return expect(promise).rejects.toThrowError(new TypeError("The message should be a valid openpgp message."));
    });

    it("should throw an error in case an invalid private key", async() => {
      expect.assertions(1);
      const messageToSign = await openpgp.createMessage({text: 'my-account-kit'});
      const promise = SignMessageService.signMessage(messageToSign, "");

      return expect(promise).rejects.toThrowError(new Error("The keys should be an array of valid decrypted openpgp private keys."));
    });
  });

  describe("signClearMessage method", () => {
    it("should sign a given message with a provided key", async() => {
      expect.assertions(1);

      const messageToSign = await openpgp.createCleartextMessage({text: 'my-account-kit'});
      const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);

      const signedMessage = await SignMessageService.signClearMessage(messageToSign, [adminDecryptedKey]);
      //verify the signature
      const readSignedMessage = await openpgp.readCleartextMessage({
        cleartextMessage: signedMessage // parse armored message
      });

      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.public]);

      await expect(VerifyMessageService.verifyClearMessage(readSignedMessage, verificationKeys)).resolves.not.toThrow();
    });

    it("should throw an error in case an invalid message", async() => {
      expect.assertions(1);

      const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);
      const promise = SignMessageService.signClearMessage("", [adminDecryptedKey]);

      return expect(promise).rejects.toThrowError(new TypeError("The message should be a valid openpgp clear text message."));
    });

    it("should throw an error in case an invalid private key", async() => {
      expect.assertions(1);
      const messageToSign = await openpgp.createCleartextMessage({text: 'my-account-kit'});
      const promise = SignMessageService.signClearMessage(messageToSign, "");

      return expect(promise).rejects.toThrowError(new Error("The keys should be an array of valid decrypted openpgp private keys."));
    });
  });
});

