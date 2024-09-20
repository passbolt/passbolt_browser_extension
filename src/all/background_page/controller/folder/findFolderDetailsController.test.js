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
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FindFolderDetailsController from "./findFolderDetailsController";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FolderService from "../../service/api/folder/folderService";

describe("FindFolderDetailsController", () => {
  let controller;

  beforeEach(() => {
    const apiClientOptions = defaultApiClientOptions();
    controller = new FindFolderDetailsController(null, null, apiClientOptions);
  });
  describe("FindFolderDetailsController::exec", () => {
    it("Should call the findAndUpdateFoldersLocalStorageService", async() => {
      expect.assertions(3);
      const folderDto = defaultFolderDto({}, {withCreator: true, withModifier: true});
      jest.spyOn(FolderService.prototype, "get").mockImplementationOnce(() => folderDto);
      jest.spyOn(controller.findFolderService, "findById");
      jest.spyOn(controller.findFolderService, "findByIdWithCreatorAndModifier");

      const folderEntity = await controller.exec(folderDto.id);

      expect(controller.findFolderService.findByIdWithCreatorAndModifier).toHaveBeenCalledTimes(1);
      expect(controller.findFolderService.findById).toHaveBeenCalledWith(folderDto.id, {creator: true, modifier: true});
      expect(folderEntity).toEqual(new FolderEntity(folderDto));
    });

    it("Should throw an error if folder id is not an uuid", async() => {
      expect.assertions(1);

      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });
});
