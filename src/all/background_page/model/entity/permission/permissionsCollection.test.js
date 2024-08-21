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
import permissionEntity from "./permissionEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import PermissionsCollection from "./permissionsCollection";
import permissionsCollection from "./permissionsCollection";
import {
  defaultPermissionDto,
  minimumPermissionDto,
  ownerFolderPermissionDto,
  ownerMinimalFolderPermissionDto,
  ownerPermissionDto,
  readMinimalFolderPermissionDto,
  readPermissionDto,
  updateFolderPermissionDto,
  updateMinimalFolderPermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import {
  defaultPermissionsDtos
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionCollection.test.data";

describe("PermissionsCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PermissionsCollection.ENTITY_NAME, PermissionsCollection.getSchema());
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);
      const collection = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      expect(collection).toHaveLength(0);
    });

    it("works if valid minimal DTOs are provided", () => {
      expect.assertions(21);
      const acoForeignKey = crypto.randomUUID();
      const dto1 = minimumPermissionDto({aco_foreign_key: acoForeignKey});
      const dto2 = minimumPermissionDto({aco_foreign_key: acoForeignKey});
      const dto3 = minimumPermissionDto({aco_foreign_key: acoForeignKey});
      const dtos = [dto1, dto2, dto3];
      const collection = new PermissionsCollection(dtos);
      expect(collection.items).toHaveLength(3);
      expect(collection.toDto()).toEqual(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
      expect(collection.items[0]).toBeInstanceOf(PermissionEntity);
      expect(collection.items[0]._props.aco).toEqual(dto1.aco);
      expect(collection.items[0]._props.aco_foreign_key).toEqual(dto1.aco_foreign_key);
      expect(collection.items[0]._props.aro).toEqual(dto1.aro);
      expect(collection.items[0]._props.aro_foreign_key).toEqual(dto1.aro_foreign_key);
      expect(collection.items[0]._props.type).toEqual(dto1.type);
      expect(collection.items[1]).toBeInstanceOf(PermissionEntity);
      expect(collection.items[1]._props.aco).toEqual(dto2.aco);
      expect(collection.items[1]._props.aco_foreign_key).toEqual(dto2.aco_foreign_key);
      expect(collection.items[1]._props.aro).toEqual(dto2.aro);
      expect(collection.items[1]._props.aro_foreign_key).toEqual(dto2.aro_foreign_key);
      expect(collection.items[1]._props.type).toEqual(dto2.type);
      expect(collection.items[2]).toBeInstanceOf(PermissionEntity);
      expect(collection.items[2]._props.aco).toEqual(dto3.aco);
      expect(collection.items[2]._props.aco_foreign_key).toEqual(dto3.aco_foreign_key);
      expect(collection.items[2]._props.aro).toEqual(dto3.aro);
      expect(collection.items[2]._props.aro_foreign_key).toEqual(dto3.aro_foreign_key);
      expect(collection.items[2]._props.type).toEqual(dto3.type);
    });

    it("works if valid complete entities are provided", () => {
      expect.assertions(19);
      const acoForeignKey = crypto.randomUUID();
      const entity1 = new permissionEntity(defaultPermissionDto({aco_foreign_key: acoForeignKey}));
      const entity2 = new permissionEntity(defaultPermissionDto({aco_foreign_key: acoForeignKey}));
      const entity3 = new permissionEntity(defaultPermissionDto({aco_foreign_key: acoForeignKey}));
      const entities = [entity1, entity2, entity3];
      const collection = new PermissionsCollection(entities);
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(PermissionEntity);
      expect(collection.items[0]._props.aco).toEqual(entity1.aco);
      expect(collection.items[0]._props.aco_foreign_key).toEqual(entity1.acoForeignKey);
      expect(collection.items[0]._props.aro).toEqual(entity1.aro);
      expect(collection.items[0]._props.aro_foreign_key).toEqual(entity1.aroForeignKey);
      expect(collection.items[2]._props.type).toEqual(entity1.type);
      expect(collection.items[1]).toBeInstanceOf(PermissionEntity);
      expect(collection.items[1]._props.aco).toEqual(entity2.aco);
      expect(collection.items[1]._props.aco_foreign_key).toEqual(entity2.acoForeignKey);
      expect(collection.items[1]._props.aro).toEqual(entity2.aro);
      expect(collection.items[1]._props.aro_foreign_key).toEqual(entity2.aroForeignKey);
      expect(collection.items[2]._props.type).toEqual(entity2.type);
      expect(collection.items[2]).toBeInstanceOf(PermissionEntity);
      expect(collection.items[2]._props.aco).toEqual(entity3.aco);
      expect(collection.items[2]._props.aco_foreign_key).toEqual(entity3.acoForeignKey);
      expect(collection.items[2]._props.aro).toEqual(entity3.aro);
      expect(collection.items[2]._props.aro_foreign_key).toEqual(entity3.aroForeignKey);
      expect(collection.items[2]._props.type).toEqual(entity3.type);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new PermissionsCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const acoForeignKey = crypto.randomUUID();
      const dto1 = defaultPermissionDto({aco_foreign_key: acoForeignKey});
      const dto2 = defaultPermissionDto({aco_foreign_key: acoForeignKey, id: 42});

      expect.assertions(1);
      expect(() => new PermissionsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const acoForeignKey = crypto.randomUUID();
      const dto1 = defaultPermissionDto({aco_foreign_key: acoForeignKey});
      const dto2 = defaultPermissionDto({aco_foreign_key: acoForeignKey, id: dto1.id});

      expect.assertions(1);
      expect(() => new PermissionsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.unique");
    });

    it("should throw if one of data item does not validate the unique user id build rule", () => {
      const acoForeignKey = crypto.randomUUID();
      const dto1 = defaultPermissionDto({aco_foreign_key: acoForeignKey});
      const dto2 = defaultPermissionDto({aco_foreign_key: acoForeignKey, aro_foreign_key: dto1.aro_foreign_key});

      expect.assertions(1);
      expect(() => new PermissionsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.aro_foreign_key.unique");
    });

    it("should throw if one of data item does not validate the same aco_foreign_key build rule", () => {
      const dto1 = defaultPermissionDto();
      const dto2 = defaultPermissionDto();

      expect.assertions(1);
      expect(() => new PermissionsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.aco_foreign_key.same_aco");
    });

    it("should throw if one of data item does not validate the owner build rule", () => {
      const acoForeignKey = crypto.randomUUID();
      const dto1 = defaultPermissionDto({aco_foreign_key: acoForeignKey, type: PermissionEntity.PERMISSION_READ});
      const dto2 = defaultPermissionDto({aco_foreign_key: acoForeignKey, type: PermissionEntity.PERMISSION_UPDATE});

      expect.assertions(1);
      expect(() => new PermissionsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("owner");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      const acoForeignKey = crypto.randomUUID();
      const dto1 = readPermissionDto({aco_foreign_key: acoForeignKey});
      const dto2 = defaultPermissionDto({aco_foreign_key: acoForeignKey, type: 42});
      const dto3 = ownerPermissionDto({aco_foreign_key: acoForeignKey});

      expect.assertions(3);
      const collection = new permissionsCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto3.id);
    });
  });

  describe(":pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const count = 10_000;
      const dtos = defaultPermissionsDtos(count);

      const start = performance.now();
      const collection = new PermissionsCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(count);
      expect(time).toBeLessThan(5_000);
    });
  });

  describe("::addOrReplace", () => {
    it("should throw if the permission does not validate its schema", () => {
      expect.assertions(1);
      const collection = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      expect(() => collection.addOrReplace({}))
        .toThrowEntityValidationError("aco", "required");
    });

    it("should throw if the permission has the same id but does not validate the same aco build rule", () => {
      expect.assertions(1);
      const dto1 = updateFolderPermissionDto();
      const dto2 = ownerFolderPermissionDto({id: dto1.id});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      expect(() => collection.addOrReplace(dto2))
        .toThrowEntityValidationError("aco_foreign_key", "same_aco");
    });

    it("should throw if the permission is owned by a matching aro does not validate the same aco build rule", () => {
      expect.assertions(1);
      const dto1 = updateMinimalFolderPermissionDto();
      const dto2 = ownerMinimalFolderPermissionDto({aro: dto1.aro, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});

      expect(() => collection.addOrReplace(dto2))
        .toThrowEntityValidationError("aco_foreign_key", "same_aco");
    });

    it("should not throw if the owner build rules does not validate after adding or replacing a permission", () => {
      expect.assertions(2);
      const dto1 = readMinimalFolderPermissionDto();
      const dto2 = updateMinimalFolderPermissionDto({aco: dto1.aco, aco_foreign_key: dto1.aco_foreign_key});
      const dto3 = updateMinimalFolderPermissionDto({aco: dto1.aco, aco_foreign_key: dto1.aco_foreign_key, aro: dto1.aro, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(dto2);
      expect(collection.permissions.length).toBe(2);
      collection.addOrReplace(new PermissionEntity(dto3));
      expect(collection.permissions.length).toBe(2);
    });

    it("adds a permission to the collection if the collection is empty", () => {
      expect.assertions(3);
      const dto1 = ownerFolderPermissionDto();
      const collection = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      collection.addOrReplace(dto1);
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0]).toBeInstanceOf(PermissionEntity);
      expect(collection.permissions[0].id).toEqual(dto1.id);
    });

    it("adds a permission to the collection if there is no matching permission to replace", () => {
      expect.assertions(3);
      const dto1 = ownerFolderPermissionDto();
      const dto2 = ownerFolderPermissionDto({aco_foreign_key: dto1.aco_foreign_key});
      const collection = new PermissionsCollection([dto1]);
      collection.addOrReplace(dto2);
      expect(collection.permissions.length).toBe(2);
      expect(collection.permissions[0].id).toEqual(dto1.id);
      expect(collection.permissions[1].id).toEqual(dto2.id);
    });

    it("replaces permission matching the same id if new permission has higher access right", () => {
      expect.assertions(3);
      const dto1 = updateFolderPermissionDto();
      const dto2 = ownerFolderPermissionDto({id: dto1.id, aco_foreign_key: dto1.aco_foreign_key, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(new PermissionEntity(dto2));
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0].id).toEqual(dto1.id);
      expect(collection.permissions[0].type).toEqual(dto2.type);
    });

    it("does not replace permission matching the same id if new permission does not have higher access right", () => {
      expect.assertions(3);
      const dto1 = ownerFolderPermissionDto();
      const dto2 = updateFolderPermissionDto({id: dto1.id, aco_foreign_key: dto1.aco_foreign_key, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(new PermissionEntity(dto2));
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0].id).toEqual(dto1.id);
      expect(collection.permissions[0].type).toEqual(dto1.type);
    });

    it("replaces permission matching the same aro/aco if new permission has higher access right", () => {
      expect.assertions(2);
      const dto1 = updateMinimalFolderPermissionDto();
      const dto2 = ownerMinimalFolderPermissionDto({aco_foreign_key: dto1.aco_foreign_key, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(new PermissionEntity(dto2));
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0].type).toEqual(dto2.type);
    });

    it("does not replace permission matching the same aro/aco if new permission does not have higher access right", () => {
      expect.assertions(2);
      const dto1 = ownerMinimalFolderPermissionDto();
      const dto2 = updateMinimalFolderPermissionDto({aco_foreign_key: dto1.aco_foreign_key, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(new PermissionEntity(dto2));
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0].type).toEqual(dto1.type);
    });

    it("identifies new permission as replacement if same aco/aro but new permission has no id and existing one has one", () => {
      expect.assertions(3);
      const dto1 = updateFolderPermissionDto();
      const dto2 = ownerMinimalFolderPermissionDto({aco_foreign_key: dto1.aco_foreign_key, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(new PermissionEntity(dto2));
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0].type).toEqual(dto2.type);
      expect(collection.permissions[0].id).toBeNull();
    });

    it("identifies new permission as replacement if same aco/aro but new permission has id and existing one has none", () => {
      expect.assertions(3);
      const dto1 = updateMinimalFolderPermissionDto();
      const dto2 = ownerFolderPermissionDto({aco_foreign_key: dto1.aco_foreign_key, aro_foreign_key: dto1.aro_foreign_key});
      const collection = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      collection.addOrReplace(new PermissionEntity(dto2));
      expect(collection.permissions.length).toBe(1);
      expect(collection.permissions[0].type).toEqual(dto2.type);
      expect(collection.permissions[0].id).toEqual(dto2.id);
    });

    it("addOrReplace allow updating permissions to higher ones muliple manipulations", () => {
      const folderId = crypto.randomUUID();
      const user1Id = crypto.randomUUID();
      const user2Id = crypto.randomUUID();
      const user3Id = crypto.randomUUID();
      const dto1 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: user1Id});
      const dto2 = readMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: user2Id});
      const dto3 = readMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: user2Id});
      const dto4 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: user2Id});
      const dto5 = readMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: user2Id});
      const dto6 = readMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: user3Id});
      const collection = new PermissionsCollection([dto1, dto2]);

      // same same
      collection.addOrReplace(new permissionEntity(dto3));
      expect(collection.permissions.length).toBe(2);
      expect(collection.permissions[1].type).toBe(1);

      // but different
      collection.addOrReplace(new PermissionEntity(dto4));
      expect(collection.permissions.length).toBe(2);
      expect(collection.permissions[1].type).toBe(PermissionEntity.PERMISSION_OWNER);

      // now for something really different
      collection.addOrReplace(new PermissionEntity(dto5));
      expect(collection.permissions.length).toBe(2);
      expect(collection.permissions[1].type).toBe(PermissionEntity.PERMISSION_OWNER);

      // stop it already
      collection.addOrReplace(new PermissionEntity(dto6));
      expect(collection.permissions.length).toBe(3);
      expect(collection.permissions[2].type).toBe(1);
    });
  });

  describe("::sum", () => {
    it("union returns set1 + set2 - no overlap", () => {
      const folderId = crypto.randomUUID();
      const dto1 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto2 = readMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const set1 = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      const set2 = new PermissionsCollection([dto2], {assertAtLeastOneOwner: false});

      const set3 = PermissionsCollection.sum(set1, set2);
      expect(set3.toDto()).toEqual([dto1, dto2]);

      const set4 = PermissionsCollection.sum(set2, set1);
      expect(set4.toDto()).toEqual([dto2, dto1]);
    });

    it("union returns set1 + set2 - full overlap", () => {
      const folderId = crypto.randomUUID();
      const dto1 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto2 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto3 = updateMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const set1 = new PermissionsCollection([dto3, dto1, dto2], {assertAtLeastOneOwner: false});
      const set2 = new PermissionsCollection([dto1, dto3, dto2], {assertAtLeastOneOwner: false});

      const set3 = PermissionsCollection.sum(set1, set2);
      const set4 = PermissionsCollection.sum(set2, set1);
      expect(set3.toDto()).toEqual([dto3, dto1, dto2]);
      expect(set4.toDto()).toEqual([dto1, dto3, dto2]);
    });

    it("union returns set1 + set2 - overlap highest right wins", () => {
      const folderId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const dto1 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: userId});
      const dto2 = readMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: userId});
      const dto3 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: userId});
      const set1 = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      const set2 = new PermissionsCollection([dto2], {assertAtLeastOneOwner: false});

      const set3 = PermissionsCollection.sum(set1, set2);
      const set4 = PermissionsCollection.sum(set2, set1);
      const result = [dto3];
      expect(set3.toDto()).toEqual(result);
      expect(set4.toDto()).toEqual(result);
    });

    it("union returns set1 + set2 - empty left or right", () => {
      const folderId = crypto.randomUUID();
      const dto1 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto2 = readMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      const set2 = new PermissionsCollection([], {assertAtLeastOneOwner: false});

      const set3 = PermissionsCollection.sum(set1, set2);
      expect(set3.toDto()).toEqual([dto1, dto2]);

      const set4 = PermissionsCollection.sum(set2, set1);
      expect(set4.toDto()).toEqual([dto1, dto2]);
    });

    it("union returns set1 + set2 - now owner set throw error", () => {
      const folderId = crypto.randomUUID();
      const dto1 = updateMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto2 = readMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      const set2 = new PermissionsCollection([dto2], {assertAtLeastOneOwner: false});

      expect.assertions(1);
      expect(() => PermissionsCollection.sum(set1, set2))
        .toThrowCollectionValidationError("owner");
    });

    it("union returns set1 + set2 - not same aco throw error", () => {
      const dto1 = updateMinimalFolderPermissionDto();
      const dto2 = ownerMinimalFolderPermissionDto();
      const set1 = new PermissionsCollection([dto1], {assertAtLeastOneOwner: false});
      const set2 = new PermissionsCollection([dto2], {assertAtLeastOneOwner: false});

      expect.assertions(1);
      expect(() => PermissionsCollection.sum(set1, set2))
        .toThrowCollectionValidationError("0.aco_foreign_key.same_aco");
    });
  });

  describe("::toJSON", () => {
    it("must serialize with assoc", () => {
      const folderId = crypto.randomUUID();
      const dto1 = defaultPermissionDto({aco_foreign_key: folderId}, {withUser: true});
      const dto2 = defaultPermissionDto({aco_foreign_key: folderId}, {withGroup: true});
      const dtos = [dto1, dto2];

      const permissionCollection = new PermissionsCollection(dtos);
      const permissions = JSON.parse(JSON.stringify(permissionCollection));
      expect(permissions[0].user.profile.first_name).toBe('Ada');
      expect(permissions[0].user.profile.avatar.id).toBe(dto1.user.profile.avatar.id);
      expect(permissions[1].group.name).toBe('Current group');
    });
  });

  describe("::diff", () => {
    it("diff set1 - set2", () => {
      const folderId = crypto.randomUUID();
      const dto1 = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto2 = readMinimalFolderPermissionDto({aco_foreign_key: folderId});
      const dto3 = updateMinimalFolderPermissionDto({aco_foreign_key: folderId});
      let set1,
        set2,
        set3;

      // nothing to remove
      set1 = new PermissionsCollection([dto3], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([dto3]);

      // nothing to remove 2
      set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto3], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([dto1, dto2]);

      // nothing to change
      set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([]);

      // nothing left
      set1 = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([]);

      // nothing right
      set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([dto1, dto2]);

      // nothing at all
      set1 = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([]);

      // nothing left 2
      set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto1, dto2, dto3], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([]);

      // something left
      set1 = new PermissionsCollection([dto1, dto2], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto1, dto3], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([dto2]);

      // something left 2
      set1 = new PermissionsCollection([dto1, dto2, dto3], {assertAtLeastOneOwner: false});
      set2 = new PermissionsCollection([dto3], {assertAtLeastOneOwner: false});
      set3 = PermissionsCollection.diff(set1, set2, false);
      expect(set3.toDto()).toEqual([dto1, dto2]);
    });

    it("diff set1 - set2, part 2", () => {
      const folderId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const owner = ownerMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: userId});
      const read = readMinimalFolderPermissionDto({aco_foreign_key: folderId, aro_foreign_key: userId});
      let resultSet;

      // check remove equal or lower
      const ownerSet = new PermissionsCollection([owner], {assertAtLeastOneOwner: false});
      const readSet = new PermissionsCollection([read], {assertAtLeastOneOwner: false});
      resultSet = PermissionsCollection.diff(ownerSet, readSet, false);
      expect(resultSet.toDto()).toEqual([owner]);
      resultSet = PermissionsCollection.diff(readSet, ownerSet, false);
      expect(resultSet.toDto()).toEqual([]);
      resultSet = PermissionsCollection.diff(ownerSet, ownerSet, false);
      expect(resultSet.toDto()).toEqual([]);
    });
  });
});
