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
 * @since         4.5.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from '../../../../../../test/mocks/mockApiResponse';
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import PasswordExpiryResourceService from "./passwordExpiryResourceService";
import {
  defaultPasswordExpiryResourceDto, defaultPasswordExpiryResourceDtoFromApi
} from "../../../model/entity/passwordExpiry/passwordExpiryResourceEntity.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";

describe("PasswordExpiry service", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::update', () => {
    it("Should create the settings on the API and return the saved data from the API", async() => {
      expect.assertions(2);
      const dataToRegister = defaultPasswordExpiryResourceDto();
      const expectedDto = defaultPasswordExpiryResourceDtoFromApi(dataToRegister);

      fetch.doMockOnceIf(/password-expiry\/resources\.json/, async request => {
        const body = JSON.parse(await request.text());
        expect(body).toStrictEqual(dataToRegister);
        return mockApiResponse(expectedDto);
      });

      const service = new PasswordExpiryResourceService(apiClientOptions);
      const resultDto = await service.update(dataToRegister);

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("Should throw an error if an error happens on the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/password-expiry\/resources\.json/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new PasswordExpiryResourceService(apiClientOptions);
      try {
        await service.update(defaultPasswordExpiryResourceDto());
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("Should throw an error if an error happens when requesting the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/password-expiry\/resources\.json/, () => { throw new Error("Something wrong happened"); });

      const service = new PasswordExpiryResourceService(apiClientOptions);
      try {
        await service.update(defaultPasswordExpiryResourceDto());
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });
});
