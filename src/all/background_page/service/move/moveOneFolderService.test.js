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
import MoveOneFolderService, { PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE } from "./moveOneFolderService";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import {
  ownerFolderPermissionDto,
  ownerGroupPermissionDto,
  ownerPermissionDto,
  readFolderPermissionDto,
  readPermissionDto,
  updateFolderPermissionDto,
  updatePermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import { v4 as uuidv4 } from "uuid";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import ProgressService from "../progress/progressService";
import { PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL } from "../share/shareResourceService";
import { PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE } from "../share/shareFoldersService";

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Wire the services `moveOne` depends on: the folder tree comes from local storage, so the real
 * ownership resolution runs, while the share, move and storage calls are mocked.
 * @param {MoveOneFolderService} service
 * @param {Array<object>} foldersDto The folders to seed local storage and answer the find services with.
 * @param {Array<object>} resourcesDto The resources to seed local storage and answer the find services with.
 * @returns {Promise<void>}
 */
async function mockServiceDependencies(service, foldersDto, resourcesDto) {
  await FolderLocalStorage.set(new FoldersCollection(foldersDto));
  await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
  jest
    .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
    .mockImplementation((ids) => new FoldersCollection(foldersDto.filter((folderDto) => ids.includes(folderDto.id))));
  jest
    .spyOn(service.findFoldersService, "findByIdWithPermissions")
    .mockImplementation((id) => new FolderEntity(foldersDto.find((folderDto) => folderDto.id === id)));
  jest
    .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
    .mockImplementation(
      (ids) => new ResourcesCollection(resourcesDto.filter((resourceDto) => ids.includes(resourceDto.id))),
    );
  jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
  jest.spyOn(service.shareFolderService, "saveFoldersPermissionsChanges").mockImplementation(jest.fn);
  jest.spyOn(service.moveApiService, "moveFolder").mockImplementation(jest.fn);
  jest.spyOn(service.findAndUpdateFoldersLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);
}

describe("MoveOneFolderService", () => {
  describe("::moveOne", () => {
    let account, progressService, service, worker;

    beforeEach(() => {
      account = new AccountEntity(defaultAccountDto());
      worker = { port: new MockPort() };
      progressService = new ProgressService(worker);
      jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);
      service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);
    });

    it("should assert its parameters", async () => {
      expect.assertions(6);
      await expect(() => service.moveOne()).rejects.toThrow('The parameter "folderId" should be a UUID');
      await expect(() => service.moveOne(42)).rejects.toThrow('The parameter "folderId" should be a UUID');
      await expect(() => service.moveOne(uuidv4(), 42)).rejects.toThrow(
        'The parameter "destinationFolderId" should be a UUID',
      );
      const sameId = uuidv4();
      await expect(() => service.moveOne(sameId, sameId)).rejects.toThrow("The folder cannot be moved inside itself.");
      await expect(() => service.moveOne(uuidv4(), uuidv4(), 42)).rejects.toThrow(
        'The parameter "confirmedPermissions" should be a Map keyed by item id.',
      );
      const confirmedPermissions = new Map([
        [
          uuidv4(),
          new PermissionsCollection([ownerFolderPermissionDto({ aro_foreign_key: account.id })], {
            assertAtLeastOneOwner: false,
          }),
        ],
      ]);
      await expect(() => service.moveOne(uuidv4(), uuidv4(), confirmedPermissions, 42)).rejects.toThrow(
        'The parameter "passphrase" should be a string',
      );
    });

    it("moves the folder without changing permissions when no permission was confirmed", async () => {
      expect.assertions(4);

      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        personal: true,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({
        id: destinationFolderPerm.aco_foreign_key,
        personal: true,
        permission: destinationFolderPerm,
        permissions: [destinationFolderPerm],
      });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], []);

      await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, new Map(), pgpKeys.admin.passphrase);

      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
      expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
      expect(service.moveApiService.moveFolder).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderDto.id);
      expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
    });

    it("applies the operator-confirmed permissions to the moved folder, then moves it", async () => {
      expect.assertions(5);

      const extraUserId = uuidv4();
      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      // Folder moved from the root: no parent permissions to remove, so the confirmed set is applied as-is.
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], []);

      // The operator confirmed the destination permissions: their own ownership + an extra reader.
      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
      expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
      const folderChanges = service.shareFolderService.saveFoldersPermissionsChanges.mock.calls[0][0];
      // The operator's ownership is unchanged; only the extra reader is added on the moved folder.
      expect(folderChanges.items).toHaveLength(1);
      expect(folderChanges.items[0].aroForeignKey).toStrictEqual(extraUserId);
      expect(service.moveApiService.moveFolder).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderId);
    });

    it("applies the operator-confirmed permissions to owned descendant resources", async () => {
      expect.assertions(3);

      const extraUserId = uuidv4();
      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: folderToMoveDto.id,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], [resourceDto]);

      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const [sharedResourceIds, resourceChanges] = service.shareResourceService.shareAll.mock.calls[0];
      expect(sharedResourceIds).toStrictEqual([resourceDto.id]);
      expect(resourceChanges.items.some((change) => change.aroForeignKey === extraUserId)).toBe(true);
    });

    it("skips the cascade entirely, even into an owned descendant, when the moved folder's own target has no delta", async () => {
      expect.assertions(2);

      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      // An owned resource below, which would be reached if anything were copied down.
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: folderToMoveDto.id,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], [resourceDto]);

      // The operator confirms exactly what the folder already has, so nothing changes.
      const folderTargetPermissions = new PermissionsCollection([folderToMovePerm], { assertAtLeastOneOwner: false });
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      // The folder's own permissions do not change, so nothing reaches the resource below either.
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
      expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
    });

    it("excludes descendants the operator does not own from the permission changes", async () => {
      expect.assertions(3);

      const extraUserId = uuidv4();
      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      // A folder below the operator can only read, owned by someone else. Its permissions must not change.
      const notOwnedSubFolderId = uuidv4();
      const notOwnedSubFolderOwnerPerm = ownerFolderPermissionDto({
        aco_foreign_key: notOwnedSubFolderId,
        aro_foreign_key: uuidv4(),
      });
      const notOwnedSubFolderReadPerm = readFolderPermissionDto({
        aco_foreign_key: notOwnedSubFolderId,
        aro_foreign_key: account.id,
      });
      const notOwnedSubFolderDto = defaultFolderDto({
        id: notOwnedSubFolderId,
        folder_parent_id: folderToMoveDto.id,
        permission: notOwnedSubFolderReadPerm,
        permissions: [notOwnedSubFolderOwnerPerm, notOwnedSubFolderReadPerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, notOwnedSubFolderDto, destinationFolderDto], []);

      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      // Only the moved folder is fetched. The read-only folder below leaves nothing to reach, so the
      // batched permissions fetch never runs.
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(folderToMoveDto.id);
      expect(service.findFoldersService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
      const folderChanges = service.shareFolderService.saveFoldersPermissionsChanges.mock.calls[0][0];
      expect(folderChanges.items.every((change) => change.acoForeignKey !== notOwnedSubFolderDto.id)).toBe(true);
    });

    it("retains the folder's own direct grant and cascades it, while stripping a permission inherited from the old parent", async () => {
      expect.assertions(3);

      const bobId = uuidv4();
      const carolId = uuidv4();
      const destinationFolderId = uuidv4();

      // Old parent P of the moved folder (Ada owns, Bob can update).
      const oldParentId = uuidv4();
      const oldParentDto = defaultFolderDto({
        id: oldParentId,
        folder_parent_id: null,
        permission: ownerFolderPermissionDto({ aco_foreign_key: oldParentId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: oldParentId, aro_foreign_key: account.id }),
          updateFolderPermissionDto({ aco_foreign_key: oldParentId, aro_foreign_key: bobId }),
        ],
      });
      // Moved folder F (child of P): adds Carol as a direct reader on top of P's Ada + Bob.
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: oldParentId,
        permission: ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: bobId }),
          readFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: carolId }),
        ],
      });
      // Resource R nested directly in F: Carol:R is inherited from F, not a direct grant on R.
      const resourceId = uuidv4();
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: folderToMoveId,
        permission: ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
        permissions: [
          ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
          updatePermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: bobId }),
          readPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: carolId }),
        ],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [oldParentDto, folderToMoveDto, destinationFolderDto], [resourceDto]);

      // The folder ends up with the operator as owner, plus its own Carol:R grant. Carol is kept
      // because she is not on the old parent P. Bob came from P, so he is dropped.
      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: carolId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveId, folderTargetPermissions]]);

      await service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      const resourceChanges = service.shareResourceService.shareAll.mock.calls[0][1];
      // R keeps Carol, the folder kept her too and passes her down.
      expect(resourceChanges.items.find((change) => change.aroForeignKey === carolId)).toBeUndefined();
      // R got Bob:U from F, which got him from the old parent P. Bob is gone from the folder, so he
      // is removed from R too.
      expect(resourceChanges.items.find((change) => change.aroForeignKey === bobId)?.scenario).toBe("delete");
      // F gets exactly what was confirmed: Carol stays, Bob goes.
      const folderChanges = service.shareFolderService.saveFoldersPermissionsChanges.mock.calls[0][0];
      expect(folderChanges.items.find((change) => change.aroForeignKey === carolId)).toBeUndefined();
    });

    it("does not cascade a permission the moved folder only retained from the root onto a descendant that never held it", async () => {
      expect.assertions(2);

      const bettyId = uuidv4();
      const dameId = uuidv4();
      const destinationFolderId = uuidv4();

      // Folder B moves from the root, shared with Betty. Nothing sits above B, so Betty's grant on B
      // is kept. But keeping it is not a change, so it must not reach anything below B.
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: bettyId }),
        ],
      });
      // Resource R1 in B: Ada only, Betty never had anything on it.
      const resourceId = uuidv4();
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: folderToMoveId,
        permission: ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
        permissions: [ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id })],
      });
      // Destination folder D, shared with Dame.
      const destinationFolderDto = defaultFolderDto({
        id: destinationFolderId,
        permission: ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          updateFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: dameId }),
        ],
      });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], [resourceDto]);

      // The operator confirms what was proposed. Betty is kept as she was, Dame is added.
      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: bettyId }),
          updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: dameId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveId, folderTargetPermissions]]);

      await service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      const resourceChanges = service.shareResourceService.shareAll.mock.calls[0][1];
      // R1 gains Dame from the destination...
      expect(resourceChanges.items.find((change) => change.aroForeignKey === dameId)?.scenario).toBe("create");
      // ...but never gains Betty. Her grant on B was only kept, so there is nothing to copy down.
      expect(resourceChanges.items.find((change) => change.aroForeignKey === bettyId)).toBeUndefined();
    });

    it("removes a recipient from the folder and keeps a grant made on the resource itself", async () => {
      expect.assertions(3);

      const bobId = uuidv4();
      const carolId = uuidv4();
      const destinationFolderId = uuidv4();
      // Folder F from the root with Bob as a direct owner the operator removes in the dialog.
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: bobId }),
        ],
      });
      // Resource R in F. Bob came from F, while Carol was granted on R itself and is absent from F.
      const resourceId = uuidv4();
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: folderToMoveId,
        permission: ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
        permissions: [
          ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
          ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: bobId }),
          readPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: carolId }),
        ],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], [resourceDto]);

      // The operator removed Bob, so the folder ends up with the operator alone.
      const folderTargetPermissions = new PermissionsCollection(
        [ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id })],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveId, folderTargetPermissions]]);

      await service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      // Bob is removed from the moved folder.
      const folderChanges = service.shareFolderService.saveFoldersPermissionsChanges.mock.calls[0][0];
      expect(folderChanges.items.find((change) => change.aroForeignKey === bobId)?.scenario).toBe("delete");
      const resourceChanges = service.shareResourceService.shareAll.mock.calls[0][1];
      // Bob is removed from the resource below too, he only ever had it through F.
      expect(resourceChanges.items.find((change) => change.aroForeignKey === bobId)?.scenario).toBe("delete");
      // Carol was granted on R itself and is absent from F, so she is left alone.
      expect(resourceChanges.items.find((change) => change.aroForeignKey === carolId)).toBeUndefined();
    });

    it("leaves a resource untouched when its parent folder sits beneath a not-owned branch, even though the resource itself is owned", async () => {
      expect.assertions(3);

      const bobId = uuidv4();
      const carolId = uuidv4();
      const destinationFolderId = uuidv4();

      // Folder F moves from the root. The operator and Bob own it, and the operator drops Bob.
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: bobId }),
        ],
      });
      // Sub-folder S, a child of F the operator does not own. The branch stops at S and never reaches
      // anything below it.
      const subFolderId = uuidv4();
      const subFolderDto = defaultFolderDto({
        id: subFolderId,
        folder_parent_id: folderToMoveId,
        permission: readFolderPermissionDto({ aco_foreign_key: subFolderId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: subFolderId, aro_foreign_key: bobId }),
          readFolderPermissionDto({ aco_foreign_key: subFolderId, aro_foreign_key: account.id }),
        ],
      });
      // Resource R sits under S. The operator owns R, but R must stay untouched: the branch already
      // stopped at S.
      const resourceId = uuidv4();
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: subFolderId,
        permission: ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
        permissions: [
          ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
          ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: bobId }),
          readPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: carolId }),
        ],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, subFolderDto, destinationFolderDto], [resourceDto]);

      // What the operator confirmed for F drops Bob and keeps only themselves.
      const folderTargetPermissions = new PermissionsCollection(
        [ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id })],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveId, folderTargetPermissions]]);

      await service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      // Only the moved folder is fetched. The branch stops at S, so neither S nor R below it is ever
      // considered, and no batched permissions fetch runs.
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(folderToMoveId);
      expect(service.findFoldersService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
      // R is left out entirely, no share call is made for it.
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("leaves a descendant the cascade would strip of its last owner untouched, and still moves the folder", async () => {
      expect.assertions(5);

      const groupId = uuidv4();
      const destinationFolderId = uuidv4();

      // Folder F moves from the root. The operator and G1 own it, and the operator drops G1.
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          ownerGroupPermissionDto({ aco: "Folder", aco_foreign_key: folderToMoveId, aro_foreign_key: groupId }),
        ],
      });
      // Resource R1 in F, owned by G1 alone, which is also where the operator's access comes from.
      // Dropping G1 there would leave nobody on it, so it keeps what it has.
      const skippedResourceId = uuidv4();
      const skippedResourceDto = defaultResourceDto({
        id: skippedResourceId,
        folder_parent_id: folderToMoveId,
        permission: ownerPermissionDto({ aco_foreign_key: skippedResourceId, aro_foreign_key: account.id }),
        permissions: [ownerGroupPermissionDto({ aco_foreign_key: skippedResourceId, aro_foreign_key: groupId })],
      });
      // Resource R2 in F, owned by the operator directly too, so dropping G1 leaves it manageable.
      const alignedResourceId = uuidv4();
      const alignedResourceDto = defaultResourceDto({
        id: alignedResourceId,
        folder_parent_id: folderToMoveId,
        permission: ownerPermissionDto({ aco_foreign_key: alignedResourceId, aro_foreign_key: account.id }),
        permissions: [
          ownerPermissionDto({ aco_foreign_key: alignedResourceId, aro_foreign_key: account.id }),
          ownerGroupPermissionDto({ aco_foreign_key: alignedResourceId, aro_foreign_key: groupId }),
        ],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(
        service,
        [folderToMoveDto, destinationFolderDto],
        [skippedResourceDto, alignedResourceDto],
      );

      // What the operator confirmed for F drops G1 and keeps only themselves.
      const folderTargetPermissions = new PermissionsCollection(
        [ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id })],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveId, folderTargetPermissions]]);

      await service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      // The move is not refused, and everything the cascade can align still is.
      expect(service.moveApiService.moveFolder).toHaveBeenCalled();
      const [sharedResourceIds, resourceChanges] = service.shareResourceService.shareAll.mock.calls[0];
      expect(sharedResourceIds).toEqual([alignedResourceId]);
      const alignedChange = resourceChanges.items.find((change) => change.acoForeignKey === alignedResourceId);
      expect(alignedChange?.aroForeignKey).toEqual(groupId);
      expect(alignedChange?.scenario).toBe("delete");
      // R1 is left alone, no change at all is computed for it.
      expect(resourceChanges.items.find((change) => change.acoForeignKey === skippedResourceId)).toBeUndefined();
    });

    it("moves the folder before re-permissioning, so a failed move leaves no descendant re-permissioned", async () => {
      expect.assertions(3);

      const extraUserId = uuidv4();
      const destinationFolderId = uuidv4();
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id })],
      });
      const resourceId = uuidv4();
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: folderToMoveId,
        permission: ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id }),
        permissions: [ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id })],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], [resourceDto]);
      service.moveApiService.moveFolder.mockRejectedValueOnce(new Error("Move failed"));

      // The operator adds a reader, which would reach the resource below.
      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveId, folderTargetPermissions]]);

      await expect(
        service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase),
      ).rejects.toThrow("Move failed");

      expect(service.moveApiService.moveFolder).toHaveBeenCalledWith(folderToMoveId, destinationFolderId);
      // The move failed first, so nothing below had its permissions changed or its secret re-encrypted.
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("surfaces the error and leaves the folder moved when the re-permission fails", async () => {
      expect.assertions(4);

      const extraUserId = uuidv4();
      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], []);
      service.shareFolderService.saveFoldersPermissionsChanges.mockRejectedValueOnce(new Error("Share failed"));

      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await expect(
        service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase),
      ).rejects.toThrow("Share failed");

      // The move happened before the permissions step, and is not rolled back. The folder ends up
      // moved with its old permissions rather than stuck half way.
      expect(service.moveApiService.moveFolder).toHaveBeenCalledWith(folderToMoveDto.id, destinationFolderId);
      expect(service.shareFolderService.saveFoldersPermissionsChanges).toHaveBeenCalledTimes(1);
      // Local storage is still refreshed so the UI shows the folder's new location.
      expect(service.findAndUpdateFoldersLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
    });

    it("re-permissions the moved folder before its descendants", async () => {
      expect.assertions(3);

      const extraUserId = uuidv4();
      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const subFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const subFolderDto = defaultFolderDto({
        id: subFolderPerm.aco_foreign_key,
        folder_parent_id: folderToMoveDto.id,
        permission: subFolderPerm,
        permissions: [subFolderPerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, subFolderDto, destinationFolderDto], []);

      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      const folderChanges = service.shareFolderService.saveFoldersPermissionsChanges.mock.calls[0][0];
      // Both the moved folder and the one below gain the extra reader, the moved folder first: a
      // failure part way through never leaves the folder below ahead of its parent.
      expect(folderChanges.items).toHaveLength(2);
      expect(folderChanges.items[0].acoForeignKey).toStrictEqual(folderToMoveDto.id);
      expect(folderChanges.items[1].acoForeignKey).toStrictEqual(subFolderDto.id);
    });

    it("moves a folder the operator does not own without changing any permission", async () => {
      expect.assertions(3);

      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: uuidv4() }),
          updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        ],
      });
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], []);

      await service.moveOne(folderToMoveId, destinationFolderId, new Map(), pgpKeys.admin.passphrase);

      expect(service.moveApiService.moveFolder).toHaveBeenCalledWith(folderToMoveId, destinationFolderId);
      expect(service.shareFolderService.saveFoldersPermissionsChanges).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("refuses a confirmed target for a folder the operator does not own, before moving anything", async () => {
      expect.assertions(2);

      // The dialog only offers permissions for an owned folder, so getting some here means the client
      // and the service worker disagree. Refuse rather than apply half of what was confirmed.
      const folderToMoveId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMoveId,
        folder_parent_id: null,
        permission: updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        permissions: [
          ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: uuidv4() }),
          updateFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id }),
        ],
      });
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], []);

      const confirmedPermissions = new Map([
        [
          folderToMoveId,
          new PermissionsCollection(
            [ownerFolderPermissionDto({ aco_foreign_key: folderToMoveId, aro_foreign_key: account.id })],
            { assertAtLeastOneOwner: false },
          ),
        ],
      ]);

      await expect(
        service.moveOne(folderToMoveId, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase),
      ).rejects.toThrow(`Folder ${folderToMoveId} must be owned to apply the confirmed permissions.`);

      expect(service.moveApiService.moveFolder).not.toHaveBeenCalled();
    });
  });

  describe("notifies about its progress", () => {
    let account, progressService, service, worker;

    beforeEach(() => {
      account = new AccountEntity(defaultAccountDto());
      worker = { port: new MockPort() };
      progressService = new ProgressService(worker);
      jest.spyOn(progressService, "finishStep");
      jest.spyOn(progressService, "finishSteps");
      jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);
      service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);
    });

    it("notifies of its progress when there is no permission change", async () => {
      expect.assertions(5);

      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        personal: true,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({
        id: destinationFolderPerm.aco_foreign_key,
        personal: true,
        permission: destinationFolderPerm,
        permissions: [destinationFolderPerm],
      });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], []);

      await service.moveOne(folderToMoveDto.id, destinationFolderDto.id, new Map(), pgpKeys.admin.passphrase);

      expect(progressService.finishStep).toHaveBeenCalledTimes(3);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving folders permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Moving folder", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Updating folders local storage", true);
      expect(progressService._progress).toEqual(PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE);
    });

    it("notifies of its progress when there are resources and folders to share", async () => {
      expect.assertions(8);

      const extraUserId = uuidv4();
      const folderToMovePerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderId = uuidv4();
      const folderToMoveDto = defaultFolderDto({
        id: folderToMovePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: folderToMovePerm,
        permissions: [folderToMovePerm],
      });
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: folderToMoveDto.id,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [folderToMoveDto, destinationFolderDto], [resourceDto]);

      const folderTargetPermissions = new PermissionsCollection(
        [
          ownerFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: account.id }),
          readFolderPermissionDto({ aco_foreign_key: destinationFolderId, aro_foreign_key: extraUserId }),
        ],
        { assertAtLeastOneOwner: false },
      );
      const confirmedPermissions = new Map([[folderToMoveDto.id, folderTargetPermissions]]);

      await service.moveOne(folderToMoveDto.id, destinationFolderId, confirmedPermissions, pgpKeys.admin.passphrase);

      expect(progressService.finishStep).toHaveBeenCalledTimes(6);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving folders permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Calculating folders permissions changes", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Calculating resources permissions changes", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Moving folder", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Updating folders local storage", true);
      expect(progressService._progress).toEqual(
        PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE -
          PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL -
          PROGRESS_STEPS_SHARE_FOLDERS_SHARE_ONE,
      ); // Discount the share operations that are mocked.
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

      const folder = new FolderEntity(defaultFolderDto({ name: "Folder to move" }));
      expect(() => service.assertFolderCanBeMoved(folder, null, null)).toThrow(
        `Folder ${folder.name} is already in the root folder.`,
      );
    });

    it("should throw an error if the destination folder is the current parent folder of the folder being moved", () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const progressService = {};
      const service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      const destinationFolder = new FolderEntity(defaultFolderDto({ name: "Destination folder" }));
      const folder = new FolderEntity(
        defaultFolderDto({
          name: "Folder to move",
          folder_parent_id: destinationFolder.id,
        }),
      );
      expect(() => service.assertFolderCanBeMoved(folder, destinationFolder, destinationFolder)).toThrow(
        `Folder ${folder.name} is already in folder ${destinationFolder.name}.`,
      );
    });

    it("should throw an error if the folder can not be moved", () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const progressService = {};
      const service = new MoveOneFolderService(defaultApiClientOptions(), account, progressService);

      const parentFolder = new FolderEntity(defaultFolderDto());
      const folder = new FolderEntity(defaultFolderDto({ folder_parent_id: parentFolder.id }));
      const destinationFolder = new FolderEntity(defaultFolderDto());

      jest.spyOn(FolderEntity, "canFolderMove").mockImplementation(() => false);

      expect(() => service.assertFolderCanBeMoved(folder, destinationFolder, parentFolder)).toThrow(
        `Folder ${folder.name} can not be moved.`,
      );
    });
  });
});
