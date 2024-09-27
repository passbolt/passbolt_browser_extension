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
 * @since         4.9.4
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {v4 as uuidv4} from "uuid";
import FindAllIdsByIsSharedWithGroupController from "./findAllIdsByIsSharedWithGroupController";
import FindAndUpdateResourcesLocalStorage from "../../service/resource/findAndUpdateResourcesLocalStorageService";
import ResourceService from "../../service/api/resource/resourceService";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {multipleResourceDtos} from "../../service/resource/findResourcesService.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";

describe("FindAllIdsByIsSharedWithGroupController", () => {
  let controller, worker, groupId;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    groupId = uuidv4();
    controller = new FindAllIdsByIsSharedWithGroupController(worker, null, apiClientOptions, account);
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
  });
  describe("FindAllIdsByIsSharedWithGroupController::_exec", () => {
    it("Shoul emit a success message when resource ids can be retrieved", async() => {
      expect.assertions(1);

      const resourceCollectionDto = multipleResourceDtos();
      const expectedResult = new ResourcesCollection(resourceCollectionDto).extract("id");
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionDto);

      await controller._exec(groupId);

      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'SUCCESS', expectedResult);
    });

    it("Should emit an error message whenever a error occured", async() => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => { throw error; });
      await controller._exec(groupId);

      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'ERROR', error);
    });
  });
  describe("FindAllIdsByIsSharedWithGroupController::exec", () => {
    it("Should return the resources ids link to the group Id and call findAndUpdateByIsSharedWithGroup method", async() => {
      expect.assertions(3);

      const resourceCollectionDto = multipleResourceDtos();
      const expectedResult = new ResourcesCollection(resourceCollectionDto).extract("id");
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionDto);
      jest.spyOn(FindAndUpdateResourcesLocalStorage.prototype, "findAndUpdateByIsSharedWithGroup");

      const resourceIds = await controller.exec(groupId);

      expect(resourceIds).toEqual(expectedResult);
      expect(FindAndUpdateResourcesLocalStorage.prototype.findAndUpdateByIsSharedWithGroup).toHaveBeenCalledTimes(1);
      expect(FindAndUpdateResourcesLocalStorage.prototype.findAndUpdateByIsSharedWithGroup).toHaveBeenCalledWith(groupId);
    });

    it("Should allow a group to not include any resources", async() => {
      expect.assertions(2);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);
      const resourceIds = await controller.exec(groupId);

      expect(resourceIds.length).toEqual(0);
      expect(resourceIds).toEqual([]);
    });

    it("Should not allow groupId which is not an UUID", async() => {
      expect.assertions(1);

      const promise = controller.exec("groupId");

      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });
});
