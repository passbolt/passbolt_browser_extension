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
import {defaultAccountRecoveryRequestDto} from "../../model/entity/accountRecovery/accountRecoveryRequestEntity.test.data";

import {enableFetchMocks} from "jest-fetch-mock";
import {Worker} from "../../sdk/worker";
import {v4 as uuidv4} from "uuid";
import {ApiClientOptions} from "../../service/api/apiClient/apiClientOptions";
import {AccountRecoveryReviewRequestController} from "./accountRecoveryReviewRequestController";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {DecryptMessageService} from "../../service/crypto/decryptMessageService";
import {DecryptPrivateKeyService} from "../../service/crypto/decryptPrivateKeyService";
import {
  acceptedAccountRecoveryResponseDto, createAcceptedAccountRecoveryResponseDto,
  createRejectedAccountRecoveryResponseDto, rejectedAccountRecoveryResponseDto
} from "../../model/entity/accountRecovery/accountRecoveryResponseEntity.test.data";
import {InvalidMasterPasswordError} from "../../error/invalidMasterPasswordError";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";

jest.mock("../passphrase/passphraseController.js", () => ({
  request: jest.fn().mockImplementation(() => {})
}));

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoveryReviewUserRequestController", () => {
  describe("AccountRecoveryReviewUserRequestController::exec", () => {
    it("Should assert the provided account recovery response dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoveryReviewRequestController(mockWorker, requestId, apiClientOptions);

      const accountRecoveryResponseDto = {};
      const privateKeyDto = {};

      expect.assertions(6);
      try {
        await controller.exec(accountRecoveryResponseDto, privateKeyDto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.message).toEqual("Could not validate entity AccountRecoveryResponse.");
        expect(error.details.account_recovery_request_id).not.toBeUndefined();
        expect(error.details.responder_foreign_key).not.toBeUndefined();
        expect(error.details.responder_foreign_model).not.toBeUndefined();
        expect(error.details.status).not.toBeUndefined();
      }
    });

    it("Should assert the provided private key dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryReviewRequestController(mockWorker, requestId, apiClientOptions);

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto();
      const privateKeyDto = {};

      expect.assertions(4);
      try {
        await controller.exec(accountRecoveryResponseDto, privateKeyDto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.message).toEqual("Could not validate entity PrivateGpgkey.");
        expect(error.details.passphrase).not.toBeUndefined();
        expect(error.details.armored_key).not.toBeUndefined();
      }
    });

    it("Should throw an error if the account recovery organization private key cannot be decrypted.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryReviewRequestController(mockWorker, requestId, apiClientOptions);

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto();
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: "wrong-passphrase"
      };

      expect.assertions(1);
      const result = controller.exec(accountRecoveryResponseDto, privateKeyDto);
      await expect(result).rejects.toThrowError(new InvalidMasterPasswordError());
    });

    it("Should save a review account recovery request if approved.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryReviewRequestController(mockWorker, requestId, apiClientOptions);

      // Mock API get account recovery request.
      const accountRecoveryRequestId = uuidv4();
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/requests/${accountRecoveryRequestId}.json*`;
      const mockFetchRequestResult = defaultAccountRecoveryRequestDto({id: accountRecoveryRequestId});
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      // Mock API save account recovery response.
      const mockPostResponseUrl = `${apiClientOptions.baseUrl}/account-recovery/responses.json*`;
      const mockPostResponseResult = acceptedAccountRecoveryResponseDto();
      fetch.doMockOnceIf(new RegExp(mockPostResponseUrl), JSON.stringify({header: {}, body: mockPostResponseResult}));

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto({account_recovery_request_id: accountRecoveryRequestId});
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const accountRecoveryResponseEntity = await controller.exec(accountRecoveryResponseDto, privateKeyDto);

      expect.assertions(7);
      expect(accountRecoveryResponseEntity.id).not.toBeNull();
      expect(accountRecoveryResponseEntity.status).toEqual("approved");
      expect(accountRecoveryResponseEntity.created).not.toBeNull();
      expect(accountRecoveryResponseEntity.modified).not.toBeNull();
      expect(accountRecoveryResponseEntity.createdBy).not.toBeNull();
      expect(accountRecoveryResponseEntity.modifiedBy).not.toBeNull();

      // This assertion is testing the tester. Test the API return response data can be decrypted with the test account recovery request key.
      const expectedDecryptedPrivateKeyPasswordData = "3f28361aa774a5767fbe70ecd09b2fbbf1d5b4b493fe171089436bfa6a2eb03fe630fa9f2483c59b68e20616f1a7597ff8d058a6f79d228a4181d71a61f80d98";
      const decryptedAccountRecoveryRequestPrivateKey = await DecryptPrivateKeyService.decrypt(pgpKeys.account_recovery_request.private, pgpKeys.account_recovery_request.passphrase);
      const decryptedPrivateKeyPasswordData = await DecryptMessageService.decrypt(accountRecoveryResponseEntity.data, decryptedAccountRecoveryRequestPrivateKey, pgpKeys.account_recovery_organization.public);
      expect(decryptedPrivateKeyPasswordData.data).toEqual(expectedDecryptedPrivateKeyPasswordData);
    }, 10000);

    it("Should save a review account recovery request if rejected.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryReviewRequestController(mockWorker, requestId, apiClientOptions);

      const mockPostResponseUrl = `${apiClientOptions.baseUrl}/account-recovery/responses.json*`;
      const mockPostResponseResult = rejectedAccountRecoveryResponseDto();
      fetch.doMockOnceIf(new RegExp(mockPostResponseUrl), JSON.stringify({header: {}, body: mockPostResponseResult}));

      const accountRecoveryResponseDto = createRejectedAccountRecoveryResponseDto();
      const accountRecoveryResponseEntity = await controller.exec(accountRecoveryResponseDto);

      expect.assertions(6);
      expect(accountRecoveryResponseEntity.id).not.toBeNull();
      expect(accountRecoveryResponseEntity.status).toEqual("rejected");
      expect(accountRecoveryResponseEntity.created).not.toBeNull();
      expect(accountRecoveryResponseEntity.modified).not.toBeNull();
      expect(accountRecoveryResponseEntity.createdBy).not.toBeNull();
      expect(accountRecoveryResponseEntity.modifiedBy).not.toBeNull();
    });

    it("Should throw an error if no private key password to decrypt is found.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryReviewRequestController(mockWorker, requestId, apiClientOptions);

      // Mock API responses
      const accountRecoveryRequestId = uuidv4();
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/requests/${accountRecoveryRequestId}.json*`;
      const mockFetchRequestResult = defaultAccountRecoveryRequestDto({id: accountRecoveryRequestId, account_recovery_private_key_passwords: []});
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto({account_recovery_request_id: accountRecoveryRequestId});
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const result = controller.exec(accountRecoveryResponseDto, privateKeyDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError("No account recovery private key password found.");
    });
  });
});
