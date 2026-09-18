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
 * @since         5.13.0
 */
import CalculatePermissionsChangesService from "./calculatePermissionsChangesService";
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import {
  ownerFolderPermissionDto,
  ownerPermissionDto,
  readFolderPermissionDto,
  readPermissionDto,
  updateFolderPermissionDto,
  updatePermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import { v4 as uuidv4 } from "uuid";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import {
  defaultPermissionChangeDto,
  deletePermissionChangeDto,
  minimumPermissionChangeDto,
} from "../../model/entity/permission/change/permissionChangeEntity.test.data";
import { buildFolder, buildResource } from "./calculatePermissionsChangesService.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CalculatePermissionsChangesService", () => {
  const owner = uuidv4();
  const extra = uuidv4();

  /*
   * Copying a folder's change onto what it contains: only the change, never its whole access list,
   * so a permission the folder merely kept does not reach an item that never had it.
   */
  describe("::forFolderWithCascadedChange / ::forResourceWithCascadedChange", () => {
    const folderId = uuidv4();

    it("adds to the item a user who was added on the folder", () => {
      expect.assertions(3);
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: owner })]);
      const folderChanges = new PermissionChangesCollection([
        minimumPermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_READ,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forResourceWithCascadedChange(resource, folderChanges);

      expect(changes.length).toBe(1);
      expect(changes.items[0].aroForeignKey).toBe(extra);
      expect(changes.items[0].acoForeignKey).toBe(resource.id);
    });

    it("changes nothing on the item when nothing changed on the folder", () => {
      expect.assertions(1);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        updateFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const folderChanges = new PermissionChangesCollection([]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(0);
    });

    it("removes from the item a user who was removed from the folder", () => {
      expect.assertions(3);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        updateFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const folderChanges = new PermissionChangesCollection([
        deletePermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.items.find((change) => change.aroForeignKey === extra)?.scenario).toBe("delete");
      // The delete carries the item's own permission id, not the folder's.
      expect(changes.items[0].id).toBe(folder.permissions.items[1].id);
      expect(changes.length).toBe(1);
    });

    it("ignores the removal of a user the item never had", () => {
      expect.assertions(1);
      const folder = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const folderChanges = new PermissionChangesCollection([
        deletePermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(0);
    });

    it("removes the user from the item even when the item gave them more than the folder did", () => {
      expect.assertions(2);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        ownerFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const folderChanges = new PermissionChangesCollection([
        deletePermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(1);
      expect(changes.items.find((change) => change.aroForeignKey === extra)?.scenario).toBe("delete");
    });

    it("raises a user the item already had to the higher level the folder now gives them", () => {
      expect.assertions(2);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        readFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const folderChanges = new PermissionChangesCollection([
        minimumPermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(1);
      expect(changes.items[0].type).toBe(PermissionEntity.PERMISSION_UPDATE);
    });

    it("lowers a user the item already had to the lower level the folder now gives them", () => {
      expect.assertions(3);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        ownerFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const folderChanges = new PermissionChangesCollection([
        defaultPermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(1);
      expect(changes.items[0].type).toBe(PermissionEntity.PERMISSION_UPDATE);
      // The update carries the item's own permission id, not the folder's.
      expect(changes.items[0].id).toBe(folder.permissions.items[1].id);
    });

    it("changes nothing when the item already gives the user the level the folder now gives them", () => {
      expect.assertions(1);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        updateFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const folderChanges = new PermissionChangesCollection([
        minimumPermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(0);
    });

    it("does not add a user to the item when the folder only changed their level", () => {
      expect.assertions(1);
      const folder = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const folderChanges = new PermissionChangesCollection([
        defaultPermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: extra,
          type: PermissionEntity.PERMISSION_UPDATE,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forFolderWithCascadedChange(folder, folderChanges);

      expect(changes.length).toBe(0);
    });

    it("leaves the item alone rather than removing its last permission", () => {
      expect.assertions(1);
      const group = uuidv4();
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: group })]);
      const folderChanges = new PermissionChangesCollection([
        deletePermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: group,
          type: PermissionEntity.PERMISSION_OWNER,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forResourceWithCascadedChange(resource, folderChanges);

      expect(changes.length).toBe(0);
    });

    it("leaves the item alone rather than leaving it without an owner", () => {
      expect.assertions(1);
      const group = uuidv4();
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: group })]);
      const folderChanges = new PermissionChangesCollection([
        defaultPermissionChangeDto({
          aco: PermissionEntity.ACO_FOLDER,
          aco_foreign_key: folderId,
          aro_foreign_key: group,
          type: PermissionEntity.PERMISSION_READ,
        }),
      ]);

      const changes = CalculatePermissionsChangesService.forResourceWithCascadedChange(resource, folderChanges);

      expect(changes.length).toBe(0);
    });
  });

  /*
   * Applying what the operator confirmed: the complete access list the item must end up with, so
   * lowering or removing a permission takes effect.
   */
  describe("::forResourceWithTargetPermissions / ::forFolderWithTargetPermissions", () => {
    const operator = uuidv4();
    const ada = uuidv4();

    it("emits an update change when the confirmed permissions lower a user", () => {
      expect.assertions(2);
      const resource = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        ownerPermissionDto({ aro_foreign_key: ada }),
      ]);
      const target = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        updatePermissionDto({ aro_foreign_key: ada }),
      ]).permissions;

      const changes = CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, target);
      const adaChange = changes.items.find((change) => change.aroForeignKey === ada);

      expect(adaChange.scenario).toBe("update");
      expect(adaChange.type).toBe(PermissionEntity.PERMISSION_UPDATE);
    });

    it("emits a delete change when the confirmed permissions drop a user", () => {
      expect.assertions(2);
      const resource = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        ownerPermissionDto({ aro_foreign_key: ada }),
      ]);
      const target = buildResource([ownerPermissionDto({ aro_foreign_key: operator })]).permissions;

      const changes = CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, target);

      expect(changes.length).toBe(1);
      expect(changes.items.find((change) => change.aroForeignKey === ada).scenario).toBe("delete");
    });

    it("emits an update change when the confirmed permissions raise a user", () => {
      expect.assertions(2);
      const resource = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        readPermissionDto({ aro_foreign_key: ada }),
      ]);
      const target = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        ownerPermissionDto({ aro_foreign_key: ada }),
      ]).permissions;

      const changes = CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, target);
      const adaChange = changes.items.find((change) => change.aroForeignKey === ada);

      expect(adaChange.scenario).toBe("update");
      expect(adaChange.type).toBe(PermissionEntity.PERMISSION_OWNER);
    });

    it("emits no change when the confirmed permissions match what the resource already has", () => {
      expect.assertions(1);
      const resource = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        ownerPermissionDto({ aro_foreign_key: ada }),
      ]);
      const target = buildResource([
        ownerPermissionDto({ aro_foreign_key: operator }),
        ownerPermissionDto({ aro_foreign_key: ada }),
      ]).permissions;

      const changes = CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, target);

      expect(changes.length).toBe(0);
    });

    it("throws when the confirmed permissions leave nobody as owner", () => {
      expect.assertions(1);
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: operator })]);
      const target = new PermissionsCollection([readPermissionDto({ aro_foreign_key: ada })], {
        assertAtLeastOneOwner: false,
      });

      expect(() => CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, target)).toThrow();
    });

    it("throws when the confirmed permissions are empty, which would delete every permission", () => {
      expect.assertions(1);
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: operator })]);
      const target = new PermissionsCollection([], { assertAtLeastOneOwner: false });

      expect(() => CalculatePermissionsChangesService.forResourceWithTargetPermissions(resource, target)).toThrow();
    });

    it("applies the confirmed permissions to a folder, lowerings included", () => {
      expect.assertions(2);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: operator }),
        ownerFolderPermissionDto({ aro_foreign_key: ada }),
      ]);
      const target = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: operator }),
        updateFolderPermissionDto({ aro_foreign_key: ada }),
      ]).permissions;

      const changes = CalculatePermissionsChangesService.forFolderWithTargetPermissions(folder, target);
      const adaChange = changes.items.find((change) => change.aroForeignKey === ada);

      expect(adaChange.scenario).toBe("update");
      expect(adaChange.aco).toBe(PermissionEntity.ACO_FOLDER);
    });
  });
});
