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
 * @since         5.7.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../../test/mocks/mockApiResponse";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import FavoriteApiService from "./favoriteApiService";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {v4 as uuidv4} from "uuid";
import {defaultFavoriteDto} from "passbolt-styleguide/src/shared/models/entity/favorite/favoriteEntity.test.data";

describe("FavoriteApiService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::create', () => {
    let service;

    beforeEach(() => {
      service = new FavoriteApiService(apiClientOptions);
    });

    it("adds a resource to favorites.", async() => {
      expect.assertions(2);

      const foreignModel = 'Resource';
      const foreignId = uuidv4();
      fetch.doMockOnceIf(new RegExp(`/${foreignModel.toLowerCase()}/${foreignId}`), async req => {
        expect(req.method).toEqual("POST");
        return mockApiResponse(defaultFavoriteDto());
      });

      const resultDto = await service.create(foreignModel, foreignId);
      expect(resultDto).toEqual(expect.objectContaining({
        id: expect.any(String),
        created: expect.any(String),
        foreign_key: expect.any(String),
        user_id: expect.any(String),
      }));
    });

    it("throws an invalid parameter error if the foreignId key parameter is not valid", async() => {
      expect.assertions(2);

      await expect(() => service.create('Resource', 42)).rejects.toThrowError("The id '42' is not a valid uuid.");
      await expect(() => service.create('Resource', "not a uuid")).rejects.toThrowError("The id 'not a uuid' is not a valid uuid.");
    });

    it("throws an invalid parameter error if the foreignModel key parameter is not valid", async() => {
      expect.assertions(3);

      const expectedId = uuidv4();

      await expect(() => service.create(42, expectedId)).rejects.toThrowError("Favorite foreign model should be a valid string.");
      await expect(() => service.create("", expectedId)).rejects.toThrowError("Favorite foreign model should be a valid string.");
      await expect(() => service.create("not a valid foreign key", expectedId)).rejects.toThrowError("Favorite foreign model 'not a valid foreign key' is not in the list of supported models.");
    });
  });

  describe('::delete', () => {
    let service;

    beforeEach(() => {
      service = new FavoriteApiService(apiClientOptions);
    });

    it("removes a resource from favorites.", async() => {
      expect.assertions(2);

      const foreignId = uuidv4();
      fetch.doMockOnceIf(new RegExp(`/${foreignId}`), async req => {
        expect(req.method).toEqual("DELETE");
        return mockApiResponse(defaultFavoriteDto());
      });

      const resultDto = await service.delete(foreignId);
      expect(resultDto).toEqual(expect.objectContaining({
        id: expect.any(String),
        created: expect.any(String),
        foreign_key: expect.any(String),
        user_id: expect.any(String),
      }));
    });

    it("throws an invalid parameter error if the foreignId key parameter is not valid", async() => {
      expect.assertions(2);

      await expect(() => service.delete(42)).rejects.toThrowError("The id '42' is not a valid uuid.");
      await expect(() => service.delete("not a uuid")).rejects.toThrowError("The id 'not a uuid' is not a valid uuid.");
    });
  });

  describe('::assertValidForeignModel', () => {
    let service;

    beforeEach(() => {
      service = new FavoriteApiService(apiClientOptions);
    });

    it("should not throw an error for valid foreign models", () => {
      const validModels = ['Resource']; // Add other valid models as needed
      validModels.forEach(model => {
        expect(() => service.assertValidForeignModel(model)).not.toThrow();
      });
    });

    it("should throw an error for invalid foreign models", () => {
      const invalidModels = ['InvalidModel', ''];
      invalidModels.forEach(model => {
        expect(() => service.assertValidForeignModel(model)).toThrowError(TypeError);
      });
    });

    it("should throw an error for non-string inputs", () => {
      const nonStringInputs = [42, {}, null, undefined];
      nonStringInputs.forEach(input => {
        expect(() => service.assertValidForeignModel(input)).toThrowError(TypeError);
      });
    });
  });
});
