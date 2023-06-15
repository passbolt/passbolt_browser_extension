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
import {enableFetchMocks} from "jest-fetch-mock";
import AccountRecoverySaveOrganizationPolicyController from "./accountRecoverySaveOrganizationPolicyController";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {PassphraseController} from "../passphrase/passphraseController";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import MockExtension from "../../../../../test/mocks/mockExtension";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import {
  createEnabledAccountRecoveryOrganizationPolicyDto,
  disabledAccountRecoveryOrganizationPolicyDto,
  enabledAccountRecoveryOrganizationPolicyDto,
  optInAccountRecoveryOranizationPolicyDto,
  optOutAccountRecoveryOranizationPolicyDto,
  optOutWithNewOrkAccountRecoveryOrganizationPolicyDto
} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {
  bettyAccountRecoveryPrivateKeyPasswordDto,
  defaultAccountRecoveryPrivateKeyPasswordDto,
  secretSubstitutionAttackAccountRecoveryPrivateKeyPasswordDto
} from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity.test.data";
import AccountRecoveryPrivateKeyPasswordDecryptedDataEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

jest.mock("../passphrase/passphraseController.js");
jest.mock("../../service/progress/progressService");

beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoverySaveOrganizationPolicyController", () => {
  const account = new AccountEntity(adminAccountDto());
  describe("AccountRecoverySaveOrganizationPolicyController::exec", () => {
    it("Should save an account recovery organization policy.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);

      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount();
      // Mock user passphrase capture.
      PassphraseController.get.mockResolvedValue(pgpKeys.ada.passphrase);
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

      expect.assertions(3);
      const createdAccountRecoveryOrganizationPolicyDto = createdAccountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      expect(createdAccountRecoveryOrganizationPolicyDto.policy).toEqual(AccountRecoveryOrganizationPolicyEntity.POLICY_OPT_OUT);
      expect(createdAccountRecoveryOrganizationPolicyDto.account_recovery_organization_public_key.fingerprint).toEqual(pgpKeys.account_recovery_organization.fingerprint);
      await expect(createdAccountRecoveryOrganizationPolicyDto.account_recovery_organization_public_key.armored_key).toBeOpenpgpKeySignedBy(pgpKeys.ada.public);
    });

    it("Should enable an account recovery organization policy previously disabled.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);
      const currentOrganizationPolicy = disabledAccountRecoveryOrganizationPolicyDto();
      const newOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto();
      const newOrganizationPolicyOrk = newOrganizationPolicy.account_recovery_organization_public_key.armored_key;
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
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
      await expect(apiResponse.armoredKey).toBeEqualToOpenpgpKey(newOrganizationPolicyOrk);
      await expect(apiResponse.armoredKey).toBeOpenpgpKeySignedBy(pgpKeys.admin.public);
      await expect(apiResponse.armoredKey).toBeOpenpgpPublicKey();
      expect(apiResponse.revokedKey).toBeNull();
      expect(apiResponse.privateKeyPasswords).toBeNull();
    });

    it("Should disable an account recovery organization policy previously enabled.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto();
      const newOrganizationPolicy = disabledAccountRecoveryOrganizationPolicyDto();
      const currentOrganizationPolicyORK = currentOrganizationPolicy.account_recovery_organization_public_key.armored_key;
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };

      const apiResponse = await controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(7);
      expect(apiResponse.policy).toEqual(newOrganizationPolicy.policy);

      await expect(apiResponse.revokedKey).toBeEqualToOpenpgpKey(currentOrganizationPolicyORK);
      await expect(apiResponse.revokedKey).toBeOpenpgpRevokedKey();
      await expect(apiResponse.revokedKey).toBeOpenpgpPublicKey();
      await expect(apiResponse.revokedKey).toBeOpenpgpKeySignedBy([pgpKeys.account_recovery_organization.public]);
      expect(apiResponse.armoredKey).toBeNull();
      expect(apiResponse.privateKeyPasswords).toBeNull();
    });

    it("Should change an account recovery organization policy without changing the organization key.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);
      const publicKeyId = uuidv4();
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto({
        public_key_id: publicKeyId
      });
      const newOrganizationPolicy = optOutAccountRecoveryOranizationPolicyDto();
      delete newOrganizationPolicy.account_recovery_organization_public_key;
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
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

    it("Should rotate an account recovery organization key.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto();
      const newOrganizationPolicy = optOutWithNewOrkAccountRecoveryOrganizationPolicyDto();
      const newOrganizationPolicyOrk = newOrganizationPolicy.account_recovery_organization_public_key.armored_key;
      const existingPrivateKeyPasswords = [
        defaultAccountRecoveryPrivateKeyPasswordDto(),
        bettyAccountRecoveryPrivateKeyPasswordDto(),
      ];
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API get private key passwords.
      fetch.doMockOnce(() => mockApiResponse(existingPrivateKeyPasswords));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };

      const apiResponse = await controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(10 + existingPrivateKeyPasswords.length * 7);
      expect(apiResponse.policy).toEqual(newOrganizationPolicy.policy);

      await expect(apiResponse.revokedKey).not.toBeEqualToOpenpgpKey(newOrganizationPolicyOrk);
      await expect(apiResponse.revokedKey).toBeOpenpgpRevokedKey();
      await expect(apiResponse.revokedKey).toBeOpenpgpPublicKey();
      await expect(apiResponse.revokedKey).toBeOpenpgpKeySignedBy([pgpKeys.account_recovery_organization.public]);

      await expect(apiResponse.armoredKey).toBeEqualToOpenpgpKey(newOrganizationPolicyOrk);
      await expect(apiResponse.armoredKey).toBeOpenpgpPublicKey();
      await expect(apiResponse.armoredKey).toBeOpenpgpKeySignedBy([pgpKeys.account_recovery_organization.public]);

      expect(apiResponse.privateKeyPasswords).not.toBeNull();
      expect(apiResponse.privateKeyPasswords.length).toBe(existingPrivateKeyPasswords.length);

      const privateKeyPasswords = apiResponse.privateKeyPasswords.items;
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization_alternative.private_decrypted);
      const expectedFingerprint = pgpKeys.account_recovery_organization_alternative.fingerprint.toUpperCase();

      const verificationKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.admin.public, pgpKeys.account_recovery_organization.public]);

      // First password.
      expect(privateKeyPasswords[0].recipientFingerprint.toUpperCase()).toBe(expectedFingerprint);
      const firstPasswordMessage = await OpenpgpAssertion.readMessageOrFail(privateKeyPasswords[0].data);
      const decryptedPassword1 = await DecryptMessageService.decrypt(firstPasswordMessage, decryptionKey, verificationKeys);
      const privateKeyPasswordDecryptedData1 = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(JSON.parse(decryptedPassword1));
      expect(privateKeyPasswordDecryptedData1.type).toEqual("account-recovery-private-key-password-decrypted-data");
      expect(privateKeyPasswordDecryptedData1.domain).toEqual("https://passbolt.local");
      expect(privateKeyPasswordDecryptedData1.version).toEqual("v1");
      expect(privateKeyPasswordDecryptedData1.privateKeyFingerprint).toEqual(pgpKeys.ada.fingerprint);
      expect(privateKeyPasswordDecryptedData1.privateKeyUserId).toEqual(pgpKeys.ada.userId);
      expect(privateKeyPasswordDecryptedData1.privateKeySecret).toHaveLength(128);

      // Second password.
      expect(privateKeyPasswords[1].recipientFingerprint.toUpperCase()).toBe(expectedFingerprint);
      const secondPasswordMessage = await OpenpgpAssertion.readMessageOrFail(privateKeyPasswords[1].data);
      const decryptedPassword2 = await DecryptMessageService.decrypt(secondPasswordMessage, decryptionKey, verificationKeys);
      const privateKeyPasswordDecryptedData2 = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(JSON.parse(decryptedPassword2));
      expect(privateKeyPasswordDecryptedData2.type).toEqual("account-recovery-private-key-password-decrypted-data");
      expect(privateKeyPasswordDecryptedData2.domain).toEqual("https://passbolt.local");
      expect(privateKeyPasswordDecryptedData2.version).toEqual("v1");
      expect(privateKeyPasswordDecryptedData2.privateKeyFingerprint).toEqual(pgpKeys.betty.fingerprint);
      expect(privateKeyPasswordDecryptedData2.privateKeyUserId).toEqual(pgpKeys.betty.userId);
      expect(privateKeyPasswordDecryptedData2.privateKeySecret).toHaveLength(128);
    });

    it("Should assert that no undesirable content is re-encrypted while rotating the organization key and protect against secret substitution attack.", async() => {
      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      // Mock user passphrase capture.
      PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
      // Mock API get account recovery organization policy.
      const currentOrganizationPolicy = optInAccountRecoveryOranizationPolicyDto();
      fetch.doMockOnce(() => mockApiResponse(currentOrganizationPolicy));
      // Mock API get private key passwords.
      const existingPrivateKeyPasswords = [
        defaultAccountRecoveryPrivateKeyPasswordDto(),
        secretSubstitutionAttackAccountRecoveryPrivateKeyPasswordDto(),
      ];
      fetch.doMockOnce(() => mockApiResponse(existingPrivateKeyPasswords));

      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);
      const newOrganizationPolicy = optOutWithNewOrkAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const promise = controller.exec(newOrganizationPolicy, accountRecoveryOrganizationPrivateKeyDto);

      await expect(promise).rejects.toThrowEntityValidationErrorOnProperties(["type"]);
    });

    it("Should assert the provided account recovery policy dto is valid.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);

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
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions(), account);

      const accountRecoveryOrganizationPolicyDto = createEnabledAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {};
      const controllerPromise = controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      await expect(controllerPromise).rejects.toThrowError(EntityValidationError);
    });
  });
});
