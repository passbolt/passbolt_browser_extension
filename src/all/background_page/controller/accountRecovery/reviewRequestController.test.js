/**
 * @jest-environment node
 */
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
import each from "jest-each";
import {ReviewRequestController} from "./reviewRequestController";
import {DecryptMessageService} from "../../service/crypto/decryptMessageService";
import {DecryptPrivateKeyService} from "../../service/crypto/decryptPrivateKeyService";
import {InvalidMasterPasswordError} from "../../error/invalidMasterPasswordError";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {
  pendingAccountRecoveryRequestDto,
  pendingAccountRecoveryRequestWithoutPrivateKeyDto,
  pendingAccountRecoveryRequestWithoutPrivateKeyPasswordDto,
} from "../../model/entity/accountRecovery/accountRecoveryRequestEntity.test.data";
import {adminAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {AccountEntity} from "../../model/entity/account/accountEntity";
import {Keyring} from "../../model/keyring";
import {AccountRecoveryPrivateKeyPasswordDecryptedDataEntity} from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {
  disabledAccountRecoveryOrganizationPolicyDto,
  enabledAccountRecoveryOrganizationPolicyDto
} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {AccountRecoveryResponseEntity} from "../../model/entity/accountRecovery/accountRecoveryResponseEntity";
import PassphraseController from "../passphrase/passphraseController";
import {MockExtension} from "../../../tests/mocks/mockExtension";

jest.mock("../passphrase/passphraseController.js");

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  jest.useFakeTimers();
  PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
});

