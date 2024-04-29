/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.3.0
 */

import DecryptAndParseResourceSecretService from "./decryptAndParseResourceSecretService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import EncryptMessageService from "../crypto/encryptMessageService";
import PlaintextEntity from "../../model/entity/plaintext/plaintextEntity";
import SecretEntity from "../../model/entity/secret/secretEntity";
import {
  resourceTypePasswordAndDescriptionDto,
  resourceTypePasswordStringDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";

describe('DecryptAndParseResourceSecretService', () => {
  describe('decryptAndParse', () => {
    it('should decrypt and parse valid resource secret.', async() => {
      expect.assertions(2);
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const plaintextSecretDto = {password: 'password-test', description: "description-test"};
      const plaintextSecretMessage = JSON.stringify(plaintextSecretDto);
      const encryptedSecretMessage = await EncryptMessageService.encrypt(plaintextSecretMessage, publicKey);
      const secret = new SecretEntity({data: encryptedSecretMessage});
      const secretSchema = resourceTypePasswordAndDescriptionDto().definition.secret;
      const plaintextSecret = await DecryptAndParseResourceSecretService.decryptAndParse(secret, secretSchema, privateKey);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.toDto()).toEqual(plaintextSecretDto);
    });

    it('should not accept secret without valid data message.', async() => {
      expect.assertions(1);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const data = "-----BEGIN PGP MESSAGE-----\n"
        + " invalid-secret-message\n"
        + "-----END PGP MESSAGE-----";
      const secret = new SecretEntity({data});
      const secretSchema = resourceTypePasswordAndDescriptionDto().definition.secret;
      const resultPromise = DecryptAndParseResourceSecretService.decryptAndParse(secret, secretSchema, privateKey);
      await expect(resultPromise).rejects.toThrow('The message should be a valid openpgp message.');
    });
  });

  describe('parse', () => {
    it('should parse a resource without encrypted description plaintext secret.', async() => {
      expect.assertions(2);
      const secretMessage = "password";
      const secretSchema = resourceTypePasswordStringDto().definition.secret;
      const plaintextSecret = await DecryptAndParseResourceSecretService.parse(secretMessage, secretSchema);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.password).toEqual(secretMessage);
    });

    it('should parse a resource with encrypted description plaintext secret.', async() => {
      expect.assertions(3);
      const secretMessage = '{"password":"password-test","description":"description-test"}';
      const secretSchema = resourceTypePasswordAndDescriptionDto().definition.secret;
      const plaintextSecret = await DecryptAndParseResourceSecretService.parse(secretMessage, secretSchema);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.password).toEqual("password-test");
      expect(plaintextSecret.description).toEqual("description-test");
    });

    it('should not parse a resource with encrypted description plaintext secret with an invalid json secret.', async() => {
      expect.assertions(1);
      const secretMessage = 'invalid-json';
      const secretSchema = resourceTypePasswordAndDescriptionDto().definition.secret;
      const resultPromise = DecryptAndParseResourceSecretService.parse(secretMessage, secretSchema);
      await expect(resultPromise).rejects.toThrow('Unable to parse the secret.');
    });
  });
});
