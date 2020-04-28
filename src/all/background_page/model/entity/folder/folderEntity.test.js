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
import {FolderEntity} from "./FolderEntity";
import {EntityValidationError} from "../abstract/entityValidationError";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Folder entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(FolderEntity.ENTITY_NAME, FolderEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "name": "folder",
    };
    const entity = new FolderEntity(dto);
    expect(entity.toApiData()).toEqual(dto);
    expect(entity.name).toEqual('folder');
  });

  it("constructor works with parent id as null or uuid", () => {
    const dtoNull = {
      "name": "folder",
      "folder_parent_id": null
    };
    expect(dtoNull.hasOwnProperty('folder_parent_id')).toBe(true);
    let entity = new FolderEntity(dtoNull);
    let apiDto = entity.toApiData();
    expect(apiDto).toEqual(dtoNull);
    expect(entity.name).toEqual('folder');
    expect(entity.folderParentId).toEqual(null);

    const dtoUiid = {
      "name": "folder",
      "folder_parent_id": "433b1f36-f150-4410-8d78-e28ac78535e9"
    };
    entity = new FolderEntity(dtoUiid);
    expect(entity.toApiData()).toEqual(dtoUiid);
    expect(entity.folderParentId).toEqual('433b1f36-f150-4410-8d78-e28ac78535e9');
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'name': "folder",
      'description': 'folder description',
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
    };
    const filtered = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'name': "folder",
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
    };
    const folderEntity = new FolderEntity(dto);
    expect(folderEntity.toApiData()).toEqual(filtered);

    // test getters
    expect(folderEntity.id).toEqual('7f077753-0835-4054-92ee-556660ea04f1');
    expect(folderEntity.created).toEqual('2020-04-25 12:52:00');
    expect(folderEntity.modified).toEqual('2020-04-25 12:52:01');
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new FolderEntity({'id':'7f077753-0835-4054-92ee-556660ea04f1'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('name', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    try {
      new FolderEntity({'id':'nope'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
    }
    try {
      new FolderEntity({'name':''});
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
});
