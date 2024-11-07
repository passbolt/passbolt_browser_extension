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
import expect from "expect";
import {v4 as uuidv4} from "uuid";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MockPort from "passbolt-styleguide/test/mocks/mockPort";
import {
  defaultPermissionDto,
  minimumPermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import ShareOneFolderController from "./shareOneFolderController";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
const {pgpKeys} = require("passbolt-styleguide/test/fixture/pgpKeys/keys");

describe("ShareOneFolderController", () => {
  describe("::exec", () => {
    let account, controller;
    beforeEach(async() => {
      const apiClientOptions = defaultApiClientOptions();
      account = new AccountEntity(adminAccountDto());
      const mockedWorker = {port: new MockPort()};
      controller = new ShareOneFolderController(mockedWorker, uuidv4(), apiClientOptions, account);
    });

    it("throws if the parameters are not valid.", async() => {
      expect.assertions(4);
      await expect(() => controller.exec("wrong", [])).rejects.toThrow(new TypeError('The parameter "folderId" should be a UUID'));
      await expect(() => controller.exec([uuidv4()], "not-valid")).rejects.toThrow(new TypeError('The parameter "permissionChangesDto" should be an array'));
      await expect(() => controller.exec([uuidv4()], [])).rejects.toThrow(new TypeError('The parameter "permissionChangesDto" should be a non empty array'));
      const execPromiseEntityValidationError = controller.exec([uuidv4()], [{}]);
      await expect(execPromiseEntityValidationError).rejects.toThrowEntityValidationErrorOnProperties(["aco", "aro", "aco_foreign_key", "aro_foreign_key", "type"]);
    });

    it("shares one folder and its content.", async() => {
      expect.assertions(2);
      const folderIdToShare = uuidv4();

      // Permission changes to apply to the share (Modify one, add one and delete one)
      const carolPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: folderIdToShare,
        type: 1,
      });
      const bettyPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: folderIdToShare,
        type: 15,
      });
      const adaPermissionChange = defaultPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.ada.userId,
        aco_foreign_key: folderIdToShare,
        type: 7,
        delete: true
      });
      const permissionsChangesDto = [adaPermissionChange, bettyPermissionChange, carolPermissionChange];

      // mock retrieval of folder
      const foldersDto = [defaultFolderDto({id: folderIdToShare})];
      jest.spyOn(controller.getOrFindFoldersService, "getOrFindAll").mockImplementation(() => new FoldersCollection(foldersDto));
      // mock passphrase service
      jest.spyOn(controller.shareFoldersService, "shareOne").mockImplementation(jest.fn);
      // mock share folders service
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementation(() => pgpKeys.admin.passphrase);

      await controller.exec(folderIdToShare, permissionsChangesDto);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalled();
      expect(controller.shareFoldersService.shareOne).toHaveBeenCalledWith(folderIdToShare, new PermissionChangesCollection(permissionsChangesDto), pgpKeys.admin.passphrase);
    });
  });
});
