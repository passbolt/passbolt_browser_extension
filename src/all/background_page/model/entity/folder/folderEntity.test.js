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
import {v4 as uuidv4} from 'uuid';
import FolderEntity from "./folderEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import PermissionEntity from "../permission/permissionEntity";
import {
  defaultFolderDto,
  folderWithReadPermissionDto,
  folderWithUpdatePermissionDto,
  minimalFolderDto
} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import each from "jest-each";
import {ownerPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import PermissionsCollection from "../permission/permissionsCollection";

describe("FolderEntity", () => {
  describe("FolderEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(FolderEntity.ENTITY_NAME, FolderEntity.getSchema());
    });

    it("constructor works if valid minimal DTO is provided", () => {
      const dto = minimalFolderDto();
      const entity = new FolderEntity(dto);
      expect(entity.id).toBeNull();
      expect(entity.name).toEqual('Folder name');
      expect(entity.folderParentId).toBeNull();
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
      expect(entity.permission).toBeNull();
      expect(entity.permissions).toBeNull();
      expect(entity.isReadOnly()).toBe(false);
      expect(entity.canUpdate()).toBe(false);
      expect(entity.isOwner()).toBe(false);
      expect(entity.isPersonal()).toBe(null);
      expect(entity.isShared()).toBe(null);
    });

    it("constructor works if valid DTO is provided with optional properties", () => {
      const dto = defaultFolderDto();
      const entity = new FolderEntity(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.name).toEqual('Accounting');
      expect(entity.folderParentId).toBeNull();
      expect(entity.created).toEqual("2020-02-01T00:00:00+00:00");
      expect(entity.modified).toEqual("2020-02-01T00:00:00+00:00");
      expect(entity.permission).toBeInstanceOf(PermissionEntity);
      expect(entity.permission.toDto()).toEqual(expect.objectContaining({type: 15}));
      expect(entity.permissions).toBeInstanceOf(PermissionsCollection);
      expect(entity.permissions.length).toEqual(1);
      expect(entity.isReadOnly()).toBe(false);
      expect(entity.canUpdate()).toBe(true);
      expect(entity.isOwner()).toBe(true);
      expect(entity.isPersonal()).toBe(false);
      expect(entity.isShared()).toBe(true);
    });

    // Validate id
    each([
      {scenario: 'is not required but null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          id: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('id', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate folder_parent_id
    each([
      {scenario: 'valid uuid', rule: 'type', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the folder_parent_id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          folder_parent_id: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('folder_parent_id', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'can be null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: uuidv4()},
    ]).describe("Should validate the folder_parent_id", test => {
      it(`Should accept: ${test.scenario}`, async() => {
        expect.assertions(1);
        const dto = defaultFolderDto({
          folder_parent_id: test.value
        });
        const folder = new FolderEntity(dto);
        expect(folder).toBeInstanceOf(FolderEntity);
      });
    });

    // Validate name
    each([
      {scenario: 'required', rule: 'type'},
      {scenario: 'not null', rule: 'type', value: null},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the name", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          name: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('name', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate created_by
    each([
      {scenario: 'is not required but null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the created_by", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          created_by: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('created_by', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate modified_by
    each([
      {scenario: 'is not required but null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the modified_by", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          modified_by: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('modified_by', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
    ]).describe("Should validate the created", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          created: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('created', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
    ]).describe("Should validate the modified", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          modified: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('modified', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
      {scenario: 'valid url object', rule: 'type', value: 1},
    ]).describe("Should validate the personal", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFolderDto({
          personal: test.value
        });
        try {
          new FolderEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('personal', test.rule)).toBeTruthy();
        }
      });
    });

    it('Should not accept invalid associated permission', async() => {
      expect.assertions(2);
      const dto = defaultFolderDto({
        permission: ownerPermissionDto({id: "invalid-id"})
      });
      try {
        new FolderEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('id', 'format')).toBeTruthy();
      }
    });

    it('Should not accept invalid associated permissions', async() => {
      expect.assertions(2);
      const dto = defaultFolderDto({
        permissions: [ownerPermissionDto({id: "invalid-id"})]
      });
      try {
        new FolderEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('id', 'format')).toBeTruthy();
      }
    });
  });

  describe("FolderEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(2);
      const expectedKeys = [
        "id",
        "folder_parent_id",
        "name",
        "created_by",
        "modified_by",
        "created",
        "modified",
        "personal",
      ];

      const dto = defaultFolderDto();
      const entity = new FolderEntity(dto);
      const resultDto = entity.toDto();
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
    });

    it("should return the expected properties containing the associated permission.", () => {
      expect.assertions(3);
      const expectedKeys = [
        "id",
        "folder_parent_id",
        "name",
        "created_by",
        "modified_by",
        "created",
        "modified",
        "personal",
        "permission"
      ];

      const dto = defaultFolderDto();
      const entity = new FolderEntity(dto);
      const resultDto = entity.toDto({permission: true});
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
      expect(resultDto.permission.type).toEqual(15);
    });

    it("should return the expected properties containing the associated permissions.", () => {
      expect.assertions(3);
      const expectedKeys = [
        "id",
        "folder_parent_id",
        "name",
        "created_by",
        "modified_by",
        "created",
        "modified",
        "personal",
        "permissions"
      ];

      const dto = defaultFolderDto();
      const entity = new FolderEntity(dto);
      const resultDto = entity.toDto({permissions: true});
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
      expect(resultDto.permissions[0].type).toEqual(15);
    });
  });

  describe("FolderEntity:canFolderMove", () => {
    it("folder can move test", () => {
      const personalFolderDto = defaultFolderDto({
        "personal": true,
      });
      const personal = new FolderEntity(personalFolderDto);

      const sharedOwnerDto = defaultFolderDto({
        "personal": false,
      });
      const sharedOwner = new FolderEntity(sharedOwnerDto);

      const sharedUpdateDto = folderWithUpdatePermissionDto({
        "personal": false,
      });
      const sharedUpdate = new FolderEntity(sharedUpdateDto);

      const sharedReadDto = folderWithReadPermissionDto({
        "personal": false,
      });
      const sharedRead = new FolderEntity(sharedReadDto);

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
});
