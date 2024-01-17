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
 * @since         4.4.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import AccountEntity from "../entity/account/accountEntity";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import {defaultAccountDto} from "../entity/account/accountEntity.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import PassboltServiceUnavailableError from "../../error/passboltServiceUnavailableError";
import PasswordPoliciesEntity from "../entity/passwordPolicies/passwordPoliciesEntity";
import {defaultPasswordExpirySettingsDto, defaultPasswordExpirySettingsDtoFromApi} from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity.test.data";
import PasswordExpirySettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity";
import PasswordExpirySettingsModel from "./passwordExpirySettingsModel";
import {v4 as uuid} from "uuid";
import PassboltBadResponseError from "../../error/passboltBadResponseError";
import PasswordExpiryProSettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiryPro/passwordExpiryProSettingsEntity";

describe("PasswordExpiry model", () => {
  let apiClientOptions, model;
  beforeEach(async() => {
    enableFetchMocks();
    jest.resetAllMocks();
    fetch.doMockIf(/users\/csrf-token\.json/, () => mockApiResponse("csrf-token"));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
    model = new PasswordExpirySettingsModel(account, apiClientOptions);
    jest.spyOn(model.organisationSettingsModel, "getOrFind").mockImplementation(() => (Promise.resolve({
      isPluginEnabled: () => false
    })));
  });

  describe('::findOrDefault', () => {
    it("should return the value stored on the API", async() => {
      expect.assertions(1);
      const expectedDto = defaultPasswordExpirySettingsDtoFromApi();
      const expectedEntity = new PasswordExpirySettingsEntity(expectedDto);
      fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => mockApiResponse(expectedDto));

      const result = await model.getOrFindOrDefault();

      expect(result).toStrictEqual(expectedEntity);
    });

    it("should return a default entity if the API returns an HTTP error", async() => {
      expect.assertions(1);
      const expectedEntity = PasswordExpirySettingsEntity.createFromDefault();
      fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => mockApiResponseError(404, "Endpoint is not existing"));

      const result = await model.getOrFindOrDefault();

      expect(result).toStrictEqual(expectedEntity);
    });

    it("should return a default entity if something goes wrong on the API", async() => {
      expect.assertions(1);
      const expectedEntity = PasswordExpirySettingsEntity.createFromDefault();
      fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => { throw new Error("Something went wrong"); });

      const result = await model.getOrFindOrDefault();

      expect(result).toStrictEqual(expectedEntity);
    });
  });

  describe('::save', () => {
    it("should save the entity and return the stored value from the API", async() => {
      expect.assertions(2);
      const baseData = {
        default_expiry_period: null,
        policy_override: true,
        automatic_update: false,
        expiry_notification: null,
      };
      const dtoToSave = defaultPasswordExpirySettingsDto(baseData);
      const entityToSave = new PasswordExpirySettingsEntity(dtoToSave);

      const expectedDto = defaultPasswordExpirySettingsDtoFromApi(baseData);
      const expectedEntity = new PasswordExpirySettingsEntity(expectedDto);

      fetch.doMockOnceIf(/password-expiry\/settings\.json/, async request => {
        const body = JSON.parse(await request.text());
        expect(body).toStrictEqual(dtoToSave);
        return mockApiResponse(expectedDto);
      });

      const result = await model.save(entityToSave);

      expect(result).toStrictEqual(expectedEntity);
    });

    it("should throw an Error if the data to save is invalid", async() => {
      expect.assertions(1);

      const entity = PasswordPoliciesEntity.createFromDefault();
      const expectedError = new Error('The given entity is not a PasswordExpirySettingsEntity');
      expect(() => model.save(entity)).rejects.toThrow(expectedError);
    });

    it("should throw an Error if something goes wrong on the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => mockApiResponseError(500, "Endpoint is not existing"));

      const entity = new PasswordExpirySettingsEntity(defaultPasswordExpirySettingsDto());
      try {
        await model.save(entity);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("should throw an Error if the API returns an HTTP error", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => { throw new Error("Something went wrong"); });

      const entity = new PasswordExpirySettingsEntity(defaultPasswordExpirySettingsDto());
      try {
        await model.save(entity);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });

  describe('::delete', () => {
    it("should delete the entity from the API given an ID", async() => {
      const passwordExpiryId = uuid();
      fetch.doMockOnceIf(new RegExp(`/password-expiry\/settings\/${passwordExpiryId}\.json`), () => mockApiResponse({}));

      await expect(model.delete(passwordExpiryId)).resolves.not.toThrow();
    });

    it("should throw an Error if the ID to delete is not a UUID", async() => {
      expect.assertions(1);

      const expectedError = new Error("The password expiry settings id should be a valid uuid.");
      expect(() => model.delete("test")).rejects.toThrow(expectedError);
    });

    it("should throw an Error if something goes wrong on the API", async() => {
      expect.assertions(1);
      const passwordExpiryId = uuid();
      fetch.doMockOnceIf(new RegExp(`/password-expiry\/settings\/${passwordExpiryId}\.json`), mockApiResponseError(500, "Something wrong happened"));

      try {
        await model.delete(passwordExpiryId);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltBadResponseError);
      }
    });

    it("should throw an Error if something goes wrong when request the API", async() => {
      expect.assertions(1);
      const passwordExpiryId = uuid();
      fetch.doMockOnceIf(new RegExp(`/password-expiry\/settings\/${passwordExpiryId}\.json`), () => { throw new Error("Something went wrong"); });

      try {
        await model.delete(passwordExpiryId);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });
  describe('::createByDefault', () => {
    it("should return an PasswordExpirySettingsEntity when passwordExpiryPolicies is disabled ", async() => {
      expect.assertions(1);

      const result = await model.createFromDefault();

      expect(result).toBeInstanceOf(PasswordExpirySettingsEntity);
    });

    it("should return an PasswordExpiryProSettingsEntity when passwordExpiryPolicies is enabled ", async() => {
      expect.assertions(1);

      jest.spyOn(model.organisationSettingsModel, "getOrFind").mockImplementation(() => (Promise.resolve({
        isPluginEnabled: () => true
      })));

      const result = await model.createFromDefault();
      expect(result).toBeInstanceOf(PasswordExpiryProSettingsEntity);
    });
  });
});
