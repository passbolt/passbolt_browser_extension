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
import AccountEntity from "../entity/account/accountEntity";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import {defaultAccountDto} from "../entity/account/accountEntity.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import UserPassphrasePoliciesModel from "./userPassphrasePoliciesModel";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";
import {defaultUserPassphrasePoliciesDto, userPassphrasePoliciesDtoFromApi} from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity.test.data";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import PassboltServiceUnavailableError from "../../error/passboltServiceUnavailableError";
import PasswordPoliciesEntity from "../entity/passwordPolicies/passwordPoliciesEntity";

describe("UserPassphrasePolicies model", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    jest.resetAllMocks();
    fetch.doMockIf(/users\/csrf-token\.json/, () => mockApiResponse("csrf-token"));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findOrDefault', () => {
    it("should return the value stored on the API", async() => {
      expect.assertions(1);
      const expectedDto = defaultUserPassphrasePoliciesDto({
        entropy_minimum: 112
      });
      const expectedEntity = new UserPassphrasePoliciesEntity(expectedDto);
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponse(expectedDto));

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const result = await model.findOrDefault();

      expect(result).toStrictEqual(expectedEntity);
    });

    it("should return a default entity if something goes wrong on the API", async() => {
      expect.assertions(1);
      const expectedEntity = UserPassphrasePoliciesEntity.createFromDefault();
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponseError(404, "Endpoint is not existing"));

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const result = await model.findOrDefault();

      expect(result).toStrictEqual(expectedEntity);
    });

    it("should return a default entity if something goes wrong on the API", async() => {
      expect.assertions(1);
      const expectedEntity = UserPassphrasePoliciesEntity.createFromDefault();
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => { throw new Error("Something went wrong"); });

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const result = await model.findOrDefault();

      expect(result).toStrictEqual(expectedEntity);
    });
  });

  describe('::save', () => {
    it("should save a user passphrase policies and return the stored value from the API", async() => {
      expect.assertions(2);
      const baseData = {
        entropy_minimum: 112,
        external_dictionary_check: false
      };
      const dtoToSave = defaultUserPassphrasePoliciesDto(baseData);
      const entityToSave = new UserPassphrasePoliciesEntity(dtoToSave);

      const expectedDto = userPassphrasePoliciesDtoFromApi(baseData);
      const expectedEntity = new UserPassphrasePoliciesEntity(expectedDto);

      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, async request => {
        const body = JSON.parse(await request.text());
        expect(body).toStrictEqual(dtoToSave);
        return mockApiResponse(expectedDto);
      });

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const result = await model.save(entityToSave);

      expect(result).toStrictEqual(expectedEntity);
    });

    it("should throw an Error if the data to save is invalid", async() => {
      expect.assertions(1);

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const entity = PasswordPoliciesEntity.createFromDefault();
      const expectedError = new Error('The given entity is not a UserPassphrasePoliciesEntity');
      expect(() => model.save(entity)).rejects.toThrow(expectedError);
    });

    it("should throw an Error if something goes wrong on the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponseError(500, "Endpoint is not existing"));

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const entity = new UserPassphrasePoliciesEntity(defaultUserPassphrasePoliciesDto());
      try {
        await model.save(entity);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("should throw an Error if something goes wrong when request the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => { throw new Error("Something went wrong"); });

      const model = new UserPassphrasePoliciesModel(apiClientOptions);
      const entity = new UserPassphrasePoliciesEntity(defaultUserPassphrasePoliciesDto());
      try {
        await model.save(entity);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });
});
