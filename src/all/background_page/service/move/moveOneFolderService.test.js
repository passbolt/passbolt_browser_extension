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
 * @since         4.10.1
 */
import FolderEntity from "../../model/entity/folder/folderEntity";
import MoveOneFolderService, {PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE} from "./moveOneFolderService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import {
  minimumPermissionDto,
  ownerFolderPermissionDto,
  ownerMinimalFolderPermissionDto,
  ownerMinimalPermissionDto,
  ownerPermissionDto, readFolderPermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import {v4 as uuidv4} from "uuid";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ConfirmMoveStrategyService from "./confirmMoveStrategyService";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {
  defaultPermissionsDtos
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionCollection.test.data";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import expect from "expect";
import ProgressService from "../progress/progressService";
import {PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL} from "../share/shareResourceService";
import {PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE} from "../share/shareFoldersService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MoveOneFolderService", () => {
  describe("::moveOne", () => {
    let account, progressService, service, worker, moveStrategyService;

    beforeEach(() => {
      account = new AccountEntity(defaultAccountDto());
      worker = {port: new MockPort()};
      progressService = new ProgressService(worker);
      jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);
      service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      moveStrategyService = new ConfirmMoveStrategyService(worker);
    });

    it("should assert its parameters", async() => {
      expect.assertions(9);
      await expect(() => service.moveOne()).rejects.toThrow("The parameter \"folderId\" should be a UUID");
      await expect(() => service.moveOne(null)).rejects.toThrow("The parameter \"folderId\" should be a UUID");
      await expect(() => service.moveOne(42)).rejects.toThrow("The parameter \"folderId\" should be a UUID");
      await expect(() => service.moveOne(uuidv4(), 42)).rejects.toThrow("The parameter \"destinationFolderId\" should be a UUID");
      const sameId = uuidv4();
      await expect(() => service.moveOne(sameId, sameId)).rejects.toThrow("The folder cannot be moved inside itself.");
      await expect(() => service.moveOne(uuidv4(), uuidv4())).rejects.toThrow("The parameter \"moveStrategyService\" should be MoveStrategy service instance.");
      await expect(() => service.moveOne(uuidv4(), uuidv4(), null)).rejects.toThrow("The parameter \"moveStrategyService\" should be MoveStrategy service instance.");
      await expect(() => service.moveOne(uuidv4(), uuidv4(), 42)).rejects.toThrow("The parameter \"moveStrategyService\" should be MoveStrategy service instance.");
      await expect(() => service.moveOne(uuidv4(), uuidv4(), new ConfirmMoveStrategyService(), 42)).rejects.toThrow("The parameter \"passphrase\" should be a string");
    });

    describe("should move folder according to different possible scenarios", () => {
      it("private folder, private parent, to private folder, no children folder, no resources", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm]
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, private parent, to root, no children folder, no resources", async() => {
        expect.assertions(10);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const foldersDto = [parentFolderDto, folderToMoveDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, private parent, to shared folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, private parent, to shared folder, no children folder, no resources, change permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          })
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, private parent, to private folder, with subfolders, with resources", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm]
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, private parent, to shared folder, with subfolders, with resources, keep permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, private parent, to shared folder, with subfolder, with resources, change permissions", async() => {
        expect.assertions(14);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, root parent, to private folder, no children folder, no resources", async() => {
        expect.assertions(10);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm]
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, root parent, to shared folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(10);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, root parent, to shared folder, no children folder, no resources, change permissions", async() => {
        expect.assertions(11);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          })
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, root parent, to private folder, with subfolder, with resources", async() => {
        expect.assertions(11);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm],
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, root parent, to shared folder, with subfolder, with resources, keep permissions", async() => {
        expect.assertions(11);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, root parent, to shared folder, with subfolder, with resources, change permission", async() => {
        expect.assertions(13);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to root, no children folder, no resources", async() => {
        expect.assertions(10);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}),
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const foldersDto = [parentFolderDto, folderToMoveDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to private folder, no children folder, no resources", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm]
        });

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}),
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });

        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to shared folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}),
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to shared folder, no children folder, no resources, change permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm, ...defaultPermissionsDtos({
            aco: 'Folder',
            aco_foreign_key: parentFolderPerm.aco_foreign_key
          }, {count: 2})]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          })
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to private folder, with subfolder, with resources", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}),
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          personal: true,
          permissions: [destinationFolderPerm],
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to shared folder, with subfolder, with resources, keep permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}),
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("private folder, shared parent, to shared folder, with subfolder, with resources, change permissions", async() => {
        expect.assertions(14);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm, ...defaultPermissionsDtos({
            aco: 'Folder',
            aco_foreign_key: parentFolderPerm.aco_foreign_key
          }, {count: 2})]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder1ToMovePerm,
          permissions: [subFolder1ToMovePerm]
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          personal: true,
          permission: subFolder2ToMovePerm,
          permissions: [subFolder2ToMovePerm]
        });
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: [resource0Perm]
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource1Perm,
          permissions: [resource1Perm]
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource2Perm,
          permissions: [resource2Perm]
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          }),
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to root, no children folder, no resources", async() => {
        expect.assertions(10);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}),
        });
        const foldersDto = [parentFolderDto, folderToMoveDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to private folder, no children folder, no resources", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm]
        });

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}),
        });

        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to shared folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}),
        });

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}),
        });

        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to shared folder, no children folder, no resources, change permission", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const otherUserDestinationFolderPermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2});
        const otherUserFolderToMovePermissionDto = defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2});

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm, ...otherUserDestinationFolderPermissionDto],
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm, ...otherUserFolderToMovePermissionDto],
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[0].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: otherUserDestinationFolderPermissionDto[1].aro_foreign_key
          })
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to private folder, with subfolder, with resources", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm],
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [resource1Perm, ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [resource2Perm, ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to shared folder, with subfolder, with resources, keep permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: false,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [resource1Perm, ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [resource2Perm, ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, private parent, to shared folder, with subfolder, with resources, change permission", async() => {
        expect.assertions(14);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: false,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [resource1Perm, ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [resource2Perm, ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, root parent, to private folder, no children folder, no resources", async() => {
        expect.assertions(10);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, root parent, to shared folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(10);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: false,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, root parent, to shared folder, no children folder, no resources, change permissions", async() => {
        expect.assertions(11);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: false,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...folderToMovePerms[1], delete: true},
          {...folderToMovePerms[2], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, root parent, to private folder, with subfolder, with resources", async() => {
        expect.assertions(11);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          personal: false,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [resource1Perm, ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [resource2Perm, ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, root parent, to shared folder, with subfolder, with resources, keep permissions", async() => {
        expect.assertions(11);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [resource1Perm, ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [resource2Perm, ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, root parent, to shared folder, with subfolder, with resources, change permission", async() => {
        expect.assertions(13);

        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [resource1Perm, ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [resource2Perm, ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...resource0Perms[1], delete: true},
          {...resource0Perms[2], delete: true},
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...resource1Perms[1], delete: true},
          {...resource1Perms[2], delete: true},
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...resource2Perms[1], delete: true},
          {...resource2Perms[2], delete: true},
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...folderToMovePerms[1], delete: true},
          {...folderToMovePerms[2], delete: true},
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...subFolder1ToMovePerms[1], delete: true},
          {...subFolder1ToMovePerms[2], delete: true},
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          {...subFolder2ToMovePerms[1], delete: true},
          {...subFolder2ToMovePerms[2], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to root, no children folder, no resources, keep permissions", async() => {
        expect.assertions(10);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to root, no children folder, no resources, change permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          {...folderToMovePerms[1], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to root, with subfolder, with resources, keep permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [
          resource0Perm,
          ownerPermissionDto({
            aco_foreign_key: resource0Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [
          resource1Perm,
          ownerPermissionDto({
            aco_foreign_key: resource1Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [
          resource2Perm,
          ownerPermissionDto({
            aco_foreign_key: resource2Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to root, with subfolder, with resources, change permissions", async() => {
        expect.assertions(13);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [
          resource0Perm,
          ownerPermissionDto({
            aco_foreign_key: resource0Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [
          resource1Perm,
          ownerPermissionDto({
            aco_foreign_key: resource1Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [
          resource2Perm,
          ownerPermissionDto({
            aco_foreign_key: resource2Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, null, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          {...resource0Perms[1], delete: true},
          {...resource1Perms[1], delete: true},
          {...resource2Perms[1], delete: true},
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          {...folderToMovePerms[1], delete: true},
          {...subFolder1ToMovePerms[1], delete: true},
          {...subFolder2ToMovePerms[1], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, null);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to private folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm],
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to private folder, no children folder, no resources, change permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm],
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          {...folderToMovePerms[1], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to private folder, with subfolder, with resources, change permissions", async() => {
        expect.assertions(14);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [parentFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: parentFolderPerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm],
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [
          resource0Perm,
          ownerPermissionDto({
            aco_foreign_key: resource0Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [
          resource1Perm,
          ownerPermissionDto({
            aco_foreign_key: resource1Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [
          resource2Perm,
          ownerPermissionDto({
            aco_foreign_key: resource2Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          {...resource0Perms[1], delete: true},
          {...resource1Perms[1], delete: true},
          {...resource2Perms[1], delete: true},
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          {...folderToMovePerms[1], delete: true},
          {...subFolder1ToMovePerms[1], delete: true},
          {...subFolder2ToMovePerms[1], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to shared folder, no children folder, no resources, keep permissions", async() => {
        expect.assertions(11);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [
          parentFolderPerm,
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [
          destinationFolderPerm,
          ownerFolderPermissionDto({
            aco_foreign_key: destinationFolderPerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
        ];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(false);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to shared folder, no children folder, no resources, change permissions", async() => {
        expect.assertions(12);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [
          parentFolderPerm,
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [
          destinationFolderPerm,
          ownerFolderPermissionDto({
            aco_foreign_key: destinationFolderPerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 3})
        ];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }), // permission similar on parent and dest to keep
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[2].aro_foreign_key
          }), // permission only on parent to remove
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }), // permission only on dest to not add again
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          {...folderToMovePerms[2], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("owned shared folder, shared parent, to shared folder, with subfolder, with resources, change permissions", async() => {
        expect.assertions(13);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const parentFolderPerms = [
          parentFolderPerm,
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolderPerm.aco_foreign_key}, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [
          destinationFolderPerm,
          ownerFolderPermissionDto({
            aco_foreign_key: destinationFolderPerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 3})
        ];
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [
          folderToMovePerm,
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }), // permission similar on parent and dest to keep
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[2].aro_foreign_key
          }), // permission only on parent to remove
          ownerFolderPermissionDto({
            aco_foreign_key: folderToMovePerm.aco_foreign_key,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }), // permission only on dest to not add again
          ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: folderToMovePerm.aco_foreign_key}, {count: 2})
        ];
        const subFolder1ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder1ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder1ToMovePerm.aco_foreign_key
        }));
        const subFolder2ToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const subFolder2ToMovePerms = folderToMovePerms.map(folderPerm => minimumPermissionDto({
          ...folderPerm,
          aco_foreign_key: subFolder2ToMovePerm.aco_foreign_key
        }));
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          permission: parentFolderPerm,
          permissions: parentFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const subFolder1ToMoveDto = defaultFolderDto({
          id: subFolder1ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder1ToMovePerm,
          permissions: subFolder1ToMovePerms,
        });
        const subFolder2ToMoveDto = defaultFolderDto({
          id: subFolder2ToMovePerm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: subFolder2ToMovePerm,
          permissions: subFolder2ToMovePerms,
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto, subFolder1ToMoveDto, subFolder2ToMoveDto];
        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [
          resource0Perm,
          ownerPermissionDto({
            aco_foreign_key: resource0Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];
        const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource1Perms = [
          resource1Perm,
          ownerPermissionDto({
            aco_foreign_key: resource1Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})];
        const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource2Perms = [
          resource2Perm,
          ownerPermissionDto({
            aco_foreign_key: resource2Perm.aco_foreign_key,
            aro_foreign_key: parentFolderPerms[1].aro_foreign_key
          }),
          ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resource1Dto = defaultResourceDto({
          id: resource1Perm.aco_foreign_key,
          folder_parent_id: subFolder1ToMoveDto.id,
          permission: resource1Perm,
          permissions: resource1Perms
        });
        const resource2Dto = defaultResourceDto({
          id: resource2Perm.aco_foreign_key,
          folder_parent_id: subFolder2ToMoveDto.id,
          permission: resource2Perm,
          permissions: resource2Perms
        });
        const resourcesDto = [resource0Dto, resource1Dto, resource2Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([folderToMoveDto.id, subFolder1ToMoveDto.id, subFolder2ToMoveDto.id]);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(2);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(parentFolderDto.id);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource0Dto.id, resource1Dto.id, resource2Dto.id]);
        expect(moveStrategyService.confirm).toHaveBeenCalledTimes(1);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
        const expectedResourcesPermissionChanges = new PermissionChangesCollection([
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource0Dto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource1Dto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalPermissionDto({
            aco_foreign_key: resource2Dto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          // {...resource0Perms[1], delete: true},
        ]);
        expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, pgpKeys.admin.passphrase);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
        const expectedFolderPermissionChanges = new PermissionChangesCollection([
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: folderToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          {...folderToMovePerms[2], delete: true},
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder1ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          {...subFolder1ToMovePerms[2], delete: true},
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
          }),
          ownerMinimalFolderPermissionDto({
            aco_foreign_key: subFolder2ToMoveDto.id,
            aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
          }),
          {...subFolder2ToMovePerms[2], delete: true},
        ]);
        expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledWith(expectedFolderPermissionChanges);
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });

      it("read shared folder, root parent, to private folder, no children folder, no resources", async() => {
        expect.assertions(9);

        const folderToMovePerm = readFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(service.findFoldersService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
        expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
        expect(service.findResourcesService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
        expect(moveStrategyService.confirm).not.toHaveBeenCalled();
        expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
        expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
        expect(service.folderModel.move).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
        expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      });
    });

    describe("notifies about its progress", () => {
      let account, progressService, service, worker, moveStrategyService;

      beforeEach(() => {
        account = new AccountEntity(defaultAccountDto());
        worker = {port: new MockPort()};
        progressService = new ProgressService(worker);
        jest.spyOn(progressService, "finishStep");
        jest.spyOn(progressService, "finishSteps");
        jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);
        service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

        moveStrategyService = new ConfirmMoveStrategyService(worker);
      });

      it("notifies of its progress when there is nothing to share.", async() => {
        expect.assertions(9);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});

        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          personal: true,
          permission: folderToMovePerm,
          permissions: [folderToMovePerm]
        });
        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: true,
          permission: destinationFolderPerm,
          permissions: [destinationFolderPerm]
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];
        const resourcesDto = [];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockImplementation(jest.fn);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(progressService.finishStep).toHaveBeenCalledTimes(7);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving folders permissions", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Calculating folders permissions changes", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Calculating resources permissions changes", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Confirming share operation", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Moving folder", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(7, "Updating folders local storage", true);
        expect(progressService._progress).toEqual(PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE);
      });

      it("notifies of its progress when there are resources and folders to share.", async() => {
        expect.assertions(9);

        const parentFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const folderToMovePerms = [folderToMovePerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: folderToMovePerm.aco_foreign_key
        }, {count: 2})];
        const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
        const destinationFolderPerms = [destinationFolderPerm, ...defaultPermissionsDtos({
          aco: 'Folder',
          aco_foreign_key: destinationFolderPerm.aco_foreign_key
        }, {count: 2})];

        const destinationFolderDto = defaultFolderDto({
          id: destinationFolderPerm.aco_foreign_key,
          personal: false,
          permission: destinationFolderPerm,
          permissions: destinationFolderPerms,
        });
        const parentFolderDto = defaultFolderDto({
          id: parentFolderPerm.aco_foreign_key,
          personal: true,
          permission: parentFolderPerm,
          permissions: [parentFolderPerm]
        });
        const folderToMoveDto = defaultFolderDto({
          id: folderToMovePerm.aco_foreign_key,
          folder_parent_id: parentFolderDto.id,
          permission: folderToMovePerm,
          permissions: folderToMovePerms
        });
        const foldersDto = [parentFolderDto, folderToMoveDto, destinationFolderDto];

        const resource0Perm = ownerPermissionDto({aro_foreign_key: account.id});
        const resource0Perms = [resource0Perm, ...defaultPermissionsDtos({aco_foreign_key: resource0Perm.aco_foreign_key}, {count: 2})];

        const resource0Dto = defaultResourceDto({
          id: resource0Perm.aco_foreign_key,
          folder_parent_id: folderToMoveDto.id,
          permission: resource0Perm,
          permissions: resource0Perms
        });
        const resourcesDto = [resource0Dto];

        await FolderLocalStorage.set(new FoldersCollection(foldersDto));
        jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
        jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
        jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
        await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
        jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
        jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
        jest.spyOn(moveStrategyService, "confirm").mockReturnValue(true);
        jest.spyOn(service.folderModel, "move").mockImplementation(jest.fn);
        jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, moveStrategyService, pgpKeys.admin.passphrase);

        expect(progressService.finishStep).toHaveBeenCalledTimes(7);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving folders permissions", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Calculating folders permissions changes", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Calculating resources permissions changes", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Confirming share operation", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Moving folder", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(7, "Updating folders local storage", true);
        expect(progressService._progress).toEqual(PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE - PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL - PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE); // Discount the share operations that are mocked.
      });
    });
  });

  describe("::assertFolderCanBeMoved", () => {
    it("should not throw if the folder can be moved", () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const progressService = {};
      const service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      const folder = new FolderEntity(defaultFolderDto());
      const destinationFolder = new FolderEntity(defaultFolderDto());
      const parentFolder = new FolderEntity(defaultFolderDto());
      expect(() => service.assertFolderCanBeMoved(folder, destinationFolder, parentFolder)).not.toThrow();
    });

    it("should throw an error if the target folder is the root folder and the destination folder is also the root folder", () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const progressService = {};
      const service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      const folder = new FolderEntity(defaultFolderDto({name: "Folder to move"}));
      expect(() => service.assertFolderCanBeMoved(folder, null, null)).toThrow(new Error(`Folder ${folder.name} is already in the root folder.`));
    });

    it("should throw an error if the destination folder is the current parent folder of the folder being moved", () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const progressService = {};
      const service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      const destinationFolder = new FolderEntity(defaultFolderDto({name: "Destination folder"}));
      const folder = new FolderEntity(defaultFolderDto({
        name: "Folder to move",
        folder_parent_id: destinationFolder.id
      }));
      expect(() => service.assertFolderCanBeMoved(folder, destinationFolder, destinationFolder)).toThrow(new Error(`Folder ${folder.name} is already in folder ${destinationFolder.name}.`));
    });

    it("should throw an error if the target folder is the root folder and the destination folder is also the root folder", () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const progressService = {};
      const service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      const parentFolder = new FolderEntity(defaultFolderDto());
      const folder = new FolderEntity(defaultFolderDto({folder_parent_id: parentFolder.id}));
      const destinationFolder = new FolderEntity(defaultFolderDto());

      jest.spyOn(FolderEntity, "canFolderMove").mockImplementation(() => false);

      expect(() => service.assertFolderCanBeMoved(folder, destinationFolder, parentFolder)).toThrow(new Error(`Folder ${folder.name} can not be moved.`));
    });
  });
});
