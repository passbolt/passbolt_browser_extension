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
import {FolderEntity} from "./folderEntity";
import {EntityValidationError} from "../abstract/entityValidationError";
import {EntitySchema} from "../abstract/entitySchema";
import {PermissionEntity} from "../permission/permissionEntity";

describe("Folder entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(FolderEntity.ENTITY_NAME, FolderEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "name": "folder",
    };
    const result = {
      "name": "folder",
      "folder_parent_id": null
    };
    const entity = new FolderEntity(dto);
    expect(entity.toDto()).toEqual(result);
    expect(JSON.stringify(entity)).toEqual(JSON.stringify(result));
    expect(entity.name).toEqual('folder');
    expect(entity.isReadOnly()).toBe(false);
    expect(entity.canUpdate()).toBe(false);
    expect(entity.isOwner()).toBe(false);
    expect(entity.isPersonal()).toBe(null);
    expect(entity.isShared()).toBe(null);
  });

  it("constructor works with parent id as null or uuid", () => {
    const dtoNull = {
      "name": "folder",
      "folder_parent_id": null
    };
    expect(Object.prototype.hasOwnProperty.call(dtoNull, 'folder_parent_id')).toBe(true);
    let entity = new FolderEntity(dtoNull);
    const apiDto = entity.toDto();
    expect(apiDto).toEqual(dtoNull);
    expect(entity.name).toEqual('folder');
    expect(entity.folderParentId).toEqual(null);

    const dtoUiid = {
      "name": "folder",
      "folder_parent_id": "433b1f36-f150-4410-8d78-e28ac78535e9"
    };
    entity = new FolderEntity(dtoUiid);
    expect(entity.toDto()).toEqual(dtoUiid);
    expect(entity.folderParentId).toEqual('433b1f36-f150-4410-8d78-e28ac78535e9');
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      "folder_parent_id": null,
      'name': "folder",
      'description': 'folder description',
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
    };
    const filtered = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      "folder_parent_id": null,
      'name': "folder",
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
    };
    const folderEntity = new FolderEntity(dto);
    expect(folderEntity.toDto()).toEqual(filtered);

    // test getters
    expect(folderEntity.id).toEqual('7f077753-0835-4054-92ee-556660ea04f1');
    expect(folderEntity.created).toEqual('2020-04-25 12:52:00');
    expect(folderEntity.modified).toEqual('2020-04-25 12:52:01');
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new FolderEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('name', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    try {
      new FolderEntity({'id': 'nope'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
    }
    try {
      new FolderEntity({'name': ''});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('name', 'minLength')).toBe(true);
    }
    try {
      new FolderEntity({'name': Array(257).join("ツ")});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('name', 'maxLength')).toBe(true);
    }
  });

  it("constructor works with associated permissions", () => {
    const folderDto = {
      "id": "6e6fd446-92a8-478f-aa9d-746685048836",
      "name": "folder",
      "created": "2020-05-04T14:52:28+00:00",
      "modified": "2020-05-04T14:52:28+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "permission": {
        "id": "37ca07ee-44b6-4ce8-9439-47b4fd5479cc",
        "aco": "Folder",
        "aco_foreign_key": "6e6fd446-92a8-478f-aa9d-746685048836",
        "aro": "User",
        "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "type": 15,
        "created": "2020-05-04T14:52:28+00:00",
        "modified": "2020-05-04T14:52:28+00:00"
      },
      "folder_parent_id": "63241b96-81d8-4eb9-8cba-82a6f724b310"
    };
    const folderEntity = new FolderEntity(folderDto);
    expect(folderEntity.toDto({permission: true})).toEqual(folderDto);
    const folderJson = JSON.stringify(folderEntity.toDto({permission: true}));
    expect(folderJson.includes('37ca07ee-44b6-4ce8-9439-47b4fd5479cc')).toBe(true);
    const folderJson2 = JSON.stringify(folderEntity.toDto());
    expect(folderJson2.includes('37ca07ee-44b6-4ce8-9439-47b4fd5479cc')).toBe(false);
  });

  it("folder can move test", () => {
    const personal = new FolderEntity({
      "name": "0",
      "personal": true,
      "permission": {
        "aco": "Folder",
        "aco_foreign_key": "6e6fd446-92a8-478f-aa9d-746685048836",
        "aro": "User",
        "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "type": PermissionEntity.PERMISSION_OWNER
      }
    });
    const sharedOwner = new FolderEntity({
      "name": "0",
      "personal": false,
      "permission": {
        "aco": "Folder",
        "aco_foreign_key": "6e6fd446-92a8-478f-aa9d-746685048836",
        "aro": "User",
        "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "type": PermissionEntity.PERMISSION_OWNER
      }
    });
    const sharedUpdate = new FolderEntity({
      "name": "0",
      "personal": false,
      "permission": {
        "aco": "Folder",
        "aco_foreign_key": "6e6fd446-92a8-478f-aa9d-746685048836",
        "aro": "User",
        "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "type": PermissionEntity.PERMISSION_UPDATE
      }
    });
    const sharedRead = new FolderEntity({
      "name": "0",
      "personal": false,
      "permission": {
        "aco": "Folder",
        "aco_foreign_key": "6e6fd446-92a8-478f-aa9d-746685048836",
        "aro": "User",
        "aro_foreign_key": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "type": PermissionEntity.PERMISSION_READ
      }
    });
    /*
     * CANNOT MOVE
     * Share folder read to folder to the root
     */
    expect(FolderEntity.canFolderMove(sharedRead, sharedRead, null)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, sharedUpdate, null)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, sharedOwner, null)).toBe(false);
    // Share folder read to folder I own
    expect(FolderEntity.canFolderMove(sharedRead, sharedRead, sharedOwner)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, sharedUpdate, sharedOwner)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, sharedOwner, sharedOwner)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, personal, sharedOwner)).toBe(false);
    // Share folder read to folder I own
    expect(FolderEntity.canFolderMove(sharedRead, sharedRead, sharedUpdate)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, sharedUpdate, sharedUpdate)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, sharedOwner, sharedUpdate)).toBe(false);
    expect(FolderEntity.canFolderMove(sharedRead, personal, sharedUpdate)).toBe(false);

    /*
     * CAN MOVE
     * Read folder in a personal folder
     */
    expect(FolderEntity.canFolderMove(sharedRead, personal, null)).toBe(true);
    expect(FolderEntity.canFolderMove(sharedRead, personal, personal)).toBe(true);
    expect(FolderEntity.canFolderMove(sharedRead, null, personal)).toBe(true);
    // Moving a personal folder in a personal  folder to the root
    expect(FolderEntity.canFolderMove(personal, personal, null)).toBe(true);
    expect(FolderEntity.canFolderMove(sharedOwner, sharedOwner, sharedOwner)).toBe(true);
    expect(FolderEntity.canFolderMove(sharedOwner, sharedRead, sharedOwner)).toBe(true);
    expect(FolderEntity.canFolderMove(sharedUpdate, sharedRead, sharedUpdate)).toBe(true);
    // Moving a personal folder at the root
    expect(FolderEntity.canFolderMove(personal, null, sharedUpdate)).toBe(true);
    expect(FolderEntity.canFolderMove(personal, null, null)).toBe(true);
    expect(FolderEntity.canFolderMove(sharedOwner, null, sharedOwner)).toBe(true);
  });
});