describe("ReviewRequestController", () => {
  describe("ReviewRequestController::exec", () => {
    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(adminAccountDto());
    const requestId = uuidv4();
    const requestDto = pendingAccountRecoveryRequestDto({id: requestId, user_id: pgpKeys.ada.userId});
    const privateKeyDto = {
      armored_key: pgpKeys.account_recovery_organization.private,
      passphrase: pgpKeys.account_recovery_organization.passphrase
    };

    it("Should save a review account recovery request if approved.", async() => {
      // Import the public key of the user requesting an account recovery in the keyring, it will be used to check the signature on the account recovery private key data.
      const keyring = new Keyring();
      await keyring.importPublic(pgpKeys.ada.public, requestDto.user_id);

      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API get account recovery request.
      fetch.doMockOnce(req => {
        const queryString = (new URL(req.url)).search;
        const params = new URLSearchParams(queryString);
        expect(params.get("contain[account_recovery_private_key_passwords]")).toBeTruthy();
        return mockApiResponse(requestDto);
      });
      // Mock API save account recovery response, return the request payload for assertion.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const savedAccountRecoveryResponseEntity = await controller.exec(requestId, AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);

      expect.assertions(9);
      expect(savedAccountRecoveryResponseEntity.status).toEqual("approved");
      const decryptedAccountRecoveryRequestPrivateKey = await DecryptPrivateKeyService.decrypt(pgpKeys.account_recovery_request.private, pgpKeys.account_recovery_request.passphrase);
      const privateKeyPasswordDecryptedDataSerialized = await DecryptMessageService.decrypt(savedAccountRecoveryResponseEntity.data, decryptedAccountRecoveryRequestPrivateKey, [pgpKeys.account_recovery_organization.public, pgpKeys.admin.public]);
      const privateKeyPasswordDecryptedDataDto = JSON.parse(privateKeyPasswordDecryptedDataSerialized);
      const privateKeyPasswordDecryptedData = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(privateKeyPasswordDecryptedDataDto);
      expect(privateKeyPasswordDecryptedData.domain).toEqual("https://passbolt.local");
      expect(privateKeyPasswordDecryptedData.privateKeyFingerprint).toEqual(pgpKeys.ada.fingerprint);
      expect(privateKeyPasswordDecryptedData.privateKeySecret).toEqual("f7cf1fa06f973a9ecbb5f0e2bc6d1830532e53ad50da231036bd6c8c00dd7c7dc6c07b04004615cd6808bea2cb6a4ce4c46f7f36b8865292c0f7a28cd6f56112");
      expect(privateKeyPasswordDecryptedData.privateKeyUserId).toEqual("f848277c-5398-58f8-a82a-72397af2d450");
      expect(privateKeyPasswordDecryptedData.type).toEqual("account-recovery-private-key-password-decrypted-data");
      expect(privateKeyPasswordDecryptedData.version).toEqual("v1");
      expect(Date.parse(privateKeyPasswordDecryptedData.created)).toBeTruthy();
    }, 10000);

    it("Should save a review account recovery request if rejected.", async() => {
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API save account recovery response, return the request payload for assertion.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const accountRecoveryResponseEntity = await controller.exec(uuidv4(), AccountRecoveryResponseEntity.STATUS_REJECTED);

      expect.assertions(1);
      expect(accountRecoveryResponseEntity.status).toEqual("rejected");
    });

    it("Should assert the provided account recovery id is valid.", async() => {
      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec("not-uuid");
      expect.assertions(1);
      await expect(promise).rejects.toThrow(new TypeError("requestId should be a valid uuid."));
    });

    it("Should assert the account recovery organization is enabled.", async() => {
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(disabledAccountRecoveryOrganizationPolicyDto()));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec(uuidv4());
      expect.assertions(1);
      await expect(promise).rejects.toThrowError("Sorry the account recovery feature is not enabled for this organization.");
    });

    it("Should assert the provided organization private key dto is valid.", async() => {
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec(uuidv4(), AccountRecoveryResponseEntity.STATUS_APPROVED, {});
      expect.assertions(1);
      await expect(promise).rejects.toThrowError(new EntityValidationError("Could not validate entity PrivateGpgkey."));
    });

    it("Should assert the account recovery organization private key can be decrypted.", async() => {
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: "wrong-passphrase"
      };
      const promise = controller.exec(uuidv4(), AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError(InvalidMasterPasswordError);
    });

    it("Should assert the signed-in user private key can be decrypted.", async() => {
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock signed in user wrong passphrase
      PassphraseController.get.mockResolvedValue("wrong-passphrase");

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec(uuidv4(), AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);
      expect.assertions(1);
      await expect(promise).rejects.toThrowError(InvalidMasterPasswordError);
    });

    each([
      {expectedError: "The request should have an associated private key.", findRequestMock: pendingAccountRecoveryRequestWithoutPrivateKeyDto()},
      {expectedError: "The request user should match the request associated private key user.", findRequestMock: pendingAccountRecoveryRequestDto({account_recovery_private_key: {user_id: uuidv4()}})},
      {expectedError: "The account recovery request private key should have a collection of private key passwords.", findRequestMock: pendingAccountRecoveryRequestWithoutPrivateKeyPasswordDto()},
      // For this scenario the validation occurs at the entity level, the recipient foreign model is not valid "".
      {expectedError: "Could not validate entity AccountRecoveryPrivateKeyPassword.", findRequestMock: pendingAccountRecoveryRequestDto({account_recovery_private_key: {account_recovery_private_key_passwords: [{recipient_foreign_model: "unknown-foreign-model"}]}})},
      {expectedError: "The request private key password private key id should match the request private key id.", findRequestMock: pendingAccountRecoveryRequestDto({account_recovery_private_key: {account_recovery_private_key_passwords: [{private_key_id: uuidv4()}]}})},
    ]).describe("Should assert the request returned by the API.", scenario => {
      it(`Should validate the scenario: ${scenario.expectedError}`, async() => {
        // Mock API fetch account recovery organization policy response.
        fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
        // Mock API get account recovery request.
        fetch.doMockOnce(() => mockApiResponse(scenario.findRequestMock));

        const controller = new ReviewRequestController(null, null, apiClientOptions, account);
        const promise = controller.exec(uuidv4(), AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);
        expect.assertions(1);
        await expect(promise).rejects.toThrowError(scenario.expectedError);
      });
    });

    it("Should assert the public key of the user making the account recovery is found.", async() => {
      // Required by the keyring sync, this one does not use the api client options.
      await MockExtension.withConfiguredAccount();
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API get account recovery request.
      fetch.doMockOnce(() => mockApiResponse(requestDto));
      // Mock API keyring sync response.
      fetch.doMockOnce(() => mockApiResponse({}));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec(requestId, AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("Cannot find the public key of the user requesting an account recovery.");
    });

    it("Should assert the private key password data was encrypted for the user making the request, check the encrypted user id match the request user id.", async() => {
      const requestDto = pendingAccountRecoveryRequestDto({id: requestId, user_id: pgpKeys.betty.userId});
      // Import the public key of the user requesting an account recovery in the keyring, it will be used to check the signature on the account recovery private key data.
      const keyring = new Keyring();
      await keyring.importPublic(pgpKeys.betty.public, requestDto.user_id);
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API get account recovery request.
      fetch.doMockOnce(() => mockApiResponse(requestDto));
      // Mock API keyring sync response.
      fetch.doMockOnce(() => mockApiResponse({}));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec(requestId, AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The user id contained in the private key password data does not match the private key target used id.");
    });

    it("Should assert the private key password data was encrypted for the user making the request, check the encrypted private key fingerprint match the user public key fingerprint.", async() => {
      // Import the public key of the user requesting an account recovery in the keyring, it will be used to check the signature on the account recovery private key data.
      const keyring = new Keyring();
      await keyring.importPublic(pgpKeys.betty.public, requestDto.user_id);
      // Mock API fetch account recovery organization policy response.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API get account recovery request.
      fetch.doMockOnce(() => mockApiResponse(requestDto));
      // Mock API keyring sync response.
      fetch.doMockOnce(() => mockApiResponse({}));

      const controller = new ReviewRequestController(null, null, apiClientOptions, account);
      const promise = controller.exec(requestId, AccountRecoveryResponseEntity.STATUS_APPROVED, privateKeyDto);

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("The private key password data fingerprint should match the user public fingerprint.");
    });
  });
});
