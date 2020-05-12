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
 * @since         2.13.0
 */
import {PermissionChangesCollection} from "./permissionChangesCollection";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';
import {PermissionEntity} from "./permissionEntity";
import {PermissionsCollection} from "./permissionsCollection";

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("PermissionChangesCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PermissionChangesCollection.ENTITY_NAME, PermissionChangesCollection.getSchema());
  });

  it("allow filter by aco foreign key", () => {
    const changesDto = [{
      aco: "Folder",
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: "User",
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d994",
      is_new: true,
      type: 1
    }, {
      aco: "Folder",
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: "User",
      aro_foreign_key: "640ebc06-5ec1-5322-a1ae-6120ed2f3a74",
      created: "2020-05-02T22:50:42+00:00",
      delete: true,
      id: "f639e57e-6aaa-4bd8-bb3a-7ea21a2ac44e",
      modified: "2020-05-02T22:50:42+00:00",
      type: 1
    }, {
      aco: "Folder",
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: "User",
      aro_foreign_key: "f848277c-5398-58f8-a82a-72397af2d450",
      created: "2020-05-02T22:48:37+00:00",
      id: "cd899aee-5431-45a9-a6ea-8483bf342146",
      modified: "2020-05-02T22:48:37+00:00",
      type: 7
    }];
    const changeEntity = new PermissionChangesCollection(changesDto);
    expect(changeEntity.filterByAcoForeignKey("c2c7f658-c7ac-4d73-9020-9d2c296d91ff").length).toBe(3);
    expect(changeEntity.toDto().length).toBe(3);
  });

  it("calculateChanges basics", () => {
    const originalSet = new PermissionsCollection([{
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9100",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    }, {
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9101",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_UPDATE
    }, {
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9102",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
      type: PermissionEntity.PERMISSION_READ
    },{
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9103",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d993",
      type: PermissionEntity.PERMISSION_READ
    }]);

    // Delete first one
    // Downgrade second one
    // Upgrade third one
    // Let fourth one
    // Add five one
    const expectedSet = new PermissionsCollection([{
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9101",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    }, {
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9102",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
      type: PermissionEntity.PERMISSION_UPDATE
    }, {
      id: "c2c7f658-c7ac-4d73-9020-9d2c296d9103",
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d993",
      type: PermissionEntity.PERMISSION_READ
    },{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d994",
      type: PermissionEntity.PERMISSION_OWNER
    }]);

    const changes = PermissionChangesCollection.calculateChanges(originalSet, expectedSet);
    expect(changes.toDto()).toEqual([{
        id: 'c2c7f658-c7ac-4d73-9020-9d2c296d9101',
        aco: 'Folder',
        aro: 'User',
        aco_foreign_key: 'c2c7f658-c7ac-4d73-9020-9d2c296d91ff',
        aro_foreign_key: '54c6278e-f824-5fda-91ff-3e946b18d991',
        type: 1
      }, {
        id: 'c2c7f658-c7ac-4d73-9020-9d2c296d9102',
        aco: 'Folder',
        aro: 'User',
        aco_foreign_key: 'c2c7f658-c7ac-4d73-9020-9d2c296d91ff',
        aro_foreign_key: '54c6278e-f824-5fda-91ff-3e946b18d992',
        type: 7
      }, {
        aco: 'Folder',
        aro: 'User',
        aco_foreign_key: 'c2c7f658-c7ac-4d73-9020-9d2c296d91ff',
        aro_foreign_key: '54c6278e-f824-5fda-91ff-3e946b18d994',
        type: 15
      }, {
        id: 'c2c7f658-c7ac-4d73-9020-9d2c296d9100',
        delete: true,
        aco: 'Folder',
        aro: 'User',
        aco_foreign_key: 'c2c7f658-c7ac-4d73-9020-9d2c296d91ff',
        aro_foreign_key: '54c6278e-f824-5fda-91ff-3e946b18d990',
        type: 15
      }
    ]);
  });
});
