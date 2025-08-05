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
 * @since         5.4.0
 */
import {v4 as uuidv4} from "uuid";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import SetupService from "./setupService";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {initialAccountAccountRecoveryDto} from "../../../model/entity/account/accountAccountRecoveryEntity.test.data";
import {startAccountSetupDto} from "../../../model/entity/account/accountSetupEntity.test.data";

describe("SetupService", () => {
  let service, apiClientOptions, userId,
    accountRecoveryDto, setupCompleteDto;

  beforeEach(() => {
    enableFetchMocks();
    fetch.resetMocks();
    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    service = new SetupService(apiClientOptions);

    userId = uuidv4();
  });

  describe("::complete", () => {
    beforeEach(() => {
      setupCompleteDto = startAccountSetupDto();
    });

    it("calls the complete API with correct URL", async() => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/complete/${userId}`), () => mockApiResponse({success: true}));

      await service.complete(userId, setupCompleteDto);

      const lastCall = fetch.mock.calls[0];
      const [url, options] = lastCall;

      expect(url).toMatch(`/complete/${userId}.json`);
      expect(options.method).toBe("POST");
    });

    it("throws API error if API returns an error", async() => {
      expect.assertions(1);

      fetch.mockResponseOnce(async() => {
        const mockResponse = await mockApiResponseError(400, "Invalid request", {});
        return {
          status: mockResponse.status,
          body: mockResponse.body,
          headers: {"Content-Type": "application/json"}
        };
      });

      await expect(service.complete(userId, setupCompleteDto)).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error on unexpected failure", async() => {
      expect.assertions(1);
      fetch.mockImplementationOnce(() => { throw new Error("Service Down"); });

      await expect(() => service.complete(userId, setupCompleteDto)).rejects.toThrow(PassboltServiceUnavailableError);
    });

    it("throws an error if userId is invalid", async() => {
      expect.assertions(1);
      await expect(() => service.complete("invalid-id", setupCompleteDto)).rejects.toThrow(Error);
    });
  });

  describe("::completeRecover", () => {
    beforeEach(() => {
      accountRecoveryDto = initialAccountAccountRecoveryDto();
    });

    it("calls the completeRecover API with correct URL", async() => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/recover/complete/${userId}`), () => mockApiResponse({success: true}));

      await service.completeRecover(userId, accountRecoveryDto);

      const lastCall = fetch.mock.calls[0];
      const [url, options] = lastCall;

      expect(url).toMatch(`/recover/complete/${userId}.json`);
      expect(options.method).toBe("POST");
    });

    it("throws API error if API returns an error", async() => {
      expect.assertions(1);
      fetch.mockResponseOnce(async() => {
        const mockResponse = await mockApiResponseError(400, "Invalid request", {});
        return {
          status: mockResponse.status,
          body: mockResponse.body,
          headers: {"Content-Type": "application/json"}
        };
      });

      await expect(() => service.completeRecover(userId, accountRecoveryDto)).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error on unexpected failure", async() => {
      expect.assertions(1);
      fetch.mockImplementationOnce(() => { throw new Error("Service unavailable"); });

      await expect(() => service.completeRecover(userId, accountRecoveryDto)).rejects.toThrow(PassboltServiceUnavailableError);
    });

    it("throws an error if userId is invalid", async() => {
      expect.assertions(1);
      await expect(() => service.completeRecover("invalid-id", accountRecoveryDto)).rejects.toThrow(Error);
    });
  });
});
