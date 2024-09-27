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
import UpdateAllFolderLocalStorageController from "./updateAllFoldersLocalStorageController";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FindFoldersService from "../../service/folder/find/findFoldersService";
import FolderLocalStorage from "../../service/local_storage/folderLocalStorage";
import FoldersCollection from "../../model/entity/folder/foldersCollection";

describe("UpdateAllFoldersLocalStorageController", () => {
  let controller;

  beforeEach(() => {
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new UpdateAllFolderLocalStorageController(null, null, apiClientOptions, account);
  });
  describe("UpdateAllFoldersLocalStorageController::exec", () => {
    it("Should call the findAndUpdateFoldersLocalStorageService and emit a success message", async() => {
      expect.assertions(3);
      const multipleFolderDtos = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FindFoldersService.prototype, "findAll").mockImplementationOnce(() => new FoldersCollection(multipleFolderDtos));
      jest.spyOn(controller.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll");

      await controller.exec();
      const foldersLSDto = await FolderLocalStorage.get();

      expect(controller.findAndUpdateFoldersLocalStorageService.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(controller.findAndUpdateFoldersLocalStorageService.findAndUpdateAll).toHaveBeenCalledWith({updatePeriodThreshold: 10000});
      expect(foldersLSDto).toEqual(multipleFolderDtos);
    });
  });
});
