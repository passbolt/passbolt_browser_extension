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
import PermissionEntity from "./permissionEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import PermissionsCollection from "./permissionsCollection";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

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
      }, {
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
      }, {
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
      }, {
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
    }, {
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

  /*
   * ============================================================
   *  Union
   * ============================================================
   */

  it("union returns set1 + set2 - no overlap", () => {
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

    const set3 = PermissionsCollection.sum(set1, set2);
    expect(set3.toDto()).toEqual([dto1, dto2]);

    const set4 = PermissionsCollection.sum(set2, set1);
    expect(set4.toDto()).toEqual([dto2, dto1]);
  });

  it("union returns set1 + set2 - full overlap", () => {
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
    };
    const set1 = new PermissionsCollection([dto3, dto1, dto2], false);
    const set2 = new PermissionsCollection([dto1, dto3, dto2], false);

    const set3 = PermissionsCollection.sum(set1, set2);
    const set4 = PermissionsCollection.sum(set2, set1);
    expect(set3.toDto()).toEqual([dto3, dto1, dto2]);
    expect(set4.toDto()).toEqual([dto1, dto3, dto2]);
  });

  it("union returns set1 + set2 - overlap highest right wins", () => {
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

    const set3 = PermissionsCollection.sum(set1, set2);
    const set4 = PermissionsCollection.sum(set2, set1);
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

  it("union returns set1 + set2 - empty left or right", () => {
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

    const set3 = PermissionsCollection.sum(set1, set2);
    expect(set3.toDto()).toEqual([dto1, dto2]);

    const set4 = PermissionsCollection.sum(set2, set1);
    expect(set4.toDto()).toEqual([dto1, dto2]);
  });

  it("union returns set1 + set2 - now owner set throw error", () => {
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
      PermissionsCollection.sum(set1, set2);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_ONE_OWNER);
    }
  });


  it("union returns set1 + set2 - not same aco throw error", () => {
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
      PermissionsCollection.sum(set1, set2);
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityCollectionError).toBe(true);
      expect(error.rule).toBe(PermissionsCollection.RULE_SAME_ACO);
    }
  });

  it("must serialize with assoc", () => {
    const dto = [
      {
        "id": "1262b7d3-be18-4b5f-bc83-4c995235bb84",
        "aco": "Folder",
        "aco_foreign_key": "d9aaa38e-f80b-4823-b245-83e22a38f765",
        "aro": "User",
        "aro_foreign_key": "f848277c-5398-58f8-a82a-72397af2d450",
        "type": 1,
        "created": "2020-05-06T18:54:50+00:00",
        "modified": "2020-05-06T18:54:50+00:00",
        "group": null,
        "user": {
          "id": "f848277c-5398-58f8-a82a-72397af2d450",
          "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
          "username": "ada@passbolt.com",
          "active": true,
          "deleted": false,
          "created": "2020-03-02T11:14:33+00:00",
          "modified": "2020-04-02T11:14:33+00:00",
          "profile": {
            "id": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
            "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
            "first_name": "Ada",
            "last_name": "Lovelace",
            "created": "2020-05-02T11:14:33+00:00",
            "modified": "2020-05-02T11:14:33+00:00",
            "avatar": {
              "id": "5426cb53-d909-40eb-9202-38f2c1f94084",
              "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
              "foreign_key": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
              "model": "Avatar",
              "filename": "ada.png",
              "filesize": 170049,
              "mime_type": "image\/png",
              "extension": "png",
              "hash": "97e36ab6528e26e3b9f988444ef490f125f49a39",
              "path": "Avatar\/84\/a1\/21\/5426cb53d90940eb920238f2c1f94084\/5426cb53d90940eb920238f2c1f94084.png",
              "adapter": "Local",
              "created": "2020-05-02T11:14:35+00:00",
              "modified": "2020-05-02T11:14:35+00:00",
              "url": {
                "medium": "img\/public\/Avatar\/84\/a1\/21\/5426cb53d90940eb920238f2c1f94084\/5426cb53d90940eb920238f2c1f94084.a99472d5.png",
                "small": "img\/public\/Avatar\/84\/a1\/21\/5426cb53d90940eb920238f2c1f94084\/5426cb53d90940eb920238f2c1f94084.65a0ba70.png"
              }
            }
          },
          "last_logged_in": ""
        }
      },
      {
        "id": "f073fd56-e5bd-4773-9ddb-da386de6ef51",
        "aco": "Folder",
        "aco_foreign_key": "d9aaa38e-f80b-4823-b245-83e22a38f765",
        "aro": "Group",
        "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "type": 15,
        "created": "2020-05-06T18:54:49+00:00",
        "modified": "2020-05-06T18:54:49+00:00",
        "group": {
          "id": "516c2db6-0aed-52d8-854f-b3f3499995e7",
          "name": "Leadership team",
          "deleted": false,
          "created": "2016-01-29T13:39:25+00:00",
          "modified": "2016-01-29T13:39:25+00:00",
          "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
        }
      }
    ];

    const permissionCollection = new PermissionsCollection(dto);
    const permissions = JSON.parse(JSON.stringify(permissionCollection));
    expect(permissions[0].user.profile.first_name).toBe('Ada');
    expect(permissions[0].user.profile.avatar.id).toBe('5426cb53-d909-40eb-9202-38f2c1f94084');
    expect(permissions[1].group.name).toBe('Leadership team');
  });

  it("diff set1 - set2", () => {
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
    };
    let set1,
      set2,
      set3;

    // nothing to remove
    set1 = new PermissionsCollection([dto3], false);
    set2 = new PermissionsCollection([dto1, dto2], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([dto3]);

    // nothing to remove 2
    set1 = new PermissionsCollection([dto1, dto2], false);
    set2 = new PermissionsCollection([dto3], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([dto1, dto2]);

    // nothing to change
    set1 = new PermissionsCollection([dto1, dto2], false);
    set2 = new PermissionsCollection([dto1, dto2], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([]);

    // nothing left
    set1 = new PermissionsCollection([], false);
    set2 = new PermissionsCollection([dto1, dto2], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([]);

    // nothing right
    set1 = new PermissionsCollection([dto1, dto2], false);
    set2 = new PermissionsCollection([], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([dto1, dto2]);

    // nothing at all
    set1 = new PermissionsCollection([], false);
    set2 = new PermissionsCollection([], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([]);

    // nothing left 2
    set1 = new PermissionsCollection([dto1, dto2], false);
    set2 = new PermissionsCollection([dto1, dto2, dto3], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([]);

    // something left
    set1 = new PermissionsCollection([dto1, dto2], false);
    set2 = new PermissionsCollection([dto1, dto3], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([dto2]);

    // something left 2
    set1 = new PermissionsCollection([dto1, dto2, dto3], false);
    set2 = new PermissionsCollection([dto3], false);
    set3 = PermissionsCollection.diff(set1, set2, false);
    expect(set3.toDto()).toEqual([dto1, dto2]);
  });

  it("diff set1 - set2, part 2", () => {
    const owner = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_OWNER
    };
    const read = {
      aco: PermissionEntity.ACO_FOLDER,
      aco_foreign_key: "c2c7f658-c7ac-4d73-9020-9d2c296d91ff",
      aro: PermissionEntity.ARO_USER,
      aro_foreign_key: "54c6278e-f824-5fda-91ff-3e946b18d990",
      type: PermissionEntity.PERMISSION_READ
    };
    let resultSet;

    // check remove equal or lower
    const ownerSet = new PermissionsCollection([owner], false);
    const readSet = new PermissionsCollection([read], false);
    resultSet = PermissionsCollection.diff(ownerSet, readSet, false);
    expect(resultSet.toDto()).toEqual([owner]);
    resultSet = PermissionsCollection.diff(readSet, ownerSet, false);
    expect(resultSet.toDto()).toEqual([]);
    resultSet = PermissionsCollection.diff(ownerSet, ownerSet, false);
    expect(resultSet.toDto()).toEqual([]);
  });
});
