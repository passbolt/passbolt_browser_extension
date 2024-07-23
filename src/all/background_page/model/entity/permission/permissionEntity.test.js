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
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import PermissionEntity from "./permissionEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {
  defaultPermissionDto,
  minimumPermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import UserEntity from "../user/userEntity";
import GroupEntity from "../group/groupEntity";

describe("PermissionEntity", () => {
  describe("GroupEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(PermissionEntity.ENTITY_NAME, PermissionEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(PermissionEntity, "id");
      assertEntityProperty.uuid(PermissionEntity, "id");
      assertEntityProperty.notRequired(PermissionEntity, "id");
    });

    it("validates aco property", () => {
      assertEntityProperty.string(PermissionEntity, "aco");
      assertEntityProperty.enumeration(PermissionEntity, "aco", [PermissionEntity.ACO_FOLDER, PermissionEntity.ACO_RESOURCE]);
      assertEntityProperty.required(PermissionEntity, "aco");
    });

    it("validates aco_foreign_key property", () => {
      assertEntityProperty.string(PermissionEntity, "aco_foreign_key");
      assertEntityProperty.uuid(PermissionEntity, "aco_foreign_key");
      assertEntityProperty.required(PermissionEntity, "aco_foreign_key");
    });

    it("validates aro property", () => {
      assertEntityProperty.string(PermissionEntity, "aro");
      assertEntityProperty.enumeration(PermissionEntity, "aro", [PermissionEntity.ARO_GROUP, PermissionEntity.ARO_USER], ['not-valid-aro', '']);
      assertEntityProperty.required(PermissionEntity, "aro");
    });

    it("validates aro_foreign_key property", () => {
      assertEntityProperty.string(PermissionEntity, "aro_foreign_key");
      assertEntityProperty.uuid(PermissionEntity, "aro_foreign_key");
      assertEntityProperty.required(PermissionEntity, "aro_foreign_key");
    });

    it("validates type property", () => {
      assertEntityProperty.integer(PermissionEntity, "type");
      assertEntityProperty.enumeration(PermissionEntity, "type", PermissionEntity.PERMISSION_TYPES, [-1, 0, 42]);
      assertEntityProperty.required(PermissionEntity, "type");
    });

    it("validates created property", () => {
      assertEntityProperty.string(PermissionEntity, "created");
      assertEntityProperty.dateTime(PermissionEntity, "created");
      assertEntityProperty.notRequired(PermissionEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(PermissionEntity, "modified");
      assertEntityProperty.dateTime(PermissionEntity, "modified");
      assertEntityProperty.notRequired(PermissionEntity, "modified");
    });
  });

  describe("PermissionEntity::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(11);
      const dto = minimumPermissionDto();
      const entity = new PermissionEntity(dto);
      expect(entity.toDto(PermissionEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
      expect(entity.id).toBeNull();
      expect(entity.aco).toEqual(dto.aco);
      expect(entity.aro).toEqual(dto.aro);
      expect(entity.acoForeignKey).toEqual(dto.aco_foreign_key);
      expect(entity.aroForeignKey).toEqual(dto.aro_foreign_key);
      expect(entity.type).toEqual(dto.type);
      expect(entity._props.created).toBeUndefined();
      expect(entity._props.modified).toBeUndefined();
      expect(entity.user).toBeNull();
      expect(entity.group).toBeNull();
    });

    it("constructor works if valid DTO is provided with optional and non supported fields", () => {
      expect.assertions(11);
      const dto = defaultPermissionDto({}, {withGroup: true, withUser: true});
      const entity = new PermissionEntity(dto);
      expect(entity.toDto(PermissionEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.aco).toEqual(dto.aco);
      expect(entity.aro).toEqual(dto.aro);
      expect(entity.acoForeignKey).toEqual(dto.aco_foreign_key);
      expect(entity.aroForeignKey).toEqual(dto.aro_foreign_key);
      expect(entity.type).toEqual(dto.type);
      expect(entity._props.created).toEqual(dto.created);
      expect(entity._props.modified).toEqual(dto.modified);
      expect(entity.user).toBeInstanceOf(UserEntity);
      expect(entity.group).toBeInstanceOf(GroupEntity);
    });
  });

  describe("PermissionEntity::isIdMatching", () => {
    it("should match matching id", () => {
      expect.assertions(2);
      const dto1 = defaultPermissionDto();
      const entity1 = new PermissionEntity(dto1);
      const entity2 = new PermissionEntity(dto1);
      const entity3 = new PermissionEntity(defaultPermissionDto({id: crypto.randomUUID()}));
      expect(PermissionEntity.isIdMatching(entity1, entity2)).toBeTruthy();
      expect(PermissionEntity.isIdMatching(entity1, entity3)).toBeFalsy();
    });
  });

  describe("PermissionEntity::isAroMatching", () => {
    it("should match matching aro", () => {
      expect.assertions(2);
      const dto1 = defaultPermissionDto();
      const entity1 = new PermissionEntity(dto1);
      const entity2 = new PermissionEntity(dto1);
      const entity3 = new PermissionEntity(defaultPermissionDto({aro: PermissionEntity.ARO_GROUP}));
      expect(PermissionEntity.isAroMatching(entity1, entity2)).toBeTruthy();
      expect(PermissionEntity.isAroMatching(entity1, entity3)).toBeFalsy();
    });
  });

  describe("PermissionEntity::isAcoMatching", () => {
    it("should match matching aco", () => {
      expect.assertions(2);
      const dto1 = defaultPermissionDto();
      const entity1 = new PermissionEntity(dto1);
      const entity2 = new PermissionEntity(dto1);
      const entity3 = new PermissionEntity(defaultPermissionDto({aco: PermissionEntity.ACO_FOLDER}));
      expect(PermissionEntity.isAcoMatching(entity1, entity2)).toBeTruthy();
      expect(PermissionEntity.isAcoMatching(entity1, entity3)).toBeFalsy();
    });
  });

  describe("PermissionEntity::isAcoAndAroMatching", () => {
    it("should match matching aco & aro", () => {
      expect.assertions(2);
      const dto1 = defaultPermissionDto();
      const entity1 = new PermissionEntity(dto1);
      const entity2 = new PermissionEntity(dto1);
      const entity3 = new PermissionEntity(defaultPermissionDto({aro: PermissionEntity.ARO_GROUP, aco: PermissionEntity.ACO_FOLDER}));
      expect(PermissionEntity.isAcoAndAroMatching(entity1, entity2)).toBeTruthy();
      expect(PermissionEntity.isAcoAndAroMatching(entity1, entity3)).toBeFalsy();
    });
  });

  describe("PermissionEntity::isTypeMatching", () => {
    it("should match matching type", () => {
      expect.assertions(2);
      const dto1 = defaultPermissionDto();
      const entity1 = new PermissionEntity(dto1);
      const entity2 = new PermissionEntity(dto1);
      const entity3 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_READ}));
      expect(PermissionEntity.isTypeMatching(entity1, entity2)).toBeTruthy();
      expect(PermissionEntity.isTypeMatching(entity1, entity3)).toBeFalsy();
    });
  });

  describe("PermissionEntity::isMatchingAroAcoType", () => {
    it("should match matching aco & aro & type", () => {
      expect.assertions(2);
      const dto1 = defaultPermissionDto();
      const entity1 = new PermissionEntity(dto1);
      const entity2 = new PermissionEntity(dto1);
      const entity3 = new PermissionEntity(defaultPermissionDto({aro: PermissionEntity.ARO_GROUP, aco: PermissionEntity.ACO_FOLDER, type: PermissionEntity.PERMISSION_READ}));
      expect(PermissionEntity.isMatchingAroAcoType(entity1, entity2)).toBeTruthy();
      expect(PermissionEntity.isMatchingAroAcoType(entity1, entity3)).toBeFalsy();
    });
  });

  describe("PermissionEntity::getHighestPermissionType", () => {
    it("should get the highest permission type", () => {
      expect.assertions(4);
      const entity1 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_OWNER}));
      const entity2 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_UPDATE}));
      const entity3 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_READ}));
      expect(PermissionEntity.getHighestPermissionType(entity1, entity2)).toBe(PermissionEntity.PERMISSION_OWNER);
      expect(PermissionEntity.getHighestPermissionType(entity2, entity3)).toBe(PermissionEntity.PERMISSION_UPDATE);
      expect(PermissionEntity.getHighestPermissionType(entity3, entity1)).toBe(PermissionEntity.PERMISSION_OWNER);
      expect(PermissionEntity.getHighestPermissionType(entity3, entity3)).toBe(PermissionEntity.PERMISSION_READ);
    });
  });

  describe("PermissionEntity::getHighestPermission", () => {
    it("should get the highest permission", () => {
      expect.assertions(4);
      const entity1 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_OWNER}));
      const entity2 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_UPDATE}));
      const entity3 = new PermissionEntity(defaultPermissionDto({type: PermissionEntity.PERMISSION_READ}));
      expect(PermissionEntity.getHighestPermission(entity1, entity2)).toBe(entity1);
      expect(PermissionEntity.getHighestPermission(entity2, entity3)).toBe(entity2);
      expect(PermissionEntity.getHighestPermission(entity3, entity1)).toBe(entity1);
      expect(PermissionEntity.getHighestPermission(entity3, entity3)).toBe(entity3);
    });
  });

  describe("PermissionEntity::assertIsPermission", () => {
    it("should throw if null given", () => {
      expect.assertions(1);
      expect(() => PermissionEntity.assertIsPermission(null)).toThrow(TypeError);
    });

    it("should throw if array given", () => {
      expect.assertions(1);
      const dto = defaultPermissionDto();
      expect(() => PermissionEntity.assertIsPermission(dto)).toThrow(TypeError);
    });

    it("should accept permission entity", () => {
      expect.assertions(1);
      const entity = new PermissionEntity(defaultPermissionDto());
      expect(() => PermissionEntity.assertIsPermission(entity)).not.toThrow();
    });
  });

  describe("PermissionEntity::copyForAnotherAco", () => {
    it("should copy an entity for another aco", () => {
      expect.assertions(1);
      const p = new PermissionEntity(defaultPermissionDto());
      const uuid0 = crypto.randomUUID();
      const p2 = p.copyForAnotherAco(PermissionEntity.ACO_FOLDER, uuid0);
      expect(p2.toDto()).toEqual({
        'aro': PermissionEntity.ARO_USER,
        'aro_foreign_key': p.aroForeignKey,
        'aco': PermissionEntity.ACO_FOLDER,
        'aco_foreign_key': uuid0,
        'type': PermissionEntity.PERMISSION_OWNER,
      });
    });
  });
});
