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
 * @since         4.3.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import AccountEntity from "../../../model/entity/account/accountEntity";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {defaultPasswordPolicies} from "../../../model/entity/passwordPolicies/passwordPoliciesEntity.test.data";
import PasswordPoliciesService from "./passwordPoliciesService";

describe("PasswordPoliciesService", () => {
  let apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe("::find", () => {
    it("should find the value from the API", async() => {
      expect.assertions(1);
      const expectedDto = defaultPasswordPolicies({
        default_generator: "passphrase"
      });
      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(expectedDto));

      const service = new PasswordPoliciesService(apiClientOptions);
      const resultDto = await service.find();

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("should fallback to the former endpoint if something goes wrong", async() => {
      expect.assertions(1);
      const oldFormatDto = {
        default_generator: "passphrase"
      };

      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponseError(404, "Endpoint is not existing"));
      fetch.doMockOnceIf(/password-generator\/settings\.json/, () => mockApiResponse(oldFormatDto));

      const service = new PasswordPoliciesService(apiClientOptions);
      const resultDto = await service.find();

      expect(resultDto).toStrictEqual(oldFormatDto);
    });

    it("should throw an exception if something goes wrong on the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponseError(404, "Endpoint is not existing"));
      fetch.doMockOnceIf(/password-generator\/settings\.json/, () => mockApiResponseError(500, "Something went wrong"));

      const service = new PasswordPoliciesService(apiClientOptions);
      try {
        await service.find();
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });
  });

  describe("::save", () => {
    it("should call the api to save the settings", async() => {
      expect.assertions(2);
      const expectedDto = defaultPasswordPolicies({
        default_generator: "passphrase"
      });

      fetch.doMockOnceIf(/password-policies\/settings\.json/, async request => {
        const body = JSON.parse(await request.text());
        expect(body).toStrictEqual(expectedDto);
        return mockApiResponse(expectedDto);
      });

      const service = new PasswordPoliciesService(apiClientOptions);
      const resultDto = await service.save(expectedDto);

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("should throw an exception if something goes wrong on the API", async() => {
      expect.assertions(1);
      const expectedDto = defaultPasswordPolicies({
        default_generator: "passphrase"
      });

      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponseError(500, "something went wrong!"));

      const service = new PasswordPoliciesService(apiClientOptions);

      try {
        await service.save(expectedDto);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("should throw an exception if no data is passed when saving", async() => {
      expect.assertions(1);
      const service = new PasswordPoliciesService(apiClientOptions);

      try {
        await service.save();
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });
  });
});
