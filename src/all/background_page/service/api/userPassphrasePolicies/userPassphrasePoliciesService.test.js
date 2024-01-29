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
 * @since         v4.3.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import AccountEntity from "../../../model/entity/account/accountEntity";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {defaultUserPassphrasePoliciesDto, userPassphrasePoliciesDtoFromApi} from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity.test.data";
import {mockApiResponse, mockApiResponseError} from '../../../../../../test/mocks/mockApiResponse';
import UserPassphrasePoliciesService from "./userPassphrasePoliciesService";
import PassboltApiFetchError from "../../../error/passboltApiFetchError";
import PassboltServiceUnavailableError from "../../../error/passboltServiceUnavailableError";
import browser from "../../../sdk/polyfill/browserPolyfill";

describe("UserPassphrasePolicies service", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    jest.resetAllMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::find', () => {
    it("should return the dto served by the API", async() => {
      expect.assertions(1);
      const expectedDto = defaultUserPassphrasePoliciesDto();
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponse(expectedDto));

      const service = new UserPassphrasePoliciesService(apiClientOptions);
      const resultDto = await service.find();

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("should throw an error if the API returns an error response", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponseError(500, "Something went wrong!"));

      const service = new UserPassphrasePoliciesService(apiClientOptions);
      try {
        await service.find();
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("should throw an error if something happens on the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => { throw new Error("Something went wrong"); });

      const service = new UserPassphrasePoliciesService(apiClientOptions);
      try {
        await service.find();
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });

  describe('::create', () => {
    it("Should create the settings on the API and return the saved data from the API", async() => {
      expect.assertions(2);
      const dataToRegister = defaultUserPassphrasePoliciesDto({
        entropy_minium: 64,
        external_dictionary_check: false
      });

      const expectedDto = userPassphrasePoliciesDtoFromApi(dataToRegister);

      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, async request => {
        const body = JSON.parse(await request.text());
        expect(body).toStrictEqual(dataToRegister);
        return mockApiResponse(expectedDto);
      });

      const service = new UserPassphrasePoliciesService(apiClientOptions);
      const resultDto = await service.create(dataToRegister);

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("Should throw an error if an error happens on the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new UserPassphrasePoliciesService(apiClientOptions);
      try {
        await service.create(defaultUserPassphrasePoliciesDto());
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("Should throw an error if an error happens when requesting the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => { throw new Error("Something wrong happened"); });

      const service = new UserPassphrasePoliciesService(apiClientOptions);
      try {
        await service.create(defaultUserPassphrasePoliciesDto());
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });
});
