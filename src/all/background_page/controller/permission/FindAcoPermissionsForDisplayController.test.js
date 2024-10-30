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

import {v4 as uuidv4} from "uuid";
import FindAcoPermissionsForDisplayController from "./FindAcoPermissionsForDisplayController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import PermissionEntity from "../../model/entity/permission/permissionEntity";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {
  defaultPermissionsDtos
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionCollection.test.data";
import PermissionsCollection from "../../model/entity/permission/permissionsCollection";
import FolderService from "../../service/api/folder/folderService";

describe("FindAcoPermissionsForDisplayController", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("FindAcoPermissionsForDisplayController::exec", () => {
    it("Should find all permission from a resource id.", async() => {
      expect.assertions(4);

      // initialisation
      const controller = new FindAcoPermissionsForDisplayController(null, null, defaultApiClientOptions(), account);
      const resourceId = uuidv4();
      const permissionsDto = defaultPermissionsDtos({}, {withUser: true});
      // mocked function
      jest.spyOn(controller.findPermissionService, "findAllByAcoForeignKeyForDisplay").mockImplementationOnce(() => new PermissionsCollection(permissionsDto));
      jest.spyOn(controller.findFolderService, "findById");

      // process
      const permissionsCollection = await controller.exec(resourceId, PermissionEntity.ACO_RESOURCE);

      // expectations
      expect(controller.findPermissionService.findAllByAcoForeignKeyForDisplay).toHaveBeenCalledTimes(1);
      expect(controller.findPermissionService.findAllByAcoForeignKeyForDisplay).toHaveBeenCalledWith(resourceId);
      expect(controller.findFolderService.findById).toHaveBeenCalledTimes(0);
      expect(permissionsCollection.toDto()).toEqual(permissionsDto);
    });

    it("Should find all permission from a folder id.", async() => {
      expect.assertions(4);

      // initialisation
      const folderDto = defaultFolderDto({}, {withPermissions: true});
      const controller = new FindAcoPermissionsForDisplayController(null, null, defaultApiClientOptions(), account);
      const folderId = uuidv4();
      // mocked function
      jest.spyOn(controller.findPermissionService, "findAllByAcoForeignKeyForDisplay").mockImplementationOnce(jest.fn());
      jest.spyOn(controller.findFolderService, "findById");
      jest.spyOn(FolderService.prototype, "get").mockImplementation(() => folderDto);

      // process
      const permissionsCollection = await controller.exec(folderId, PermissionEntity.ACO_FOLDER);

      // expectations
      expect(controller.findPermissionService.findAllByAcoForeignKeyForDisplay).toHaveBeenCalledTimes(0);
      expect(controller.findFolderService.findById).toHaveBeenCalledTimes(1);
      expect(controller.findFolderService.findById).toHaveBeenCalledWith(folderId, {'permissions.user.profile': true, 'permissions.group': true});
      expect(permissionsCollection.toDto()).toEqual(folderDto.permissions);
    });

    it("Should throw error if acoId is not a uuid.", async() => {
      expect.assertions(1);

      // initialisation
      const controller = new FindAcoPermissionsForDisplayController(null, null, defaultApiClientOptions(), account);

      try {
        // process
        await controller.exec({}, PermissionEntity.ACO_FOLDER);
      } catch (error) {
        expect(error.message).toEqual("The given parameter is not a valid UUID");
      }
    });

    it("Should throw error if acoType is not a string.", async() => {
      expect.assertions(1);

      // initialisation
      const controller = new FindAcoPermissionsForDisplayController(null, null, defaultApiClientOptions(), account);

      try {
        // process
        await controller.exec(uuidv4());
      } catch (error) {
        expect(error.message).toEqual("The given parameter is not a valid string");
      }
    });
  });
});

