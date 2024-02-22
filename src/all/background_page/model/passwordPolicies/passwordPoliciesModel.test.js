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
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {defaultAccountDto} from "../entity/account/accountEntity.test.data";
import AccountEntity from "../entity/account/accountEntity";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import PasswordPoliciesModel from "./passwordPoliciesModel";
import {defaultPasswordPolicies} from "../entity/passwordPolicies/passwordPoliciesEntity.test.data";
import PasswordPoliciesEntity from "../entity/passwordPolicies/passwordPoliciesEntity";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import browser from "../../sdk/polyfill/browserPolyfill";

describe("PasswordPoliciesModel", () => {
  let account, apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe("::get", () => {
    it("should get the value from the local storage", async() => {
      expect.assertions(2);

      const expectedPasswordPolicies = defaultPasswordPolicies({
        default_generator: "passphrase"
      });
      const storedEntity = new PasswordPoliciesEntity(expectedPasswordPolicies);

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const spyOnApiFind = jest.spyOn(model.passwordPoliciesService, "find");
      await model.passwordPoliciesLocalStorage.set(storedEntity);

      const result = await model.get();
      const resultDto = result.toJSON();

      expect(resultDto).toStrictEqual(expectedPasswordPolicies);
      expect(spyOnApiFind).not.toHaveBeenCalled();
    });

    it("should return null if nothing is stored on the local storage", async() => {
      expect.assertions(2);

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const spyOnApiFind = jest.spyOn(model.passwordPoliciesService, "find");
      await model.passwordPoliciesLocalStorage.flush();

      const result = await model.get();

      expect(result).toBeNull();
      expect(spyOnApiFind).not.toHaveBeenCalled();
    });
  });

  describe("::getOrFind", () => {
    it("should call the api and return the an entity if the local storage is empty", async() => {
      expect.assertions(3);

      const expectedPasswordPolicies = defaultPasswordPolicies({
        default_generator: "passphrase"
      });

      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(expectedPasswordPolicies));

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const storage = model.passwordPoliciesLocalStorage;

      const spyOnApiFind = jest.spyOn(model.passwordPoliciesService, "find");
      const spyOnStorageGet = jest.spyOn(storage, "get");

      await storage.flush();

      const result = await model.getOrFind();
      const resultDto = result.toJSON();

      expect(spyOnStorageGet).toHaveBeenCalledTimes(1);
      expect(spyOnApiFind).toHaveBeenCalledTimes(1);
      expect(resultDto).toStrictEqual(expectedPasswordPolicies);
    });

    it("should call the api, save the result to the local storage and do not ask the API again to find the settings", async() => {
      expect.assertions(8);

      const expectedPasswordPolicies = defaultPasswordPolicies({
        default_generator: "passphrase"
      });

      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(expectedPasswordPolicies));

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const storage = model.passwordPoliciesLocalStorage;

      const spyOnApiFind = jest.spyOn(model.passwordPoliciesService, "find");
      const spyOnStorageGet = jest.spyOn(storage, "get");
      const spyOnStorageSet = jest.spyOn(storage, "set");

      await storage.flush();

      const resultFromApi = await model.getOrFind();

      expect(spyOnStorageGet).toHaveBeenCalledTimes(1);
      expect(spyOnApiFind).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledWith(resultFromApi);

      const resultFromLocalStorage = await model.getOrFind();
      expect(spyOnStorageGet).toHaveBeenCalledTimes(2);
      expect(spyOnApiFind).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);

      const resultFromLocalStorageDto = resultFromLocalStorage.toJSON();
      expect(resultFromLocalStorageDto).toStrictEqual(expectedPasswordPolicies);
    });

    it("should call the api and return a full entity with an old API implementation if the local storage is empty", async() => {
      expect.assertions(3);

      const oldFormatDto = {
        default_generator: "passphrase"
      };
      const expectedPasswordPolicies = defaultPasswordPolicies(oldFormatDto);

      fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponseError(404, "Endpoint is not existing"));
      fetch.doMockOnceIf(/password-generator\/settings\.json/, () => mockApiResponse(oldFormatDto));

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const storage = model.passwordPoliciesLocalStorage;

      const spyOnApiFind = jest.spyOn(model.passwordPoliciesService, "find");
      const spyOnStorageGet = jest.spyOn(storage, "get");

      await storage.flush();

      const result = await model.getOrFind();
      const resultDto = result.toJSON();

      expect(spyOnStorageGet).toHaveBeenCalledTimes(1);
      expect(spyOnApiFind).toHaveBeenCalledTimes(1);
      expect(resultDto).toStrictEqual(expectedPasswordPolicies);
    });

    it("should throw an error if something goes wrong on the API", async() => {
      expect.assertions(2);

      const serverErrorCallback = () => { throw new Error("something went wrong"); };
      fetch.doMockOnceIf(/password-policies\/settings\.json/, serverErrorCallback);
      fetch.doMockOnceIf(/password-generator\/settings\.json/, serverErrorCallback);

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const storage = model.passwordPoliciesLocalStorage;

      const spyOnApiFind = jest.spyOn(model.passwordPoliciesService, "find");
      const spyOnStorageGet = jest.spyOn(storage, "get");

      await storage.flush();

      try {
        await model.getOrFind();
      } catch (e) {
        expect(spyOnStorageGet).toHaveBeenCalledTimes(1);
        expect(spyOnApiFind).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("::save", () => {
    it("should save the given entity to the API and register the new result onto the local storage", async() => {
      expect.assertions(4);

      const expectedPasswordPolicies = defaultPasswordPolicies({
        default_generator: "passphrase"
      });

      fetch.doMockOnceIf(/password-policies\/settings\.json/, async request => {
        const body = JSON.parse(await request.text());
        expect(body).toStrictEqual(expectedPasswordPolicies);
        return mockApiResponse(expectedPasswordPolicies);
      });

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const storage = model.passwordPoliciesLocalStorage;
      const spyOnStorageSet = jest.spyOn(storage, "set");

      const entity = new PasswordPoliciesEntity(expectedPasswordPolicies);
      const result = await model.save(entity);
      const resultDto = result.toJSON();

      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledWith(result);
      expect(resultDto).toStrictEqual(expectedPasswordPolicies);
    });

    it("should throw an excption if the API can't save the entity and not store the entity on the local storage", async() => {
      expect.assertions(2);

      const expectedPasswordPolicies = defaultPasswordPolicies({
        default_generator: "passphrase"
      });

      fetch.doMockOnceIf(/password-policies\/settings\.json/, async() => { throw new Error("something went wrong!"); });

      const model = new PasswordPoliciesModel(account, apiClientOptions);
      const storage = model.passwordPoliciesLocalStorage;
      const spyOnStorageSet = jest.spyOn(storage, "set");

      const entity = new PasswordPoliciesEntity(expectedPasswordPolicies);
      try {
        await model.save(entity);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
        expect(spyOnStorageSet).not.toHaveBeenCalled();
      }
    });
  });
});
