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
import UsersCollection from "./usersCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import UserEntity from "./userEntity";
import {defaultGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";

describe("UsersCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UsersCollection.ENTITY_NAME, UsersCollection.getSchema());
  });

  describe("UsersCollection::constructor", () => {
    it("works with empty collection", () => {
      new UsersCollection([]);
    });

    it("works if valid array of DTOs is provided", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"});
      const dto2 = defaultUserDto({username: "user2@passbolt.com"});
      const dto3 = defaultUserDto({username: "user3@passbolt.com"});
      const dtos = [dto1, dto2, dto3];
      const collection = new UsersCollection(dtos);

      expect.assertions(31);
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(UserEntity);
      expect(collection.items[0]._props.id).toEqual(dto1.id);
      expect(collection.items[0]._props.username).toEqual(dto1.username);
      expect(collection.items[0]._props.active).toEqual(dto1.active);
      expect(collection.items[0]._props.deleted).toEqual(dto1.deleted);
      expect(collection.items[0]._props.created).toEqual(dto1.created);
      expect(collection.items[0]._props.modified).toEqual(dto1.modified);
      expect(collection.items[0]._props.last_logged_in).toEqual(dto1.last_logged_in);
      expect(collection.items[0]._props.is_mfa_enabled).toEqual(dto1.is_mfa_enabled);
      expect(collection.items[0]._props.locale).toEqual(dto1.locale);
      expect(collection.items[1]).toBeInstanceOf(UserEntity);
      expect(collection.items[1]._props.id).toEqual(dto2.id);
      expect(collection.items[1]._props.username).toEqual(dto2.username);
      expect(collection.items[1]._props.active).toEqual(dto2.active);
      expect(collection.items[1]._props.deleted).toEqual(dto2.deleted);
      expect(collection.items[1]._props.created).toEqual(dto2.created);
      expect(collection.items[1]._props.modified).toEqual(dto2.modified);
      expect(collection.items[1]._props.last_logged_in).toEqual(dto2.last_logged_in);
      expect(collection.items[1]._props.is_mfa_enabled).toEqual(dto2.is_mfa_enabled);
      expect(collection.items[1]._props.locale).toEqual(dto2.locale);
      expect(collection.items[2]).toBeInstanceOf(UserEntity);
      expect(collection.items[2]._props.id).toEqual(dto3.id);
      expect(collection.items[2]._props.username).toEqual(dto3.username);
      expect(collection.items[2]._props.active).toEqual(dto3.active);
      expect(collection.items[2]._props.deleted).toEqual(dto3.deleted);
      expect(collection.items[2]._props.created).toEqual(dto3.created);
      expect(collection.items[2]._props.modified).toEqual(dto3.modified);
      expect(collection.items[2]._props.last_logged_in).toEqual(dto3.last_logged_in);
      expect(collection.items[2]._props.is_mfa_enabled).toEqual(dto3.is_mfa_enabled);
      expect(collection.items[2]._props.locale).toEqual(dto3.locale);
    });

    it("works if valid user entities is provided", () => {
      const entity = new UserEntity(defaultUserDto());
      const dtos = [entity];
      const collection = new UsersCollection(dtos);

      expect.assertions(11);
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0]).toBeInstanceOf(UserEntity);
      expect(collection.items[0]._props.id).toEqual(entity._props.id);
      expect(collection.items[0]._props.username).toEqual(entity._props.username);
      expect(collection.items[0]._props.active).toEqual(entity._props.active);
      expect(collection.items[0]._props.deleted).toEqual(entity._props.deleted);
      expect(collection.items[0]._props.created).toEqual(entity._props.created);
      expect(collection.items[0]._props.modified).toEqual(entity._props.modified);
      expect(collection.items[0]._props.last_logged_in).toEqual(entity._props.last_logged_in);
      expect(collection.items[0]._props.is_mfa_enabled).toEqual(entity._props.is_mfa_enabled);
      expect(collection.items[0]._props.locale).toEqual(entity._props.locale);
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = defaultUserDto();
      const dto2 = defaultUserDto({username: 42});

      expect.assertions(1);
      expect(() => new UsersCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.username.type");
    });

    /*
     * @todo Associated entities validation error details to review when collection will aggregate them.
     * @see EntityV2Collection.pushMany
     */
    it("should throw if one of data item does not validate the collection associated entity schema", () => {
      const dto1 = defaultUserDto();
      const dto2 = defaultUserDto({
        groups_users: [
          defaultGroupUser({group_id: 42, is_admin: true})
        ]
      });

      expect.assertions(2);
      // Should not throw
      expect(() => new UsersCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.0.group_id.type");
      // Should throw
      expect(() => new UsersCollection([dto1, dto2]))
        .not.toThrowCollectionValidationError("1.groups_users.0.group_id.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"});
      const dto2 = defaultUserDto({id: dto1.id, username: "user2@passbolt.com"});
      const dto3 = defaultUserDto({username: "user3@passbolt.com"});

      expect.assertions(1);
      expect(() => new UsersCollection([dto1, dto2, dto3]))
        .toThrowCollectionValidationError("1.id.unique");
    });

    it("should throw if one of data item does not validate the unique username build rule", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"});
      const dto2 = defaultUserDto({username: dto1.username});
      const dto3 = defaultUserDto({username: "user3@passbolt.com"});

      expect.assertions(1);
      expect(() => new UsersCollection([dto1, dto2, dto3]))
        .toThrowCollectionValidationError("1.username.unique");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      const dto1 = defaultUserDto();
      const dto2 = defaultUserDto({username: 42});

      expect.assertions(2);
      const collection = new UsersCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique id build rule", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"});
      const dto2 = defaultUserDto({id: dto1.id, username: "user2@passbolt.com"});

      expect.assertions(2);
      const collection = new UsersCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique username build rule", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"});
      const dto2 = defaultUserDto({username: dto1.username});

      expect.assertions(2);
      const collection = new UsersCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });

    it("should, with enabling the ignore invalid option, ignore items associated groups users entities which do not validate the group users user_id schema validation", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"}, {withGroupsUsers: true});
      const dto2 = defaultUserDto({
        username: "user2@passbolt.com",
        groups_users: [
          defaultGroupUser({user_id: 42, is_admin: true})
        ]
      });
      const dto3 = defaultUserDto({username: "user3@passbolt.com"}, {withGroupsUsers: true});

      expect.assertions(7);
      const collection = new UsersCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[0]._groups_users).toHaveLength(1);
      expect(collection.items[1].id).toEqual(dto2.id);
      expect(collection.items[1]._groups_users).toHaveLength(0);
      expect(collection.items[2].id).toEqual(dto3.id);
      expect(collection.items[2]._groups_users).toHaveLength(1);
    });
  });

  describe("UsersCollection:toDto", () => {
    it("should transform the collection items in dto format", () => {
      const dto1 = defaultUserDto({username: "user1@passbolt.com"});
      const dto2 = defaultUserDto({username: "user2@passbolt.com"});
      const dto3 = defaultUserDto({username: "user3@passbolt.com"});
      const dtos = [dto1, dto2, dto3];
      const collection = new UsersCollection(dtos);

      expect.assertions(2);
      expect(collection.toDto()).toEqual(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
    });
  });

  describe("sanitizeDto", () => {
    it("should remove groups users that don't validate from users ", () => {
      const groupUser1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a01a",
        "group_id": "10801423-4151-42a4-99d1-86e66145a08c",
        "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "is_admin": true
      };
      const groupUser2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a01b",
        "group_id": null,
        "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec857",
        "is_admin": true
      };
      const user1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "username": "admin@passbolt.com",
        "groups_users": [groupUser1, groupUser2]
      };
      const user2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08d",
        "username": "ada@passbolt.com",
        "groups_users": [groupUser1, groupUser2]
      };

      const santitizedDto = UsersCollection.sanitizeDto([user1, user2]);
      expect(santitizedDto).toHaveLength(2);
      expect(santitizedDto[0].groups_users).toHaveLength(1);
      expect(santitizedDto[0].groups_users).toEqual(expect.arrayContaining([groupUser1]));
      expect(santitizedDto[1].groups_users).toHaveLength(1);
      expect(santitizedDto[1].groups_users).toEqual(expect.arrayContaining([groupUser1]));

      const collection = new UsersCollection(santitizedDto);
      expect(collection).toHaveLength(2);
    });
  });
});
