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
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuidv4} from "uuid";
import {AccountRecoveryReviewRequestController} from "./accountRecoveryReviewRequestController";
import {DecryptMessageService} from "../../service/crypto/decryptMessageService";
import {DecryptPrivateKeyService} from "../../service/crypto/decryptPrivateKeyService";
import {InvalidMasterPasswordError} from "../../error/invalidMasterPasswordError";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {
  defaultAccountRecoveryRequestDto,
  accountRecoveryRequestWithoutPrivateKeyPasswordDto,
} from "../../model/entity/accountRecovery/accountRecoveryRequestEntity.test.data";
import {
  createAcceptedAccountRecoveryResponseDto,
  createRejectedAccountRecoveryResponseDto,
} from "../../model/entity/accountRecovery/accountRecoveryResponseEntity.test.data";

jest.mock("../passphrase/passphraseController.js", () => ({
  request: jest.fn().mockImplementation(() => {})
}));

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("AccountRecoveryReviewUserRequestController", () => {
  describe("AccountRecoveryReviewUserRequestController::exec", () => {
    it("Should save a review account recovery request if approved.", async() => {
      const controller = new AccountRecoveryReviewRequestController(null, null, defaultApiClientOptions());
      const accountRecoveryRequestId = uuidv4();

      // Mock API get account recovery request.
      fetch.doMockOnce(req => {
        const queryString = (new URL(req.url)).search;
        const params = new URLSearchParams(queryString);
        expect(params.get("contain[account_recovery_private_key_passwords]")).toBeTruthy();
        return mockApiResponse(defaultAccountRecoveryRequestDto({id: accountRecoveryRequestId}));
      });
      // Mock API save account recovery response, return the request payload for assertion.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto({account_recovery_request_id: accountRecoveryRequestId});
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const savedAccountRecoveryResponseEntity = await controller.exec(accountRecoveryResponseDto, privateKeyDto);

      expect.assertions(3);
      expect(savedAccountRecoveryResponseEntity.status).toEqual("approved");
      const expectedDecryptedPrivateKeyPasswordData = "3f28361aa774a5767fbe70ecd09b2fbbf1d5b4b493fe171089436bfa6a2eb03fe630fa9f2483c59b68e20616f1a7597ff8d058a6f79d228a4181d71a61f80d98";
      const decryptedAccountRecoveryRequestPrivateKey = await DecryptPrivateKeyService.decrypt(pgpKeys.account_recovery_request.private, pgpKeys.account_recovery_request.passphrase);
      const decryptedPrivateKeyPasswordData = await DecryptMessageService.decrypt(savedAccountRecoveryResponseEntity.data, decryptedAccountRecoveryRequestPrivateKey, pgpKeys.account_recovery_organization.public);
      expect(decryptedPrivateKeyPasswordData).toEqual(expectedDecryptedPrivateKeyPasswordData);
    }, 10000);

    it("Should save a review account recovery request if rejected.", async() => {
      const controller = new AccountRecoveryReviewRequestController(null, null, defaultApiClientOptions());

      // Mock API save account recovery response, return the request payload for assertion.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryResponseDto = createRejectedAccountRecoveryResponseDto();
      const accountRecoveryResponseEntity = await controller.exec(accountRecoveryResponseDto);

      expect.assertions(1);
      expect(accountRecoveryResponseEntity.status).toEqual("rejected");
    });

    it("Should assert the provided account recovery response dto is valid.", async() => {
      const controller = new AccountRecoveryReviewRequestController(null, null, defaultApiClientOptions());
      const promise = controller.exec({}, {});

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("Could not validate entity AccountRecoveryResponse.");
    });

    it("Should assert the provided private key dto is valid.", async() => {
      const controller = new AccountRecoveryReviewRequestController(null, null, defaultApiClientOptions());

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto();
      const promise = controller.exec(accountRecoveryResponseDto, {});

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("Could not validate entity PrivateGpgkey.");
    });

    it("Should throw an error if the account recovery organization private key cannot be decrypted.", async() => {
      const controller = new AccountRecoveryReviewRequestController(null, null, defaultApiClientOptions());

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto();
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: "wrong-passphrase"
      };
      const promise = controller.exec(accountRecoveryResponseDto, privateKeyDto);

      expect.assertions(1);
      await expect(promise).rejects.toThrowError(InvalidMasterPasswordError);
    });

    it("Should throw an error if no private key password to decrypt is found.", async() => {
      const controller = new AccountRecoveryReviewRequestController(null, null, defaultApiClientOptions());
      const accountRecoveryRequestId = uuidv4();

      // Mock API get account recovery request with empty account recovery key passwords.
      fetch.doMockOnce(req => {
        const queryString = (new URL(req.url)).search;
        const params = new URLSearchParams(queryString);
        expect(params.get("contain[account_recovery_private_key_passwords]")).toBeTruthy();
        return mockApiResponse(accountRecoveryRequestWithoutPrivateKeyPasswordDto({id: accountRecoveryRequestId}));
      });

      const accountRecoveryResponseDto = createAcceptedAccountRecoveryResponseDto({account_recovery_request_id: accountRecoveryRequestId});
      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const result = controller.exec(accountRecoveryResponseDto, privateKeyDto);

      expect.assertions(2);
      await expect(result).rejects.toThrowError("No account recovery private key password found.");
    });
  });
});
