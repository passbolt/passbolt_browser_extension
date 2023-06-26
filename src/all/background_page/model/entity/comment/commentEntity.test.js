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
 * @since         3.0.0
 */
import CommentEntity from "./commentEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const minimalDto = {
  "user_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
  "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
  "foreign_model": "Resource",
  "content": "Test comment"
};

describe("Comment entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(CommentEntity.ENTITY_NAME, CommentEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = minimalDto;
    const entity = new CommentEntity(dto);

    // Test mandatory field getters
    expect(entity.toDto()).toEqual(dto);
    expect(entity.content).toBe(minimalDto.content);
    expect(entity.foreignKey).toBe(minimalDto.foreign_key);
    expect(entity.foreignModel).toBe(minimalDto.foreign_model);
    expect(entity.userId).toBe(minimalDto.user_id);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      // required
      "user_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "foreign_model": "Resource",
      "content": "Test comment",
      // optional
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "parent_id": "c58de6d3-f52c-5080-b79b-a601a647ac85",
      "modified": "2020-03-26T11:14:02+00:00",
      "created": "2020-03-26T11:14:02+00:00",
      "created_by": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "modified_by": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      // non supported
      "_type": "None"
    };
    const filtered = {
      // required
      "user_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "foreign_model": "Resource",
      "content": "Test comment",
      // optional
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "parent_id": "c58de6d3-f52c-5080-b79b-a601a647ac85",
      "modified": "2020-03-26T11:14:02+00:00",
      "created": "2020-03-26T11:14:02+00:00",
      "created_by": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "modified_by": "a58de6d3-f52c-5080-b79b-a601a647ac85"
    };
    const entity = new CommentEntity(dto);
    expect(entity.toDto()).toEqual(filtered);

    // Test optional field getters
    expect(entity.parentId).toBe(filtered.parent_id);
    expect(entity.modified).toBe(filtered.modified);
    expect(entity.created).toBe(filtered.created);
    expect(entity.modifiedBy).toBe(filtered.modified_by);
    expect(entity.createdBy).toBe(filtered.created_by);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    const required = ["user_id", "foreign_key", "foreign_model", "content"];
    for (const i in required) {
      const sut = Object.assign(minimalDto);
      if (Object.prototype.hasOwnProperty.call(required, i) && Object.prototype.hasOwnProperty.call(sut, required[i])) {
        const field = required[i];
        delete sut[field];
        const t = () => {
          new CommentEntity(sut);
        };
        expect(t).toThrow(EntityValidationError);
      } else {
        expect(false).toBe(true);
      }
    }
  });

  it("constructor returns validation error if dto uuids are invalid", () => {
    const uuids = ["id", "user_id", "foreign_key", "parent_id", "created_by", "modified_by"];
    const dto = {
      // required
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "user_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "foreign_key": "7f077753-0835-4054-92ee-556660ea04f1",
      "parent_id": "c58de6d3-f52c-5080-b79b-a601a647ac85",
      "created_by": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "modified_by": "a58de6d3-f52c-5080-b79b-a601a647ac85"
    };
    for (const i in uuids) {
      const sut = Object.assign(dto);
      if (Object.prototype.hasOwnProperty.call(uuids, i) && Object.prototype.hasOwnProperty.call(sut, uuids[i])) {
        sut[uuids[i]] = 'not a uuid';
        const t = () => { new CommentEntity(sut); };
        expect(t).toThrow(EntityValidationError);
      } else {
        expect(false).toBe(true);
      }
    }
  });

  it('serialization should work with associated user model for creator / modifier', () => {
    const dto = {
      "id": "2584801d-9141-44ff-ae05-ca0f8ff1dba2",
      "parent_id": null,
      "foreign_key": "5fe06fae-4fa0-4a7e-82dd-46d96c63733a",
      "foreign_model": "Resource",
      "content": "comment2",
      "created": "2020-09-03T09:54:10+00:00",
      "modified": "2020-09-03T09:54:10+00:00",
      "created_by": "f848277c-5398-58f8-a82a-72397af2d450",
      "modified_by": "f848277c-5398-58f8-a82a-72397af2d450",
      "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
      "modifier": {
        "id": "f848277c-5398-58f8-a82a-72397af2d450",
        "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
        "username": "ada@passbolt.com",
        "active": true,
        "deleted": false,
        "created": "2020-07-02T07:23:20+00:00",
        "modified": "2020-08-02T07:23:20+00:00",
        "profile": {
          "id": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
          "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
          "first_name": "Ada",
          "last_name": "Lovelace",
          "created": "2020-09-02T07:23:20+00:00",
          "modified": "2020-09-02T07:23:20+00:00",
          "avatar": {
            "id": "b98d0c19-c798-41b4-bcb9-8d44036f3234",
            "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
            "foreign_key": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
            "created": "2020-09-02T07:23:21+00:00",
            "modified": "2020-09-02T07:23:21+00:00",
            "url": {
              "medium": "img\/public\/Avatar\/f5\/02\/2f\/b98d0c19c79841b4bcb98d44036f3234\/b98d0c19c79841b4bcb98d44036f3234.a99472d5.png",
              "small": "img\/public\/Avatar\/f5\/02\/2f\/b98d0c19c79841b4bcb98d44036f3234\/b98d0c19c79841b4bcb98d44036f3234.65a0ba70.png"
            }
          }
        }
      },
      "creator": {
        "id": "f848277c-5398-58f8-a82a-72397af2d450",
        "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
        "username": "ada@passbolt.com",
        "active": true,
        "deleted": false,
        "created": "2020-07-02T07:23:20+00:00",
        "modified": "2020-08-02T07:23:20+00:00",
        "profile": {
          "id": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
          "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
          "first_name": "Ada",
          "last_name": "Lovelace",
          "created": "2020-09-02T07:23:20+00:00",
          "modified": "2020-09-02T07:23:20+00:00",
          "avatar": {
            "id": "b98d0c19-c798-41b4-bcb9-8d44036f3234",
            "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
            "foreign_key": "99522cc9-0acc-5ae2-b996-d03bded3c0a6",
            "created": "2020-09-02T07:23:21+00:00",
            "modified": "2020-09-02T07:23:21+00:00",
            "url": {
              "medium": "img\/public\/Avatar\/f5\/02\/2f\/b98d0c19c79841b4bcb98d44036f3234\/b98d0c19c79841b4bcb98d44036f3234.a99472d5.png",
              "small": "img\/public\/Avatar\/f5\/02\/2f\/b98d0c19c79841b4bcb98d44036f3234\/b98d0c19c79841b4bcb98d44036f3234.65a0ba70.png"
            }
          }
        }
      }
    };
    const entity = new CommentEntity(dto);
    expect(entity.creator.username).toBe('ada@passbolt.com');
    expect(entity.creator.profile.firstName).toBe('Ada');
    expect(entity.creator.profile.avatar.urlMedium).toBe('img\/public\/Avatar\/f5\/02\/2f\/b98d0c19c79841b4bcb98d44036f3234\/b98d0c19c79841b4bcb98d44036f3234.a99472d5.png');

    const serializedDto = entity.toDto();
    expect(Object.prototype.hasOwnProperty.call(serializedDto, 'creator')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(serializedDto, 'modifier')).toBe(false);

    const serializedDtoWithAssoc = entity.toDto({creator: true, modifier: true});
    expect(Object.prototype.hasOwnProperty.call(serializedDtoWithAssoc, 'creator')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(serializedDtoWithAssoc, 'modifier')).toBe(true);
  });
});
