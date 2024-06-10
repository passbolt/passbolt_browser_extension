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
 * @since         4.6.0
 */


import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {ownerPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data.js";
import ResourceService from "./resourceService";
import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";
import ResourceLocalStorageUpdateService from "./resourceLocalStorageUpdateService";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => {
    const resource1 = defaultResourceDto({name: "Resource1"});
    resource1.permission = ownerPermissionDto({aco_foreign_key: resource1.id});
    delete resource1.secrets;
    const resource2 = defaultResourceDto({name: "Resource2"});
    resource2.permission = ownerPermissionDto({aco_foreign_key: resource2.id});
    delete resource2.secrets;
    const resource3 = defaultResourceDto({name: "Resource3"});
    resource3.permission = ownerPermissionDto({aco_foreign_key: resource3.id});
    delete resource3.secrets;
    const resource4 = defaultResourceDto({name: "Resource4"});
    resource4.permission = ownerPermissionDto({aco_foreign_key: resource4.id});
    delete resource4.secrets;
    return [resource1, resource2, resource3, resource4];
  });
  // reset static data
  ResourceLocalStorageUpdateService._cachedResources = null;
});

describe("ResourceLocalStorageUpdateService", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  describe("ResourceLocalStorageUpdateService::getOrUpdateLocalStorage", () => {
    it("Should find all resources and set the local storage and get it on second call", async() => {
      expect.assertions(6);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const resourceLocalStorageUpdateService = new ResourceLocalStorageUpdateService(account, options);
      let resources = await resourceLocalStorageUpdateService.exec();
      const resourcesToCheckEquality = new ResourcesCollection(await ResourceLocalStorage.get());

      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledWith({permission: true, favorite: true, tag: true});
      expect(resources.items.length).toBe(resourcesToCheckEquality.items.length);
      expect(resources.toDto()).toStrictEqual(resourcesToCheckEquality.toDto());

      resources = await resourceLocalStorageUpdateService.exec(false);
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledTimes(1);
      expect(resources.length).toBe(resourcesToCheckEquality.length);
      expect(resources).toStrictEqual(resourcesToCheckEquality);
    });

    it("Should find all resources and set the local storage one time if it's not forced", async() => {
      expect.assertions(2);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const resourceLocalStorageUpdateService = new ResourceLocalStorageUpdateService(account, options);

      await resourceLocalStorageUpdateService.exec(true);
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledWith({permission: true, favorite: true, tag: true});

      jest.advanceTimersByTime(3000);

      await resourceLocalStorageUpdateService.exec(true);
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledTimes(1);
    });

    it("Should find all resources and set the local storage if the time is of the last called is more than 5000ms and forced", async() => {
      expect.assertions(2);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const resourceLocalStorageUpdateService = new ResourceLocalStorageUpdateService(account, options);

      await resourceLocalStorageUpdateService.exec(true);
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledWith({permission: true, favorite: true, tag: true});

      jest.advanceTimersByTime(5001);

      await resourceLocalStorageUpdateService.exec(true);
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledTimes(2);
    });

    it("Should cache the data and not call the API to get all resources", async() => {
      expect.assertions(3);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const resourceLocalStorageUpdateService = new ResourceLocalStorageUpdateService(account, options);

      await resourceLocalStorageUpdateService.exec();
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledWith({permission: true, favorite: true, tag: true});
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(5001);

      await resourceLocalStorageUpdateService.exec();
      expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  it("Should find all resources and set the local storage if the forceUpdate is true only once if the time is not overdue", async() => {
    expect.assertions(2);
    const options = new ApiClientOptions().setBaseUrl('https://localhost');
    const resourceLocalStorageUpdateService = new ResourceLocalStorageUpdateService(account, options);

    await resourceLocalStorageUpdateService.exec(true);
    expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledWith({permission: true, favorite: true, tag: true});

    await resourceLocalStorageUpdateService.exec(true);
    expect(resourceLocalStorageUpdateService.resourceService.findAll).toHaveBeenCalledTimes(1);
  });
});
