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
 * @since         4.1.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import AuthVerifyServerKeyService from "./authVerifyServerKeyService";
import {mockApiResponse, mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import GpgAuthToken from "../../../model/gpgAuthToken";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../../crypto/encryptMessageService";
import AccountEntity from "../../../model/entity/account/accountEntity";

beforeEach(async() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("AuthVerifyServerKeyService", () => {
  describe("AuthVerifyServerKeyService::exec", () => {
    it("Should call the API on verify endpoint with a POST request", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const originalToken = new GpgAuthToken();
      const serverKey = await OpenpgpAssertion.readKeyOrFail(account.serverPublicArmoredKey);
      const encryptedToken = await EncryptMessageService.encrypt(originalToken.token, serverKey);
      const service = new AuthVerifyServerKeyService(apiClientOptions);

      fetch.doMockOnceIf(/auth\/verify\.json\?api-version=v2/, async req => {
        expect(req.headers.get('content-type') !== "application/json").toBeTruthy();
        expect(req.method).toStrictEqual("POST");
        return mockApiResponse({});
      });

      await service.verify(account.userKeyFingerprint, encryptedToken);
    });

    it("Should throw an exception if the POST verify endpoint send an error", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const originalToken = new GpgAuthToken();
      const serverKey = await OpenpgpAssertion.readKeyOrFail(account.serverPublicArmoredKey);
      const encryptedToken = await EncryptMessageService.encrypt(originalToken.token, serverKey);
      const service = new AuthVerifyServerKeyService(apiClientOptions);

      fetch.doMockOnceIf(/auth\/verify\.json\?api-version=v2/, async req => {
        expect(req.method).toStrictEqual("POST");
        return mockApiResponseError(500, "Something went wrong");
      });

      try {
        await service.verify(account.userKeyFingerprint, encryptedToken);
      } catch (e) {
        const expectedError = new PassboltApiFetchError('Something went wrong');
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
