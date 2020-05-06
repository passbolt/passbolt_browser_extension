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
import {PermissionEntity} from "./permissionEntity";
import {EntityValidationError} from "../abstract/entityValidationError";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';
import {PermissionsCollection} from "./permissionsCollection";
import {EntityCollectionError} from "../abstract/entityCollectionError";

beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Permission Collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PermissionsCollection.ENTITY_NAME, PermissionsCollection.getSchema());
  });

  it("constructor must work with empty data", () => {
    const c = new PermissionsCollection([], false);
    c.push(new PermissionEntity({
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    }));
    c.push(new PermissionEntity({
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
      type: PermissionEntity.PERMISSION_OWNER
    }));
    c.assertAtLeastOneOwner();
    PermissionsCollection.assertIsPermissionsCollection(c);
    expect(c.permissions.length).toBe(2);
  });

  it("constructor must work with minimal data", () => {
    const c = new PermissionsCollection([{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
      type: PermissionEntity.PERMISSION_OWNER
    }]);
    expect(c.permissions.length).toBe(1);
  });

  it("constructor must throw an exception if no owner is provided", () => {
    try {
      new PermissionsCollection([{
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
        type: PermissionEntity.PERMISSION_READ
      }]);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_ONE_OWNER);
    }
  });

  it("constructor must throw an exception if same user is used twice", () => {
    try {
      new PermissionsCollection([{
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
        type: PermissionEntity.PERMISSION_READ
      },{
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
        type: PermissionEntity.PERMISSION_OWNER
      }]);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_UNIQUE_ARO);
    }
  });

  it("constructor must throw an exception if different folder is used in same collection", () => {
    try {
      new PermissionsCollection([{
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91f1",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
        type: PermissionEntity.PERMISSION_READ
      },{
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
        type: PermissionEntity.PERMISSION_OWNER
      }]);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_SAME_ACO);
    }
  });

  it("constructor must throw an exception if same permission id is used twice", () => {
    try {
      new PermissionsCollection([{
        id: "d2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
        type: PermissionEntity.PERMISSION_READ
      },{
        id: "d2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aco: PermissionEntity.ACO_FOLDER,
        aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
        aro: PermissionEntity.ARO_USER,
        aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
        type: PermissionEntity.PERMISSION_OWNER
      }]);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_UNIQUE_ID);
    }
  });

  it("addOrReplace allow updating permissions to higher ones", () => {
    const c = new PermissionsCollection([{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    },{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    }]);

    // same same
    c.addOrReplace(new PermissionEntity({
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    }));
    expect(c.permissions.length).toBe(2);
    expect(c.permissions[1].type).toBe(1);

    // but different
    c.addOrReplace(new PermissionEntity({
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_OWNER
    }));
    expect(c.permissions.length).toBe(2);
    expect(c.permissions[1].type).toBe(PermissionEntity.PERMISSION_OWNER);

    // now for something really different
    c.addOrReplace(new PermissionEntity({
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    }));
    expect(c.permissions.length).toBe(2);
    expect(c.permissions[1].type).toBe(PermissionEntity.PERMISSION_OWNER);

    // stop it already
    c.addOrReplace(new PermissionEntity({
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
      type: PermissionEntity.PERMISSION_READ
    }));
    expect(c.permissions.length).toBe(3);
    expect(c.permissions[2].type).toBe(1);
  });

  //============================================================
  // Union
  //============================================================

  it("unionByAcoAndType returns set1 ∪ set2 - no overlap", () => {
    const dto1 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    };
    const dto2 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    };
    const set1 = new PermissionsCollection([dto1], false);
    const set2 = new PermissionsCollection([dto2], false);

    const set3 = PermissionsCollection.unionByAcoAndType(set1, set2);
    expect(set3.toDto()).toEqual([dto1, dto2]);

    const set4 = PermissionsCollection.unionByAcoAndType(set2, set1);
    expect(set4.toDto()).toEqual([dto2, dto1]);
  });

  it("unionByAcoAndType returns set1 ∪ set2 - full overlap", () => {
    const dto1 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    };
    const dto2 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_OWNER
    };
    const dto3 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d992",
      type: PermissionEntity.PERMISSION_UPDATE
    }
    const set1 = new PermissionsCollection([dto3, dto1, dto2], false);
    const set2 = new PermissionsCollection([dto1, dto3, dto2], false);

    const set3 = PermissionsCollection.unionByAcoAndType(set1, set2);
    const set4 = PermissionsCollection.unionByAcoAndType(set2, set1);
    expect(set3.toDto()).toEqual([dto3, dto1, dto2]);
    expect(set4.toDto()).toEqual([dto1, dto3, dto2]);
  });

  it("unionByAcoAndType returns set1 ∪ set2 - overlap highest right wins", () => {
    const set1 = new PermissionsCollection([{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    }], false);
    const set2 = new PermissionsCollection([{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_READ
    }], false);

    const set3 = PermissionsCollection.unionByAcoAndType(set1, set2);
    const set4 = PermissionsCollection.unionByAcoAndType(set2, set1);
    const result = [{
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    }];
    expect(set3.toDto()).toEqual(result);
    expect(set4.toDto()).toEqual(result);
  });

  it("unionByAcoAndType returns set1 ∪ set2 - empty left or right", () => {
    const dto1 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    };
    const dto2 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    };
    const set1 = new PermissionsCollection([dto1, dto2], false);
    const set2 = new PermissionsCollection([], false);

    const set3 = PermissionsCollection.unionByAcoAndType(set1, set2);
    expect(set3.toDto()).toEqual([dto1, dto2]);

    const set4 = PermissionsCollection.unionByAcoAndType(set2, set1);
    expect(set4.toDto()).toEqual([dto1, dto2]);
  });

  it("unionByAcoAndType returns set1 ∪ set2 - now owner set throw error", () => {
    const dto1 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_UPDATE
    };
    const dto2 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_READ
    };
    const set1 = new PermissionsCollection([dto1, dto2], false);
    const set2 = new PermissionsCollection([dto2], false);

    try {
      PermissionsCollection.unionByAcoAndType(set1, set2);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_ONE_OWNER);
    }
  });


  it("unionByAcoAndType returns set1 ∪ set2 - not same aco throw error", () => {
    const dto1 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_UPDATE
    };
    const dto2 = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91f2",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d991",
      type: PermissionEntity.PERMISSION_OWNER
    };
    const set1 = new PermissionsCollection([dto1], false);
    const set2 = new PermissionsCollection([dto2], false);

    try {
      PermissionsCollection.unionByAcoAndType(set1, set2);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_SAME_ACO);
    }
  });

});
