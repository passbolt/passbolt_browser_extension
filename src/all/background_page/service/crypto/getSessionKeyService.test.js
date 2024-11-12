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
 * @since         4.10.1
 */

import GetSessionKeyService from "./getSessionKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "./encryptMessageService";
import DecryptMessageService from "./decryptMessageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import SessionKeyEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeyEntity";


describe("GetSessionKeyService", () => {
  describe("::getFromGpgMessage", () => {
    it("should get the session key string", async() => {
      expect.assertions(2);
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      await DecryptMessageService.decrypt(messageEncrypted, privateKey);
      const sessionKey = GetSessionKeyService.getFromGpgMessage(messageEncrypted);
      const openPgpSessionKey = await OpenpgpAssertion.readSessionKeyOrFail(sessionKey);

      expect(() => EntitySchema.validateProp("session_key", sessionKey, SessionKeyEntity.getSchema().properties.session_key)).not.toThrowError();
      expect(() => OpenpgpAssertion.assertSessionKey(openPgpSessionKey)).not.toThrowError();
    });

    it("should throw an error if the message is not decrypted", async() => {
      expect.assertions(1);
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);

      expect(() => GetSessionKeyService.getFromGpgMessage(messageEncrypted)).toThrowError(Error("The message should be decrypted."));
    });

    it("should throw an error if the message do not contain session key", async() => {
      expect.assertions(1);
      const messageClear = "message clear";
      const message = await OpenpgpAssertion.createMessageOrFail(messageClear);

      expect(() => GetSessionKeyService.getFromGpgMessage(message)).toThrowError(Error("The message should contain at least one session key."));
    });

    it("should throw an error if the message is not valid", async() => {
      expect.assertions(1);
      expect(() => GetSessionKeyService.getFromGpgMessage("message clear")).toThrowError(Error("The message should be a valid openpgp message."));
    });
  });
});
