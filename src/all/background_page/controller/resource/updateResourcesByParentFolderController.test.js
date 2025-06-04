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
 * @since         5.3.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {multipleResourceDtos} from "../../service/resource/findResourcesService.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import {v4 as uuidv4} from "uuid";
import UpdateResourcesByParentFolderController from "./updateResourcesByParentFolderController";

describe("UpdateResourcesByParentFolderController", () => {
  let controller, worker;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new UpdateResourcesByParentFolderController(worker, null, apiClientOptions, account);
  });

  describe("::exec", () => {
    it("should return the resource collection associated to the parent folder id", async() => {
      expect.assertions(2);

      const resourcesCollection = new ResourcesCollection(multipleResourceDtos());
      const parentFolderId = uuidv4();

      jest.spyOn(controller.findAndUpdateResourcesLocalStorage, "findAndUpdateByParentFolderId").mockImplementation(() => resourcesCollection);

      const result = await controller.exec(parentFolderId);

      expect(result).toEqual(resourcesCollection);
      expect(controller.findAndUpdateResourcesLocalStorage.findAndUpdateByParentFolderId).toHaveBeenCalledWith(parentFolderId);
    });

    it("should throw an error if the parent folder id is not a valid uuid", async() => {
      expect.assertions(1);

      const promise =  controller.exec(42);

      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });
});
