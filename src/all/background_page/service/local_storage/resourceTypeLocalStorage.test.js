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
import ResourceTypeLocalStorage from "./resourceTypeLocalStorage";
import { resourceTypeV5DefaultDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import ResourceTypeEntity from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

describe("ResourceTypeLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  // spy on
  jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);

  describe("ResourceTypeLocalStorage::get", () => {
    it("Should return undefined if nothing stored in the storage", async () => {
      expect.assertions(1);
      const resourceTypeLocalstorage = new ResourceTypeLocalStorage(account);
      const result = await resourceTypeLocalstorage.getData();
      expect(result).toEqual(undefined);
    });

    it("Should return content stored in the local storage", async () => {
      const resourceTypes = [resourceTypeV5DefaultDto()];
      expect.assertions(1);
      const resourceTypeLocalstorage = new ResourceTypeLocalStorage(account);
      browser.storage.local.set({ [resourceTypeLocalstorage.storageDataKey]: resourceTypes });
      const result = await resourceTypeLocalstorage.getData();
      expect(result).toEqual(resourceTypes);
    });
  });

  describe("ResourceTypeLocalStorage::setData", () => {
    it("Should setData a resourceType colection in the local storage", async () => {
      expect.assertions(2);
      const resourceTypeLocalstorage = new ResourceTypeLocalStorage(account);
      const resourceType = new ResourceTypeEntity(resourceTypeV5DefaultDto());
      const resourceTypesCollection = new ResourceTypesCollection([resourceType]);
      await resourceTypeLocalstorage.setData(resourceTypesCollection);
      const resourceTypes = await resourceTypeLocalstorage.getData();
      expect(resourceTypes).toHaveLength(1);
      expect(resourceTypes[0]).toEqual(resourceType.toDto(ResourceTypeEntity.ALL_CONTAIN_OPTIONS));
    });
  });

  describe("ResourceTypeLocalStorage::flush", () => {
    it("Should flush all the resourceType from the local storage", async () => {
      expect.assertions(1);
      const resourceTypeLocalstorage = new ResourceTypeLocalStorage(account);
      await resourceTypeLocalstorage.flush();
      const resourceTypes = await resourceTypeLocalstorage.getData();
      expect(resourceTypes).toEqual(undefined);
    });
  });
});
