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

import AvatarEntity from "./avatarEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {
  defaultAvatarDto,
  minimalAvatarDto
} from "passbolt-styleguide/src/shared/models/entity/avatar/avatarEntity.test.data";
import Validator from "validator";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("AvatarEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AvatarEntity.ENTITY_NAME, AvatarEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(AvatarEntity, "id");
      assertEntityProperty.uuid(AvatarEntity, "id");
      assertEntityProperty.notRequired(AvatarEntity, "id");
    });

    it("validates created property", () => {
      assertEntityProperty.string(AvatarEntity, "created");
      assertEntityProperty.dateTime(AvatarEntity, "created");
      assertEntityProperty.notRequired(AvatarEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(AvatarEntity, "modified");
      assertEntityProperty.dateTime(AvatarEntity, "modified");
      assertEntityProperty.notRequired(AvatarEntity, "modified");
    });
  });

  describe("::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(5);
      const dto = minimalAvatarDto();
      const entity = new AvatarEntity(dto);
      expect(entity.id).toBeNull();
      expect(entity.urlMedium).toEqual('img/avatar/user_medium.png');
      expect(entity.urlSmall).toEqual('img/avatar/user.png');
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
    });

    it("works if valid DTO is provided with optional properties", () => {
      expect.assertions(5);
      const dto = defaultAvatarDto();
      const entity = new AvatarEntity(dto);
      expect(Validator.isUUID(entity.id)).toBe(true);
      expect(entity.urlMedium).toEqual('/avatars/view/e6927385-195c-4c7f-a107-a202ea86de40/medium.jpg');
      expect(entity.urlSmall).toEqual('/avatars/view/e6927385-195c-4c7f-a107-a202ea86de40/small.jpg');
      expect(entity.created).toEqual('2023-06-03T12:03:46+00:00');
      expect(entity.modified).toEqual('2023-06-03T12:03:46+00:00');
    });

    it("Should throw if invalid avatar url provided", async() => {
      expect.assertions(1);
      const dto = defaultAvatarDto({
        url: {}
      });
      expect(() => new AvatarEntity(dto)).toThrowEntityValidationError("small", "required");
    });
  });

  describe("::toDto", () => {
    it("should return the expected data", () => {
      expect.assertions(6);
      const dto = defaultAvatarDto();
      const entity = new AvatarEntity(dto);
      const resultDto = entity.toDto();
      expect(resultDto).toEqual(dto);
      expect(resultDto.id).toEqual(dto.id);
      expect(resultDto.created).toEqual(dto.created);
      expect(resultDto.modified).toEqual(dto.modified);
      expect(resultDto.url.small).toEqual(dto.url.small);
      expect(resultDto.url.medium).toEqual(dto.url.medium);
    });
  });
});
