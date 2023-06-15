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
import CommentsCollection from "./commentsCollection";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Comment entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(CommentsCollection.ENTITY_NAME, CommentsCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const comment1 = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac82",
      "user_id": "b58de6d3-f52c-5080-b79b-a601a647ac82",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "foreign_model": "Resource",
      "content": "comment1"
    };
    const comment2 = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac83",
      "user_id": "b58de6d3-f52c-5080-b79b-a601a647ac83",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "foreign_model": "Resource",
      "content": "comment2"
    };
    const dto = [comment1, comment2];
    const entity = new CommentsCollection(dto);
    const expected = [comment1, comment2];
    expect(expected).toEqual(entity.toDto());
    expect(expected).toEqual(entity.toJSON());
    expect(JSON.stringify(entity)).toEqual(JSON.stringify(expected));
    expect(entity.items[0].content).toEqual('comment1');
    expect(entity.items[1].content).toEqual('comment2');
    expect(entity.ids).toEqual(['a58de6d3-f52c-5080-b79b-a601a647ac82', 'a58de6d3-f52c-5080-b79b-a601a647ac83']);
    expect(entity.userIds).toEqual(['b58de6d3-f52c-5080-b79b-a601a647ac82', 'b58de6d3-f52c-5080-b79b-a601a647ac83']);
  });

  it("constructor fails if reusing same comment", () => {
    const comment1 =  {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac82",
      "user_id": "b58de6d3-f52c-5080-b79b-a601a647ac82",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "foreign_model": "Resource",
      "content": "comment1"
    };
    const dto = [comment1, comment1];

    const t = () => { new CommentsCollection(dto); };
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if not the same foreign id", () => {
    const comment1 = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac81",
      "user_id": "b58de6d3-f52c-5080-b79b-a601a647ac81",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "foreign_model": "Resource",
      "content": "comment1"
    };
    const comment2 = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac82",
      "user_id": "b58de6d3-f52c-5080-b79b-a601a647ac82",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f2",
      "foreign_model": "Resource",
      "content": "comment2"
    };
    const dto = [comment1, comment2];

    const t = () => { new CommentsCollection(dto); };
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor works with empty collection", () => {
    const collection = new CommentsCollection([]);
    expect(collection.ids).toEqual([]);
  });
});
