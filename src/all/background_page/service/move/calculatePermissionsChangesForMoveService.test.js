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
import CalculatePermissionsChangesForMoveService from "./calculatePermissionsChangesForMoveService";
import FolderEntity from "../../model/entity/folder/folderEntity";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {
  ownerFolderPermissionDto,
  ownerPermissionDto,
  readFolderPermissionDto,
  readPermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import { v4 as uuidv4 } from "uuid";
import { buildFolder, buildResource } from "./calculatePermissionsChangesForMoveService.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CalculatePermissionsChangesForMoveService", () => {
  const owner = uuidv4();
  const extra = uuidv4();

  describe("::forFolder", () => {
    it("should emit no changes when moving between folders with identical ACLs", () => {
      expect.assertions(1);
      const folder = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const parent = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const dest = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);

      const changes = CalculatePermissionsChangesForMoveService.forFolder(folder, parent, dest);

      expect(changes.length).toBe(0);
    });

    it("should emit a change when destination has an additional aro", () => {
      expect.assertions(3);
      const folder = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const parent = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const dest = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        readFolderPermissionDto({ aro_foreign_key: extra }),
      ]);

      const changes = CalculatePermissionsChangesForMoveService.forFolder(folder, parent, dest);

      expect(changes.length).toBe(1);
      expect(changes.items[0].aroForeignKey).toBe(extra);
      expect(changes.items[0].aco).toBe(PermissionEntity.ACO_FOLDER);
    });

    it("should reuse the highest user permission on move to root", () => {
      expect.assertions(2);
      const folder = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        readFolderPermissionDto({ aro_foreign_key: extra }),
      ]);
      const parent = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        readFolderPermissionDto({ aro_foreign_key: extra }),
      ]);

      const changes = CalculatePermissionsChangesForMoveService.forFolder(folder, parent, null);

      expect(changes.length).toBe(1);
      expect(changes.items[0].aroForeignKey).toBe(extra);
    });

    it("should throw when source permissions are missing", () => {
      expect.assertions(1);
      const folder = new FolderEntity(defaultFolderDto());
      const parent = new FolderEntity(defaultFolderDto());

      expect(() => CalculatePermissionsChangesForMoveService.forFolder(folder, parent, null)).toThrow(
        new TypeError("CalculatePermissionsChangesForMoveService requires permissions to be set."),
      );
    });

    it("should throw when destination permissions are missing", () => {
      expect.assertions(1);
      const folder = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const dest = new FolderEntity(defaultFolderDto());

      expect(() => CalculatePermissionsChangesForMoveService.forFolder(folder, null, dest)).toThrow(
        new TypeError("CalculatePermissionsChangesForMoveService requires destination permissions to be set."),
      );
    });
  });

  describe("::forResource", () => {
    it("should emit ACO_RESOURCE changes when destination has an additional aro", () => {
      expect.assertions(3);
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: owner })]);
      const parent = buildFolder([ownerFolderPermissionDto({ aro_foreign_key: owner })]);
      const dest = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        readFolderPermissionDto({ aro_foreign_key: extra }),
      ]);

      const changes = CalculatePermissionsChangesForMoveService.forResource(resource, parent, dest);

      expect(changes.length).toBe(1);
      expect(changes.items[0].aroForeignKey).toBe(extra);
      expect(changes.items[0].aco).toBe(PermissionEntity.ACO_RESOURCE);
    });

    it("should reuse the highest permission with ACO_RESOURCE on move to root", () => {
      expect.assertions(3);
      const resource = buildResource([
        ownerPermissionDto({ aro_foreign_key: owner }),
        readPermissionDto({ aro_foreign_key: extra }),
      ]);
      const parent = buildFolder([
        ownerFolderPermissionDto({ aro_foreign_key: owner }),
        readFolderPermissionDto({ aro_foreign_key: extra }),
      ]);

      const changes = CalculatePermissionsChangesForMoveService.forResource(resource, parent, null);

      expect(changes.length).toBe(1);
      expect(changes.items[0].aroForeignKey).toBe(extra);
      expect(changes.items[0].aco).toBe(PermissionEntity.ACO_RESOURCE);
    });

    it("should throw when source permissions are missing", () => {
      expect.assertions(1);
      const resource = new ResourceEntity(defaultResourceDto());
      const parent = new FolderEntity(defaultFolderDto());

      expect(() => CalculatePermissionsChangesForMoveService.forResource(resource, parent, null)).toThrow(
        new TypeError("CalculatePermissionsChangesForMoveService requires permissions to be set."),
      );
    });

    it("should throw when destination permissions are missing", () => {
      expect.assertions(1);
      const resource = buildResource([ownerPermissionDto({ aro_foreign_key: owner })]);
      const dest = new FolderEntity(defaultFolderDto());

      expect(() => CalculatePermissionsChangesForMoveService.forResource(resource, null, dest)).toThrow(
        new TypeError("CalculatePermissionsChangesForMoveService requires destination permissions to be set."),
      );
    });
  });
});
