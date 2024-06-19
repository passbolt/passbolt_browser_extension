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
 * @since         4.9.0
 */
import UserAndGroupSearchResultsCollection from "./userAndGroupSearchResultCollection";
import UserAndGroupSearchResultEntity from "./userAndGroupSearchResultEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultGroupSearchResultDto, defaultUserSearchResultDto} from "./userAndGroupSearchResultEntity.test.data";

describe("UserAndGroupSearchResultCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UserAndGroupSearchResultsCollection.ENTITY_NAME, UserAndGroupSearchResultsCollection.getSchema());
  });

  describe("UserAndGroupSearchResultsCollection::constructor", () => {
    it("works with empty collection", () => {
      new UserAndGroupSearchResultsCollection([]);
    });

    it("works if valid array of DTOs is provided", () => {
      const dto1 = defaultGroupSearchResultDto({name: "Group 1", user_count: 2});
      const dto2 = defaultGroupSearchResultDto({name: "Group 2", user_count: 5});
      const dto3 = defaultUserSearchResultDto({username: "user1@passbolt.com"});
      const dto4 = defaultUserSearchResultDto({username: "user2@passbolt.com"});
      const dtos = [dto1, dto2, dto3, dto4];
      const collection = new UserAndGroupSearchResultsCollection(dtos);

      expect.assertions(17);
      expect(collection.items).toHaveLength(4);
      const item0 = collection.items[0];
      const item1 = collection.items[1];
      const item2 = collection.items[2];
      const item3 = collection.items[3];
      expect(item0).toBeInstanceOf(UserAndGroupSearchResultEntity);
      expect(item0._props.id).toStrictEqual(dto1.id);
      expect(item0._props.name).toStrictEqual(dto1.name);
      expect(item0._props.user_count).toStrictEqual(dto1.user_count);
      expect(item1).toBeInstanceOf(UserAndGroupSearchResultEntity);
      expect(item1._props.id).toStrictEqual(dto2.id);
      expect(item1._props.name).toStrictEqual(dto2.name);
      expect(item1._props.user_count).toStrictEqual(dto2.user_count);
      expect(item2).toBeInstanceOf(UserAndGroupSearchResultEntity);
      expect(item2._props.id).toStrictEqual(dto3.id);
      expect(item2._props.username).toStrictEqual(dto3.username);
      expect(item2._props.profile).toStrictEqual(dto3.profile);
      expect(item3).toBeInstanceOf(UserAndGroupSearchResultEntity);
      expect(item3._props.id).toStrictEqual(dto4.id);
      expect(item3._props.username).toStrictEqual(dto4.username);
      expect(item3._props.profile).toStrictEqual(dto4.profile);
    });

    it("works if valid entities are provided", () => {
      const entity1 = new UserAndGroupSearchResultEntity(defaultUserSearchResultDto());
      const entity2 = new UserAndGroupSearchResultEntity(defaultGroupSearchResultDto());
      const dtos = [entity1, entity2];
      const collection = new UserAndGroupSearchResultsCollection(dtos);

      const item0 = collection.items[0];
      const item1 = collection.items[1];

      expect.assertions(9);
      expect(collection.items).toHaveLength(2);
      expect(item0).toBeInstanceOf(UserAndGroupSearchResultEntity);
      expect(item0._props.id).toStrictEqual(entity1._props.id);
      expect(item0._props.name).toStrictEqual(entity1._props.name);
      expect(item0._props.user_count).toStrictEqual(entity1._props.user_count);
      expect(item1).toBeInstanceOf(UserAndGroupSearchResultEntity);
      expect(item1._props.id).toStrictEqual(entity2._props.id);
      expect(item1._props.name).toStrictEqual(entity2._props.name);
      expect(item1._props.user_count).toStrictEqual(entity2._props.user_count);
    });
  });

  describe("UsersCollection:toDto", () => {
    it("should transform the collection items in dto format", () => {
      const dto1 = defaultUserSearchResultDto();
      const dto2 = defaultGroupSearchResultDto();
      const dtos = [dto1, dto2];
      const collection = new UserAndGroupSearchResultsCollection(dtos);

      expect.assertions(1);
      expect(collection.toDto()).toStrictEqual(dtos);
    });
  });
});
