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
import AccountEntity from "../../model/entity/account/accountEntity";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import MoveResourcesService, { PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL } from "./moveResourcesService";
import { PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL } from "../share/shareResourceService";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import { buildOwnedResourceDto, buildTarget } from "./moveResourcesService.test.data";
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import { v4 as uuidv4 } from "uuid";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FolderEntity from "../../model/entity/folder/folderEntity";
import {
  ownerFolderPermissionDto,
  ownerGroupPermissionDto,
  ownerPermissionDto,
  readFolderPermissionDto,
  readPermissionDto,
  updatePermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import ProgressService from "../progress/progressService";

/**
 * Wire the services `moveAll` depends on, seeding local storage and mocking the share, move and
 * storage calls.
 * @param {MoveResourcesService} service
 * @param {Array<object>} foldersDto
 * @param {Array<object>} resourcesDto
 * @returns {Promise<void>}
 */
async function mockServiceDependencies(service, foldersDto, resourcesDto) {
  await FolderLocalStorage.set(new FoldersCollection(foldersDto));
  await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
  jest
    .spyOn(service.findFoldersService, "findByIdWithPermissions")
    .mockImplementation((id) => new FolderEntity(foldersDto.find((folderDto) => folderDto.id === id)));
  jest
    .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
    .mockImplementation((ids) => new FoldersCollection(foldersDto.filter((folderDto) => ids.includes(folderDto.id))));
  jest
    .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
    .mockImplementation(
      (ids) => new ResourcesCollection(resourcesDto.filter((resourceDto) => ids.includes(resourceDto.id))),
    );
  jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
  jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);
  jest.spyOn(service.resourceUpdateLocalStorageService, "updateFolderParentId").mockImplementation(jest.fn);
}

