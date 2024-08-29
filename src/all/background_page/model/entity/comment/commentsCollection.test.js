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
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import CommentsCollection from "./commentsCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultCommentDto, minimumCommentDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntity.test.data";
import {defaultCommentCollectionDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntityCollection.test.data";
import {v4 as uuidv4} from "uuid";

describe("CommentsCollection entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(CommentsCollection.ENTITY_NAME, CommentsCollection.getSchema());
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);
      const collection = new CommentsCollection([]);
      expect(collection).toHaveLength(0);
    });
    it("works if valid minimal DTOs are provided", () => {
      expect.assertions(4);

      const dto = [minimumCommentDto()];
      const collection = new CommentsCollection(dto);

      expect(dto).toEqual(collection.toDto());
      expect(dto).toEqual(collection.toJSON());
      expect(collection.items[0].content).toEqual('minimum content');
      expect(collection.userIds).toEqual([dto[0].user_id]);
    });

    it("works if valid complete entities are provided", () => {
      expect.assertions(6);

      const dto = defaultCommentCollectionDto();
      const collection = new CommentsCollection(dto);

      expect(dto).toEqual(collection.toDto());
      expect(dto).toEqual(collection.toJSON());
      expect(collection.items[0].content).toEqual('comment2');
      expect(collection.items[1].content).toEqual('comment2');
      expect(collection.ids).toEqual([dto[0].id, dto[1].id, dto[2].id, dto[3].id]);
      expect(collection.userIds).toEqual([dto[0].user_id, dto[1].user_id, dto[2].user_id, dto[3].user_id]);
    });
    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new CommentsCollection({}))
        .toThrowEntityValidationError("items");
    });
    it("should throw if the collection schema does not validate the unique content", () => {
      const comment1 =  defaultCommentDto();
      const dto = [comment1, comment1];

      const t = () => { new CommentsCollection(dto); };
      expect(t).toThrow(CollectionValidationError);
    });

    it("should throw if the collection schema does not validate the same foreign id", () => {
      const comment1 = defaultCommentDto();
      const comment2 = defaultCommentDto({
        foreign_key: uuidv4()
      });
      const dto = [comment1, comment2];

      const t = () => { new CommentsCollection(dto); };
      expect(t).toThrow(CollectionValidationError);
    });
  });
});
