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
 * @since         5.2.0
 */

import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import ResourceUpdateLocalStorageService from "./resourceUpdateLocalStorageService";
import {
  defaultResourceDtosCollection
} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import {v4 as uuidv4} from "uuid";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("resourceUpdateLocalStorageService", () => {
  let resourceUpdateLocalStorageService;

  beforeEach(async() => {
    resourceUpdateLocalStorageService = new ResourceUpdateLocalStorageService();
  });

  describe("resourceUpdateLocalStorageService::updateFolderParentId", () => {
    it("Should update the resources folder parent id of resources present in local storage", async() => {
      expect.assertions(2);

      const resourceDtos = defaultResourceDtosCollection();
      const collection = new ResourcesCollection(resourceDtos);
      await ResourceLocalStorage.set(collection);
      const folderParentId = uuidv4();

      resourceDtos.forEach(resourceDto => {
        delete resourceDto.secrets;
        delete resourceDto.permissions;
        resourceDto.folder_parent_id = folderParentId;
      });
      const resourceCollectionExpected = new ResourcesCollection(resourceDtos);
      jest.spyOn(ResourceLocalStorage, "updateResourcesCollection");

      await resourceUpdateLocalStorageService.updateFolderParentId(collection.ids, folderParentId);

      expect(ResourceLocalStorage.updateResourcesCollection).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResourcesCollection).toHaveBeenCalledWith(resourceCollectionExpected);
    });

    it("Should update the resources folder parent id to null for resources present in local storage", async() => {
      expect.assertions(2);

      const resourceDtos = defaultResourceDtosCollection();
      const collection = new ResourcesCollection(resourceDtos);
      await ResourceLocalStorage.set(collection);

      resourceDtos.forEach(resourceDto => {
        delete resourceDto.secrets;
        delete resourceDto.permissions;
        resourceDto.folder_parent_id = null;
      });
      const resourceCollectionExpected = new ResourcesCollection(resourceDtos);
      jest.spyOn(ResourceLocalStorage, "updateResourcesCollection");

      await resourceUpdateLocalStorageService.updateFolderParentId(collection.ids, null);

      expect(ResourceLocalStorage.updateResourcesCollection).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResourcesCollection).toHaveBeenCalledWith(resourceCollectionExpected);
    });

    it("Should not update resources folder parent id if there is no resource in local storage", async() => {
      expect.assertions(1);

      const resourceDtos = defaultResourceDtosCollection();
      const collection = new ResourcesCollection(resourceDtos);
      const folderParentId = uuidv4();

      jest.spyOn(ResourceLocalStorage, "updateResourcesCollection");

      await resourceUpdateLocalStorageService.updateFolderParentId(collection.ids, folderParentId);

      expect(ResourceLocalStorage.updateResourcesCollection).not.toHaveBeenCalled();
    });

    it("Should update the resources folder parent id for only resources present in local storage", async() => {
      expect.assertions(2);

      const resourceDtos = defaultResourceDtosCollection();
      const collection = new ResourcesCollection(resourceDtos);
      await ResourceLocalStorage.set(new ResourcesCollection([resourceDtos[0], resourceDtos[1]]));
      const folderParentId = uuidv4();

      delete resourceDtos[0].secrets;
      delete resourceDtos[0].permissions;
      resourceDtos[0].folder_parent_id = folderParentId;
      delete resourceDtos[1].secrets;
      delete resourceDtos[1].permissions;
      resourceDtos[1].folder_parent_id = folderParentId;

      const resourceCollectionExpected = new ResourcesCollection([resourceDtos[0], resourceDtos[1]]);
      jest.spyOn(ResourceLocalStorage, "updateResourcesCollection");

      await resourceUpdateLocalStorageService.updateFolderParentId(collection.ids, folderParentId);

      expect(ResourceLocalStorage.updateResourcesCollection).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResourcesCollection).toHaveBeenCalledWith(resourceCollectionExpected);
    });

    it("Should not update resources folder parent id if ids not matched in the resource local storage", async() => {
      expect.assertions(1);

      const resourceDtos = defaultResourceDtosCollection();
      const collection = new ResourcesCollection(resourceDtos);
      await ResourceLocalStorage.set(new ResourcesCollection([defaultResourceDto(), defaultResourceDto()]));
      const folderParentId = uuidv4();

      jest.spyOn(ResourceLocalStorage, "updateResourcesCollection");

      await resourceUpdateLocalStorageService.updateFolderParentId(collection.ids, folderParentId);

      expect(ResourceLocalStorage.updateResourcesCollection).not.toHaveBeenCalled();
    });

    it("Should throw an error if resource id is not a uuid", async() => {
      expect.assertions(1);
      expect(() => resourceUpdateLocalStorageService.updateFolderParentId([uuidv4(), "non-uuid"], null)).rejects.toThrow(new TypeError('The parameter "resourcesIds" should contain only uuid', {cause: new TypeError("The given parameter is not a valid UUID")}));
    });

    it("Should throw an error if resource id is not a uuid", async() => {
      expect.assertions(1);
      expect(() => resourceUpdateLocalStorageService.updateFolderParentId([uuidv4()], "non-uuid")).rejects.toThrow(new TypeError("The folder parent id should be a valid UUID"));
    });
  });
});
