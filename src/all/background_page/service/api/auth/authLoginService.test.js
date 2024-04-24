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
 * @since         4.7.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import AuthLoginService from "./authLoginService";
import {mockApiResponse, mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import GpgAuthToken from "../../../model/gpgAuthToken";

beforeEach(async() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("AuthLoginService", () => {
  describe("AuthLoginService::exec", () => {
    it("Should call the API on login stage 1 endpoint with a POST request", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const service = new AuthLoginService(apiClientOptions);

      fetch.doMockOnceIf(/auth\/login\.json\?api-version=v2/, async req => {
        expect(req.headers.get('content-type') !== "application/json").toBeTruthy();
        expect(req.method).toStrictEqual("POST");
        return mockApiResponse({});
      });

      await service.loginStage1(account.userKeyFingerprint);
    });

    it("Should call the API on login stage 2 endpoint with a POST request", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const gpgAuthToken = new GpgAuthToken();
      const service = new AuthLoginService(apiClientOptions);

      fetch.doMockOnceIf(/auth\/login\.json\?api-version=v2/, async req => {
        expect(req.headers.get('content-type') !== "application/json").toBeTruthy();
        expect(req.method).toStrictEqual("POST");
        return mockApiResponse({});
      });

      await service.loginStage2(gpgAuthToken.token, account.userKeyFingerprint);
    });

    it("Should throw an exception if the POST login stage 1 send an error", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const service = new AuthLoginService(apiClientOptions);

      fetch.doMockOnceIf(/auth\/login\.json\?api-version=v2/, async req => {
        expect(req.method).toStrictEqual("POST");
        return mockApiResponseError(500, "Something went wrong");
      });

      try {
        await service.loginStage1(account.userKeyFingerprint);
      } catch (e) {
        const expectedError = new PassboltApiFetchError('Something went wrong');
        expect(e).toStrictEqual(expectedError);
      }
    });

    it("Should throw an exception if the POST login stage 2 send an error", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const gpgAuthToken = new GpgAuthToken();
      const service = new AuthLoginService(apiClientOptions);

      fetch.doMockOnceIf(/auth\/login\.json\?api-version=v2/, async req => {
        expect(req.method).toStrictEqual("POST");
        return mockApiResponseError(500, "Something went wrong");
      });

      try {
        await service.loginStage2(gpgAuthToken.token, account.userKeyFingerprint);
      } catch (e) {
        const expectedError = new PassboltApiFetchError('Something went wrong');
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
