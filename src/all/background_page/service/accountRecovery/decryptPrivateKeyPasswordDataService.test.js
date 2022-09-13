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

import {v4 as uuidv4} from "uuid";
import DecryptPrivateKeyPasswordDataService from "./decryptPrivateKeyPasswordDataService";
import {defaultAccountRecoveryPrivateKeyPasswordDto} from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity.test.data";
import AccountRecoveryPrivateKeyPasswordEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import EncryptMessageService from "../crypto/encryptMessageService";
import {defaultAccountRecoveryPrivateKeyPasswordDecryptedDataDto} from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity.test.data";
import AccountRecoveryPrivateKeyPasswordDecryptedDataEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("DecryptPrivateKeyPasswordDataService", () => {
  describe("DecryptPrivateKeyPasswordDataService:decrypt", () => {
    const expectedDomain = "https://passbolt.local";
    const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto());
    const decryptionArmoredKey = pgpKeys.account_recovery_organization.private_decrypted;
    const verificationUserId = pgpKeys.ada.userId;
    const verificationPublicArmoredKey = pgpKeys.ada.public;

    it("should decrypt a private key password data.", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const privateKeyPasswordDecryptedData = await DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(8);
      expect(privateKeyPasswordDecryptedData).toBeInstanceOf(AccountRecoveryPrivateKeyPasswordDecryptedDataEntity);
      expect(privateKeyPasswordDecryptedData.type).toStrictEqual("account-recovery-private-key-password-decrypted-data");
      expect(privateKeyPasswordDecryptedData.version).toStrictEqual("v1");
      expect(privateKeyPasswordDecryptedData.domain).toStrictEqual(expectedDomain);
      expect(privateKeyPasswordDecryptedData.privateKeyUserId).toStrictEqual(pgpKeys.ada.userId);
      expect(privateKeyPasswordDecryptedData.privateKeyFingerprint).toStrictEqual(pgpKeys.ada.fingerprint);
      expect(privateKeyPasswordDecryptedData.privateKeySecret).toStrictEqual("f7cf1fa06f973a9ecbb5f0e2bc6d1830532e53ad50da231036bd6c8c00dd7c7dc6c07b04004615cd6808bea2cb6a4ce4c46f7f36b8865292c0f7a28cd6f56112");
      expect(Date.parse(privateKeyPasswordDecryptedData.created)).toBeTruthy();
    });

    it("should fail if the given decryption key does not match private key password recipient fingerprint", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The decryption key fingerprint does not match the private key password recipient fingerprint.");
    });

    it("should fail if the private key password cannot be decrypted.", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const data = "decrypt-me-decrypt-me-decrypt-me";
      const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto({data}));
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The message should be a valid openpgp message.");
    });

    it("should fail if the decrypted private key password data cannot be parsed.", async() => {
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization.public);
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const data = await EncryptMessageService.encrypt("decrypt-me-decrypt-me-decrypt-me", key);
      const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto({data}));
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("Unable to parse the decrypted private key password data.");
    });

    it("should fail if the decrypted private key password data entity cannot be created with the decrypted data.", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const privateKeyPasswordDataDto = defaultAccountRecoveryPrivateKeyPasswordDecryptedDataDto({type: "not-a-valid-decrypted-data-entity-type"});
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization.public);
      const data = await EncryptMessageService.encrypt(JSON.stringify(privateKeyPasswordDataDto), key);
      const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto({data}));
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowEntityValidationErrorOnProperties(["type"]);
    });

    it("should fail if the user id contained in the private key password data does not match the verification user id.", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const privateKeyPasswordDataDto = defaultAccountRecoveryPrivateKeyPasswordDecryptedDataDto({private_key_user_id: uuidv4()});
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization.public);
      const data = await EncryptMessageService.encrypt(JSON.stringify(privateKeyPasswordDataDto), key);
      const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto({data}));
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The user id contained in the private key password data does not match the private key target used id.");
    });

    it("should fail if the domain contained in the private key password data does not match the verification domain.", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const privateKeyPasswordDataDto = defaultAccountRecoveryPrivateKeyPasswordDecryptedDataDto({private_key_user_id: uuidv4()});
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization.public);
      const data = await EncryptMessageService.encrypt(JSON.stringify(privateKeyPasswordDataDto), key);
      const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto({data}));
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, "fake domain", verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The domain contained in the private key password data does not match the expected target domain.");
    });

    it("should fail if the fingerprint contained in the private key password data does not match the verification fingerprint.", async() => {
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionArmoredKey);
      const verificationPublicKey = await OpenpgpAssertion.readKeyOrFail(verificationPublicArmoredKey);
      const privateKeyPasswordDataDto = defaultAccountRecoveryPrivateKeyPasswordDecryptedDataDto({private_key_fingerprint: pgpKeys.betty.fingerprint});
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization.public);
      const data = await EncryptMessageService.encrypt(JSON.stringify(privateKeyPasswordDataDto), key);
      const privateKeyPassword = new AccountRecoveryPrivateKeyPasswordEntity(defaultAccountRecoveryPrivateKeyPasswordDto({data}));
      const promise = DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, decryptionKey, expectedDomain, verificationUserId, verificationPublicKey);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The private key password data fingerprint should match the user public fingerprint.");
    });
  });
});
