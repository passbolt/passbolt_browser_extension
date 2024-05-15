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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {
  defaultProfileDto,
  minimalProfileDto
} from "passbolt-styleguide/src/shared/models/entity/profile/ProfileEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import ProfileEntity from "./profileEntity";
import {defaultAvatarDto} from "passbolt-styleguide/src/shared/models/entity/avatar/avatarEntity.test.data";

describe("ProfileEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ProfileEntity.ENTITY_NAME, ProfileEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(ProfileEntity, "id");
      assertEntityProperty.uuid(ProfileEntity, "id");
      assertEntityProperty.notRequired(ProfileEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.string(ProfileEntity, "user_id");
      assertEntityProperty.uuid(ProfileEntity, "user_id");
      assertEntityProperty.notRequired(ProfileEntity, "user_id");
    });

    it("validates first_name property", () => {
      assertEntityProperty.string(ProfileEntity, "first_name");
      assertEntityProperty.minLength(ProfileEntity, "first_name", 1);
      assertEntityProperty.maxLength(ProfileEntity, "first_name", 255);
      assertEntityProperty.required(ProfileEntity, "first_name");
    });

    it("validates last_name property", () => {
      assertEntityProperty.string(ProfileEntity, "last_name");
      assertEntityProperty.minLength(ProfileEntity, "last_name", 1);
      assertEntityProperty.maxLength(ProfileEntity, "last_name", 255);
      assertEntityProperty.required(ProfileEntity, "last_name");
    });

    it("validates created property", () => {
      assertEntityProperty.string(ProfileEntity, "created");
      assertEntityProperty.dateTime(ProfileEntity, "created");
      assertEntityProperty.notRequired(ProfileEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(ProfileEntity, "modified");
      assertEntityProperty.dateTime(ProfileEntity, "modified");
      assertEntityProperty.notRequired(ProfileEntity, "modified");
    });
  });

  describe("::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      const dto = minimalProfileDto();
      const entity = new ProfileEntity(dto);
      expect(entity.id).toBeNull();
      expect(entity.userId).toBeNull();
      expect(entity.firstName).toEqual('Ada');
      expect(entity.lastName).toEqual('Lovelace');
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
      expect(entity.avatar).toBeNull();
    });

    it("works if valid DTO is provided with optional properties", () => {
      const dto = defaultProfileDto();
      const entity = new ProfileEntity(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.firstName).toEqual('Ada');
      expect(entity.lastName).toEqual('Lovelace');
      expect(entity.created).toEqual("2020-04-20T11:32:17+00:00");
      expect(entity.modified).toEqual("2020-04-20T11:32:17+00:00");
      expect(entity.avatar).not.toBeNull();
      expect(entity.avatar.urlMedium).toEqual("/avatars/view/e6927385-195c-4c7f-a107-a202ea86de40/medium.jpg");
      expect(entity.avatar.urlSmall).toEqual("/avatars/view/e6927385-195c-4c7f-a107-a202ea86de40/small.jpg");
    });

    it("Should throw if invalid avatar provided", async() => {
      expect.assertions(1);
      const dto = defaultProfileDto({
        avatar: defaultAvatarDto({id: "invalid-id"})
      });
      expect(() => new ProfileEntity(dto)).toThrowEntityValidationError("id", "format");
    });
  });

  describe("ProfileEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(2);
      const expectedKeys = [
        "id",
        "user_id",
        "first_name",
        "last_name",
        "created",
        "modified"
      ];

      const dto = defaultProfileDto();
      const entity = new ProfileEntity(dto);
      const resultDto = entity.toDto();
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
    });

    it("should return the expected properties containing the associated avatar.", () => {
      expect.assertions(2);
      const expectedKeys = [
        "id",
        "user_id",
        "first_name",
        "last_name",
        "created",
        "modified",
        "avatar"
      ];

      const dto = defaultProfileDto();
      const entity = new ProfileEntity(dto);
      const resultDto = entity.toDto({avatar: true});
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
    });
  });
});