describe("MoveResourcesService", () => {
  let account, progressService, service, worker;

  beforeEach(() => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    worker = { port: new MockPort() };
    progressService = new ProgressService(worker);
    jest.spyOn(progressService, "finishStep");
    jest.spyOn(progressService, "finishSteps");
    jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);
    service = new MoveResourcesService(defaultApiClientOptions(), account, progressService);
  });

  describe("should assert data", () => {
    it("should assert that the resourceIds are not empty", async () => {
      expect.assertions(1);
      await expect(() => service.moveAll([], "")).rejects.toThrow(
        "Could not move, expecting at least a resource to be provided.",
      );
    });

    it("should assert that the resourceIds is all Uuids", async () => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4(), 42], "")).rejects.toThrow(
        "Could not move, expecting resourcesIds to be an array of UUIDs.",
      );
    });

    it("should assert that the destinationFolderId is a valid UUID", async () => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4()], "42")).rejects.toThrow(
        "Could not move, expecting destinationFolderId to be a valid UUID.",
      );
    });

    it("should assert that the confirmedPermissions is a Map", async () => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4()], uuidv4(), 42)).rejects.toThrow(
        'The parameter "confirmedPermissions" should be a Map keyed by resource id.',
      );
    });

    it("should assert that the passphrase is a valid string", async () => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4()], uuidv4(), new Map(), 42)).rejects.toThrow(
        "The given parameter is not a valid string",
      );
    });

    it("should assert that the destination folder ID is existing", async () => {
      expect.assertions(3);

      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(() => null);

      const destinationFolderId = uuidv4();
      await expect(() => service.moveAll([uuidv4()], destinationFolderId, new Map())).rejects.toThrow(
        `Could not move, the destination folder does not exist.`,
      );

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderId);
    });

    it("should assert that all the resources ids exist", async () => {
      expect.assertions(3);

      const resourceIds = [uuidv4(), uuidv4()];

      jest
        .spyOn(service.findFoldersService, "findByIdWithPermissions")
        .mockImplementation(() => new FolderEntity(defaultFolderDto()));
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection([defaultResourceDto({ id: resourceIds[0].id })]));

      await expect(() => service.moveAll(resourceIds, uuidv4(), new Map())).rejects.toThrow(
        `Could not move, some resources do not exist.`,
      );
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith(resourceIds);
    });
  });

  describe("should move the resources according to the operator-confirmed permissions", () => {
    it("moves the resources without changing permissions when no permission was confirmed", async () => {
      expect.assertions(2);

      const parentFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderPerm.aco_foreign_key,
        permission: parentFolderPerm,
        permissions: [parentFolderPerm],
      });
      const destinationFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationFolderPerm.aco_foreign_key,
        permission: destinationFolderPerm,
        permissions: [destinationFolderPerm],
      });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: parentFolderDto.id,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [parentFolderDto, destinationFolderDto], [resourceDto]);

      await service.moveAll([resourceDto.id], destinationFolderDto.id, new Map(), "");

      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resourceDto.id, destinationFolderDto.id);
    });

    it("applies the operator-confirmed permissions to the owned resources, then moves them", async () => {
      expect.assertions(4);

      const extraUserId = uuidv4();
      const parentFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderPerm.aco_foreign_key,
        permission: parentFolderPerm,
        permissions: [parentFolderPerm],
      });
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: parentFolderDto.id,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [parentFolderDto, destinationFolderDto], [resourceDto]);

      const confirmedPermissions = new Map([
        [resourceDto.id, buildTarget(account.id, resourceDto.id, [{ id: extraUserId }])],
      ]);

      await service.moveAll([resourceDto.id], destinationFolderId, confirmedPermissions, "");

      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resourceDto.id, destinationFolderId);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const [sharedResourceIds, changes] = service.shareResourceService.shareAll.mock.calls[0];
      expect(sharedResourceIds).toStrictEqual([resourceDto.id]);
      // The operator's ownership is unchanged; only the extra reader is added.
      expect(changes.items.some((change) => change.aroForeignKey === extraUserId)).toBe(true);
    });

    it("re-permissions a resource owned only through group membership", async () => {
      expect.assertions(2);

      const extraUserId = uuidv4();
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      // The operator is owner through a group rather than directly. isOwner() reads the resolved
      // permission whatever it comes from, so this still counts as owned.
      const resourcePerm = ownerGroupPermissionDto();
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      const confirmedPermissions = new Map([
        [resourceDto.id, buildTarget(account.id, resourceDto.id, [{ id: extraUserId }])],
      ]);

      await service.moveAll([resourceDto.id], destinationFolderId, confirmedPermissions, "");

      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      expect(changes.items.some((change) => change.aroForeignKey === extraUserId)).toBe(true);
    });

    it("lowers a recipient when the operator lowered their permission", async () => {
      expect.assertions(2);

      const adaId = uuidv4();
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourceId = uuidv4();
      const operatorPerm = ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id });
      const adaPerm = ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: adaId });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: null,
        permission: operatorPerm,
        permissions: [operatorPerm, adaPerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      // The operator lowered Ada from owner to update in the dialog, and that must take effect.
      const confirmedPermissions = new Map([
        [resourceId, buildTarget(account.id, resourceId, [{ id: adaId, dto: updatePermissionDto }])],
      ]);

      await service.moveAll([resourceId], destinationFolderId, confirmedPermissions, "");

      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      const adaChange = changes.items.find((change) => change.aroForeignKey === adaId);
      expect(adaChange.scenario).toBe("update");
      expect(adaChange.type).toBe(7);
    });

    it("removes a recipient when the operator dropped them", async () => {
      expect.assertions(2);

      const adaId = uuidv4();
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourceId = uuidv4();
      const operatorPerm = ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id });
      const adaPerm = ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: adaId });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: null,
        permission: operatorPerm,
        permissions: [operatorPerm, adaPerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      // The operator removed Ada in the dialog, so she must be removed. Nothing keeps her.
      const confirmedPermissions = new Map([[resourceId, buildTarget(account.id, resourceId)]]);

      await service.moveAll([resourceId], destinationFolderId, confirmedPermissions, "");

      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      expect(changes.items.find((change) => change.aroForeignKey === adaId).scenario).toBe("delete");
      expect(changes.items.length).toBe(1);
    });

    it("keeps each resource's target distinct: a recipient on one resource is not spread to another", async () => {
      expect.assertions(2);

      const carolId = uuidv4();
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourceADto = defaultResourceDto({
        id: uuidv4(),
        folder_parent_id: null,
        permission: ownerPermissionDto({ aro_foreign_key: account.id }),
        permissions: [ownerPermissionDto({ aro_foreign_key: account.id })],
      });
      const resourceBDto = defaultResourceDto({
        id: uuidv4(),
        folder_parent_id: null,
        permission: ownerPermissionDto({ aro_foreign_key: account.id }),
        permissions: [ownerPermissionDto({ aro_foreign_key: account.id })],
      });
      // Bind the operator permission to each resource id so isOwner() resolves correctly.
      resourceADto.permission = ownerPermissionDto({ aco_foreign_key: resourceADto.id, aro_foreign_key: account.id });
      resourceADto.permissions = [resourceADto.permission];
      resourceBDto.permission = ownerPermissionDto({ aco_foreign_key: resourceBDto.id, aro_foreign_key: account.id });
      resourceBDto.permissions = [resourceBDto.permission];
      await mockServiceDependencies(service, [destinationFolderDto], [resourceADto, resourceBDto]);

      // Carol is in resource A's target only.
      const confirmedPermissions = new Map([
        [resourceADto.id, buildTarget(account.id, resourceADto.id, [{ id: carolId }])],
        [resourceBDto.id, buildTarget(account.id, resourceBDto.id)],
      ]);

      await service.moveAll([resourceADto.id, resourceBDto.id], destinationFolderId, confirmedPermissions, "");

      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      const carolChanges = changes.items.filter((change) => change.aroForeignKey === carolId);
      expect(carolChanges.length).toBe(1);
      expect(carolChanges[0].acoForeignKey).toBe(resourceADto.id);
    });

    it("moves but does not re-permission the resources the operator does not own", async () => {
      expect.assertions(2);

      const extraUserId = uuidv4();
      const parentFolderOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: uuidv4() });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderOwnerPerm.aco_foreign_key,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: parentFolderOwnerPerm.aco_foreign_key,
          aro_foreign_key: uuidv4(),
        }),
        permissions: [parentFolderOwnerPerm],
      });
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      // The operator only has update on this resource, owned by someone else. Its permissions must not change.
      const resourceId = uuidv4();
      const resourceOwnerPerm = ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: uuidv4() });
      const resourceUpdatePerm = updatePermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: parentFolderDto.id,
        permission: resourceUpdatePerm,
        permissions: [resourceOwnerPerm, resourceUpdatePerm],
      });
      await mockServiceDependencies(service, [parentFolderDto, destinationFolderDto], [resourceDto]);

      const confirmedPermissions = new Map([
        [resourceDto.id, buildTarget(account.id, resourceDto.id, [{ id: extraUserId }])],
      ]);

      await service.moveAll([resourceDto.id], destinationFolderId, confirmedPermissions, "");

      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resourceDto.id, destinationFolderId);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves a mixed-ownership batch but re-permissions only the resources the operator owns", async () => {
      expect.assertions(5);

      const extraUserId = uuidv4();
      const parentFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderPerm.aco_foreign_key,
        permission: parentFolderPerm,
        permissions: [parentFolderPerm],
      });
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });

      // The operator owns this resource, so its permissions change.
      const ownedId = uuidv4();
      const ownedPerm = ownerPermissionDto({ aco_foreign_key: ownedId, aro_foreign_key: account.id });
      const ownedResourceDto = defaultResourceDto({
        id: ownedId,
        folder_parent_id: parentFolderDto.id,
        permission: ownedPerm,
        permissions: [ownedPerm],
      });
      // The operator only has update on this one, owned by someone else. Its permissions must not change.
      const notOwnedId = uuidv4();
      const notOwnedOwnerPerm = ownerPermissionDto({ aco_foreign_key: notOwnedId, aro_foreign_key: uuidv4() });
      const notOwnedUpdatePerm = updatePermissionDto({ aco_foreign_key: notOwnedId, aro_foreign_key: account.id });
      const notOwnedResourceDto = defaultResourceDto({
        id: notOwnedId,
        folder_parent_id: parentFolderDto.id,
        permission: notOwnedUpdatePerm,
        permissions: [notOwnedOwnerPerm, notOwnedUpdatePerm],
      });
      await mockServiceDependencies(
        service,
        [parentFolderDto, destinationFolderDto],
        [ownedResourceDto, notOwnedResourceDto],
      );

      const confirmedPermissions = new Map([
        [ownedId, buildTarget(account.id, ownedId, [{ id: extraUserId }])],
        [notOwnedId, buildTarget(account.id, notOwnedId, [{ id: extraUserId }])],
      ]);

      await service.moveAll([ownedId, notOwnedId], destinationFolderId, confirmedPermissions, "");

      // Both resources are physically moved.
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(ownedId, destinationFolderId);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(notOwnedId, destinationFolderId);
      // But the permission changes target the owned resource only.
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      expect(changes.items.some((change) => change.acoForeignKey === ownedId)).toBe(true);
      expect(changes.items.some((change) => change.acoForeignKey === notOwnedId)).toBe(false);
    });

    it("batches the changes of several owned resources into a single share call", async () => {
      expect.assertions(3);

      const extraUserId = uuidv4();
      const parentFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderPerm.aco_foreign_key,
        permission: parentFolderPerm,
        permissions: [parentFolderPerm],
      });
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });

      const resourceDtos = [uuidv4(), uuidv4()].map((id) => {
        const perm = ownerPermissionDto({ aco_foreign_key: id, aro_foreign_key: account.id });
        return defaultResourceDto({
          id,
          folder_parent_id: parentFolderDto.id,
          permission: perm,
          permissions: [perm],
        });
      });
      await mockServiceDependencies(service, [parentFolderDto, destinationFolderDto], resourceDtos);

      const confirmedPermissions = new Map(
        resourceDtos.map((resourceDto) => [
          resourceDto.id,
          buildTarget(account.id, resourceDto.id, [{ id: extraUserId }]),
        ]),
      );

      await service.moveAll(
        resourceDtos.map((resourceDto) => resourceDto.id),
        destinationFolderId,
        confirmedPermissions,
        "",
      );

      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const [sharedResourceIds] = service.shareResourceService.shareAll.mock.calls[0];
      expect(sharedResourceIds).toStrictEqual(resourceDtos.map((resourceDto) => resourceDto.id));
    });

    it("returns the ids of the resources that could not be moved", async () => {
      expect.assertions(3);

      const destinationOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationOwnerPerm.aco_foreign_key,
        personal: false,
        permission: destinationOwnerPerm,
        permissions: [
          destinationOwnerPerm,
          readFolderPermissionDto({
            aco_foreign_key: destinationOwnerPerm.aco_foreign_key,
            aro_foreign_key: uuidv4(),
          }),
        ],
      });
      // The operator only has read on this resource, owned by someone else. It cannot move into a shared folder.
      const resourceId = uuidv4();
      const resourceOwnerPerm = ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: uuidv4() });
      const resourceReadPerm = readPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: null,
        permission: resourceReadPerm,
        permissions: [resourceOwnerPerm, resourceReadPerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      const result = await service.moveAll([resourceId], destinationFolderDto.id, new Map(), "");

      expect(result.skippedResourceIds).toStrictEqual([resourceId]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("flushes the resources that already moved to local storage when a later move fails mid-batch", async () => {
      expect.assertions(3);

      const destinationOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationOwnerPerm.aco_foreign_key,
        permission: destinationOwnerPerm,
        permissions: [destinationOwnerPerm],
      });
      const resourceADto = buildOwnedResourceDto(account.id);
      const resourceBDto = buildOwnedResourceDto(account.id);
      await mockServiceDependencies(service, [destinationFolderDto], [resourceADto, resourceBDto]);

      service.moveApiService.moveResource
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Move failed"));

      await expect(
        service.moveAll([resourceADto.id, resourceBDto.id], destinationFolderDto.id, new Map(), ""),
      ).rejects.toThrow("Move failed");

      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      // Only the resource that did move is refreshed in local storage, not the whole batch.
      expect(service.resourceUpdateLocalStorageService.updateFolderParentId).toHaveBeenCalledWith(
        [resourceADto.id],
        destinationFolderDto.id,
      );
    });

    it("surfaces the error and leaves the resource moved (and flushed) when the re-permission fails", async () => {
      expect.assertions(3);

      const extraUserId = uuidv4();
      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);
      service.shareResourceService.shareAll.mockRejectedValueOnce(new Error("Share failed"));

      const confirmedPermissions = new Map([
        [resourceDto.id, buildTarget(account.id, resourceDto.id, [{ id: extraUserId }])],
      ]);

      await expect(service.moveAll([resourceDto.id], destinationFolderId, confirmedPermissions, "")).rejects.toThrow(
        "Share failed",
      );

      // The move runs and is saved before the share fails, so the resource ends up moved with its old
      // permissions.
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resourceDto.id, destinationFolderId);
      expect(service.resourceUpdateLocalStorageService.updateFolderParentId).toHaveBeenCalledWith(
        [resourceDto.id],
        destinationFolderId,
      );
    });

    it("moves an owned resource to the root, applying the confirmed target", async () => {
      expect.assertions(3);

      const parentFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderPerm.aco_foreign_key,
        permission: parentFolderPerm,
        permissions: [parentFolderPerm],
      });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const otherUserId = uuidv4();
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: parentFolderDto.id,
        permission: resourcePerm,
        permissions: [
          resourcePerm,
          readPermissionDto({ aco_foreign_key: resourcePerm.aco_foreign_key, aro_foreign_key: otherUserId }),
        ],
      });
      await mockServiceDependencies(service, [parentFolderDto], [resourceDto]);

      // Moving to the root drops whoever came from the old folder, leaving the operator alone.
      const confirmedPermissions = new Map([[resourceDto.id, buildTarget(account.id, resourceDto.id)]]);

      await service.moveAll([resourceDto.id], null, confirmedPermissions, "");

      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resourceDto.id, null);
      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      const otherUserChange = changes.items.find((change) => change.aroForeignKey === otherUserId);
      expect(otherUserChange).toBeDefined();
      expect(otherUserChange.scenario).toBe("delete");
    });

    it("re-permissions an owned resource ordered after a not-owned one in a batch move to the root", async () => {
      expect.assertions(2);

      // PB-50166: a resource the operator does not own must not stop the ones after it from being
      // handled. The order of the selection is not a permission rule.
      const parentFolderPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const parentFolderDto = defaultFolderDto({
        id: parentFolderPerm.aco_foreign_key,
        permission: parentFolderPerm,
        permissions: [parentFolderPerm],
      });
      const notOwnedId = uuidv4();
      const notOwnedDto = defaultResourceDto({
        id: notOwnedId,
        folder_parent_id: parentFolderDto.id,
        permission: updatePermissionDto({ aco_foreign_key: notOwnedId, aro_foreign_key: account.id }),
        permissions: [
          ownerPermissionDto({ aco_foreign_key: notOwnedId, aro_foreign_key: uuidv4() }),
          updatePermissionDto({ aco_foreign_key: notOwnedId, aro_foreign_key: account.id }),
        ],
      });
      const ownedPerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const droppedUserId = uuidv4();
      const ownedDto = defaultResourceDto({
        id: ownedPerm.aco_foreign_key,
        folder_parent_id: parentFolderDto.id,
        permission: ownedPerm,
        permissions: [
          ownedPerm,
          readPermissionDto({ aco_foreign_key: ownedPerm.aco_foreign_key, aro_foreign_key: droppedUserId }),
        ],
      });
      await mockServiceDependencies(service, [parentFolderDto], [notOwnedDto, ownedDto]);

      const confirmedPermissions = new Map([[ownedDto.id, buildTarget(account.id, ownedDto.id)]]);

      await service.moveAll([notOwnedId, ownedDto.id], null, confirmedPermissions, "");

      const [, changes] = service.shareResourceService.shareAll.mock.calls[0];
      // The owned resource still has its permissions changed, even though a not-owned one came first.
      expect(changes.items.some((change) => change.aroForeignKey === droppedUserId)).toBe(true);
      // The not-owned resource is untouched.
      expect(changes.items.every((change) => change.acoForeignKey !== notOwnedId)).toBe(true);
    });

    it("skips a resource already in the destination folder, sharing only the ones that moved", async () => {
      expect.assertions(4);

      const destinationOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationOwnerPerm.aco_foreign_key,
        permission: destinationOwnerPerm,
        permissions: [destinationOwnerPerm],
      });
      // Already in the destination, so it is skipped silently rather than raising an error.
      const alreadyThereDto = buildOwnedResourceDto(account.id, destinationFolderDto.id);
      const movingDto = buildOwnedResourceDto(account.id);
      await mockServiceDependencies(service, [destinationFolderDto], [alreadyThereDto, movingDto]);

      const confirmedPermissions = new Map([
        [alreadyThereDto.id, buildTarget(account.id, alreadyThereDto.id, [{ id: uuidv4() }])],
        [movingDto.id, buildTarget(account.id, movingDto.id, [{ id: uuidv4() }])],
      ]);

      await service.moveAll([alreadyThereDto.id, movingDto.id], destinationFolderDto.id, confirmedPermissions, "");

      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(1);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(movingDto.id, destinationFolderDto.id);
      // The share call must not reference a resource that was filtered out of the move.
      const [sharedResourceIds, changes] = service.shareResourceService.shareAll.mock.calls[0];
      expect(sharedResourceIds).toStrictEqual([movingDto.id]);
      /*
       * Moving an item into the folder it is already in does nothing, so its permissions are left
       * untouched. What the operator confirmed for it is not applied.
       */
      expect(changes.items.every((change) => change.acoForeignKey !== alreadyThereDto.id)).toBe(true);
    });

    it("moves and shares nothing when every resource is already in the destination folder", async () => {
      expect.assertions(3);

      const destinationOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationOwnerPerm.aco_foreign_key,
        permission: destinationOwnerPerm,
        permissions: [destinationOwnerPerm],
      });
      const ownedPerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const alreadyThereDto = defaultResourceDto({
        id: ownedPerm.aco_foreign_key,
        folder_parent_id: destinationFolderDto.id,
        permission: ownedPerm,
        permissions: [ownedPerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [alreadyThereDto]);

      const confirmedPermissions = new Map([
        [alreadyThereDto.id, buildTarget(account.id, alreadyThereDto.id, [{ id: uuidv4() }])],
      ]);

      const result = await service.moveAll([alreadyThereDto.id], destinationFolderDto.id, confirmedPermissions, "");

      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      // No change was calculated, so nothing is shared and shareAll is never called with an empty list.
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
      // Skipping an item already in its destination is not a failure, so it is not reported.
      expect(result.skippedResourceIds).toStrictEqual([]);
    });
  });

  describe("notifies about its progress", () => {
    it("consumes its whole step budget when nothing can move", async () => {
      expect.assertions(2);

      const destinationOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationOwnerPerm.aco_foreign_key,
        personal: false,
        permission: destinationOwnerPerm,
        permissions: [
          destinationOwnerPerm,
          readFolderPermissionDto({
            aco_foreign_key: destinationOwnerPerm.aco_foreign_key,
            aro_foreign_key: uuidv4(),
          }),
        ],
      });
      const resourceId = uuidv4();
      const resourceReadPerm = readPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        folder_parent_id: null,
        permission: resourceReadPerm,
        permissions: [ownerPermissionDto({ aco_foreign_key: resourceId, aro_foreign_key: uuidv4() }), resourceReadPerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      await service.moveAll([resourceId], destinationFolderDto.id, new Map(), "");

      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(progressService._progress).toBe(PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL);
    });

    it("consumes its whole step budget when the resources move without a share", async () => {
      expect.assertions(2);

      const destinationOwnerPerm = ownerFolderPermissionDto({ aro_foreign_key: account.id });
      const destinationFolderDto = defaultFolderDto({
        id: destinationOwnerPerm.aco_foreign_key,
        permission: destinationOwnerPerm,
        permissions: [destinationOwnerPerm],
      });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      await service.moveAll([resourceDto.id], destinationFolderDto.id, new Map(), "");

      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
      expect(progressService._progress).toBe(PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL);
    });

    it("leaves the share steps to the share service when the resources move and are shared", async () => {
      expect.assertions(2);

      const destinationFolderId = uuidv4();
      const destinationFolderDto = defaultFolderDto({ id: destinationFolderId });
      const resourcePerm = ownerPermissionDto({ aro_foreign_key: account.id });
      const resourceDto = defaultResourceDto({
        id: resourcePerm.aco_foreign_key,
        folder_parent_id: null,
        permission: resourcePerm,
        permissions: [resourcePerm],
      });
      await mockServiceDependencies(service, [destinationFolderDto], [resourceDto]);

      const confirmedPermissions = new Map([
        [
          resourceDto.id,
          new PermissionsCollection(
            [
              ownerPermissionDto({ aco_foreign_key: resourceDto.id, aro_foreign_key: account.id }),
              readPermissionDto({ aco_foreign_key: resourceDto.id, aro_foreign_key: uuidv4() }),
            ],
            { assertAtLeastOneOwner: false },
          ),
        ],
      ]);

      await service.moveAll([resourceDto.id], destinationFolderId, confirmedPermissions, "");

      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      // The share service owns its own steps, so the service itself finishes the rest of the budget.
      expect(progressService._progress).toBe(
        PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL - PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL,
      );
    });
  });
});
