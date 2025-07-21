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
 * @since         5.4.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import UpdatedPermissionsCollection from "./updatedPermissionsCollection";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {defaultGroupDto} from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import {defaultUpdatePermissionDto} from "./updatedPermissionEntity.test.data";
import UpdatedPermissionEntity from "./updatedPermissionEntity";

describe("UpdatedPermissionsCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UpdatedPermissionsCollection.ENTITY_NAME, UpdatedPermissionsCollection.getSchema());
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);
      const collection = new UpdatedPermissionsCollection([]);
      expect(collection).toHaveLength(0);
    });

    it("works if valid DTOs are provided", () => {
      expect.assertions(6);

      const dto1 = defaultUpdatePermissionDto({user: defaultUserDto()});
      const dto2 = defaultUpdatePermissionDto({group: defaultGroupDto()});
      const dtos = [dto1, dto2];
      const collection = new UpdatedPermissionsCollection(dtos);

      expect(collection.items).toHaveLength(2);
      expect(collection.toDto()).toEqual(dtos);

      expect(collection.items[0]).toBeInstanceOf(UpdatedPermissionEntity);
      expect(collection.items[0].toDto(UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(dto1);
      expect(collection.items[1]).toBeInstanceOf(UpdatedPermissionEntity);
      expect(collection.items[1].toDto(UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto2);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new UpdatedPermissionsCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      expect.assertions(1);

      const dto1 = defaultUpdatePermissionDto();
      const dto2 = defaultUpdatePermissionDto({user: 42});

      expect(() => new UpdatedPermissionsCollection([dto1, dto2])).toThrow();
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      expect.assertions(1);

      const dto1 = defaultUpdatePermissionDto();

      expect(() => new UpdatedPermissionsCollection([dto1, dto1])).toThrow();
    });
  });

  describe("::sortPermissionsByGranteeTypeAndName", () => {
    it("should order users by their name", () => {
      expect.assertions(3);

      const userA = defaultUserDto();
      userA.profile.first_name = "user A";
      const userB = defaultUserDto();
      userB.profile.first_name = "user B";

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: userA}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: userB}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(-1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionA)).toStrictEqual(0);
    });

    it("should consider equal permisions with users having the same name", () => {
      expect.assertions(1);

      const userA = defaultUserDto();
      userA.profile.first_name = "user";
      const userB = defaultUserDto();
      userB.profile.first_name = "user";

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: userA}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: userB}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(0);
    });

    it("should put user without definition after users with definition", () => {
      expect.assertions(2);

      const userB = defaultUserDto();
      userB.profile.first_name = "user B";

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: userB}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(-1);
    });

    it("both undfined users should be considered equal", () => {
      expect.assertions(1);

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(0);
    });

    it("should order groups by their name", () => {
      expect.assertions(3);

      const groupA = defaultGroupDto({name: "Group A"});
      const groupB = defaultGroupDto({name: "Group B"});

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: groupA}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: groupB}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(-1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionA)).toStrictEqual(0);
    });

    it("should consider equal permisions with groups having the same name", () => {
      expect.assertions(1);

      const groupA = defaultGroupDto({name: "Group"});
      const groupB = defaultGroupDto({name: "Group"});

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: groupA}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: groupB}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(0);
    });

    it("should put group without definition after groups with definition", () => {
      expect.assertions(2);

      const groupB = defaultGroupDto({name: "Group B"});

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: null}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: groupB}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(-1);
    });

    it("should put group after users", () => {
      expect.assertions(2);

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: defaultGroupDto()}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: defaultUserDto()}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(-1);
    });

    it("should put undefined group after users", () => {
      expect.assertions(2);

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: null}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: defaultUserDto()}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(-1);
    });

    it("should put undefined users after group", () => {
      expect.assertions(2);

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null,  group: defaultGroupDto()}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(-1);
      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionB, permissionA)).toStrictEqual(1);
    });

    it("should put undefined grantees at the same level", () => {
      expect.assertions(1);

      const permissionA = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: null}));
      const permissionB = new UpdatedPermissionEntity(defaultUpdatePermissionDto({user: null, group: null}));

      expect(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName(permissionA, permissionB)).toStrictEqual(0);
    });
  });
});
