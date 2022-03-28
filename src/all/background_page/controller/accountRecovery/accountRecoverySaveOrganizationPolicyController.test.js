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

import {enableFetchMocks} from "jest-fetch-mock";
import {AccountRecoverySaveOrganizationPolicyController} from "./accountRecoverySaveOrganizationPolicyController";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import PassphraseController from "../passphrase/passphraseController";
import {
  createEnabledAccountRecoveryOrganizationPolicyDto,
  enabledAccountRecoveryOrganizationPolicyDto,
  disabledAccountRecoveryOrganizationPolicyDto,
  optInAccountRecoveryOranizationPolicyDto,
  optOutAccountRecoveryOranizationPolicyDto,
  optOutWithNewOrkAccountRecoveryOranizationPolicyDto,
  read3ExistingPrivatePasswords
} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {MockExtension} from "../../../tests/mocks/mockExtension";
import {GetGpgKeyInfoService} from "../../service/crypto/getGpgKeyInfoService";
import {DecryptMessageService} from "../../service/crypto/decryptMessageService";
import {assertKeys} from "../../utils/openpgp/openpgpAssertions";
import {v4 as uuidv4} from "uuid";

jest.mock("../passphrase/passphraseController.js");
jest.mock("../../service/progress/progressService", () => ({
  ProgressService: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    finishStep: jest.fn(),
    close: jest.fn()
  }))
}));

beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoverySaveOrganizationPolicyController", () => {
  describe("AccountRecoverySaveOrganizationPolicyController::exec", () => {
    it("Should save an account recovery organization policy.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());

      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount();
      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);
      const accountRecoveryOrganizationPolicyServerResponse = enabledAccountRecoveryOrganizationPolicyDto();
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(accountRecoveryOrganizationPolicyServerResponse));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPolicyDto = createEnabledAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const createdAccountRecoveryOrganizationPolicy = await controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      const createdAccountRecoveryOrganizationPolicyDto = createdAccountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      // Even if we mock the API result, we ensure the output of the controller.
      expect(createdAccountRecoveryOrganizationPolicyDto).toEqual(accountRecoveryOrganizationPolicyDto);
    });

    it("Should assert the provided account recovery policy dto is valid.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());

      const accountRecoveryOrganizationPolicyDto = {};
      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const controllerPromise = controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      await expect(controllerPromise).rejects.toThrowError(EntityValidationError);
    });

    it("Should assert the provided account recovery private key dto is valid.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());

      const accountRecoveryOrganizationPolicyDto = createEnabledAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {};
      const controllerPromise = controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      await expect(controllerPromise).rejects.toThrowError(EntityValidationError);
    });
  });

  describe("AccountRecoverySaveOrganizationPolicyController scenarios", () => {
    async function areKeysEqual(keyA, keyB) {
      const keyAInfo = await GetGpgKeyInfoService.getKeyInfo(keyA);
      const keyBInfo = await GetGpgKeyInfoService.getKeyInfo(keyB);

      return keyAInfo.keyId === keyBInfo.keyId
        && keyAInfo.fingerprint === keyBInfo.fingerprint;
    }

    async function isKeySignedWithExpectedSignature(key, expectedSigningKey) {
      key = await assertKeys(key);
      expectedSigningKey = await assertKeys(expectedSigningKey);

      const signingKeys = await key.verifyAllUsers([expectedSigningKey]);
      for (let i = 0; i < signingKeys.length; i++) {
        if (signingKeys[i].valid) {
          return true;
        }
      }
      return false;
    }

    async function isKeyRevoked(key) {
      key = await assertKeys(key);
      return key.isRevoked();
    }

    async function isKeyPublic(key) {
      key = await assertKeys(key);
      return !key.isPrivate();
    }

    it(": the current policy is disabled and the new one is enabled", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());
      const currentOrganizationPolicy = disabledAccountRecoveryOrganizationPolicyDto();
      const newOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto();
      const newOrganizationPolicyOrk = newOrganizationPolicy.account_recovery_organization_public_key.armored_key;
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };

      const apiResponse = await controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(6);
      expect(apiResponse.policy).toEqual(newOrganizationPolicy.policy);
      expect(await areKeysEqual(apiResponse.armoredKey, newOrganizationPolicyOrk)).toBe(true);
      expect(await isKeySignedWithExpectedSignature(apiResponse.armoredKey, pgpKeys.admin.public)).toBe(true);
      expect(await isKeyPublic(apiResponse.armoredKey)).toBe(true);
      expect(apiResponse.revokedKey).toBeNull();
      expect(apiResponse.privateKeyPasswords).toBeNull();
    });

    it(": the current policy is enabled and the new one is disabled", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto();
      const newOrganizationPolicy = disabledAccountRecoveryOrganizationPolicyDto();
      const currentOrganizationPolicyORK = currentOrganizationPolicy.account_recovery_organization_public_key.armored_key;
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };

      const apiResponse = await controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(6);
      expect(apiResponse.policy).toEqual(newOrganizationPolicy.policy);

      expect(await areKeysEqual(apiResponse.revokedKey, currentOrganizationPolicyORK)).toBe(true);
      expect(await isKeyRevoked(apiResponse.revokedKey)).toBe(true);
      expect(await isKeyPublic(apiResponse.revokedKey)).toBe(true);
      expect(apiResponse.armoredKey).toBeNull();
      expect(apiResponse.privateKeyPasswords).toBeNull();
    });

    it(": the current policy is enabled and the new one is enabled but the ORK didn't change", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());
      const publicKeyId = uuidv4();
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto({
        public_key_id: publicKeyId
      });
      const newOrganizationPolicy = optOutAccountRecoveryOranizationPolicyDto();
      delete newOrganizationPolicy.account_recovery_organization_public_key;
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };

      const apiResponse = await controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(5);
      expect(apiResponse.policy).toEqual(newOrganizationPolicy.policy);
      expect(apiResponse.armoredKey).toBeNull();
      expect(apiResponse.revokedKey).toBeNull();
      expect(apiResponse.privateKeyPasswords).toBeNull();
      expect(apiResponse.publicKeyId).toBe(publicKeyId);
    });

    it(": the current policy is enabled and the new one is enabled and the ORK changed", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());
      //we use ada's key as this is the one used to cypher the messages for this scenario.
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto({
        account_recovery_organization_public_key: {
          armored_key: pgpKeys.ada.public
        }
      });
      const newOrganizationPolicy = optOutWithNewOrkAccountRecoveryOranizationPolicyDto();
      const newOrganizationPolicyOrk = newOrganizationPolicy.account_recovery_organization_public_key.armored_key;
      const existingPrivateKeyPasswords = read3ExistingPrivatePasswords();
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API get private key passwords.
      fetch.doMockOnce(() => mockApiResponse(existingPrivateKeyPasswords));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.ada.private,
        passphrase: pgpKeys.ada.passphrase
      };

      const apiResponse = await controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(8 + existingPrivateKeyPasswords.length * 2);
      expect(apiResponse.policy).toEqual(newOrganizationPolicy.policy);

      expect(await areKeysEqual(apiResponse.revokedKey, newOrganizationPolicyOrk)).toBe(false);
      expect(await isKeyRevoked(apiResponse.revokedKey)).toBe(true);
      expect(await isKeyPublic(apiResponse.revokedKey)).toBe(true);

      expect(await areKeysEqual(apiResponse.armoredKey, newOrganizationPolicyOrk)).toBe(true);
      expect(await isKeyPublic(apiResponse.armoredKey)).toBe(true);

      expect(apiResponse.privateKeyPasswords).not.toBeNull();
      expect(apiResponse.privateKeyPasswords.length).toBe(existingPrivateKeyPasswords.length);

      const privateKeyPasswords = apiResponse.privateKeyPasswords.items;
      const decryptionKey = pgpKeys.account_recovery_organization_alternative.private_decrypted;
      const expectedFingerprint = pgpKeys.account_recovery_organization_alternative.fingerprint.toUpperCase();
      for (let i = 0; i < privateKeyPasswords.length; i++) {
        const decryptedPassword = await DecryptMessageService.decrypt(privateKeyPasswords[i].data, decryptionKey);
        expect(decryptedPassword).not.toBeNull();
        expect(privateKeyPasswords[i].recipientFingerprint.toUpperCase()).toBe(expectedFingerprint);
      }
    });
  });
});
