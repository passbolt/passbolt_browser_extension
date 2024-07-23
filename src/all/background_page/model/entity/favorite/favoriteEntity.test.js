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
import FavoriteEntity from "./favoriteEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultFavoriteDto} from "passbolt-styleguide/src/shared/models/entity/favorite/favoriteEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("FavoriteEntity", () => {
  describe("FavoriteEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(FavoriteEntity.ENTITY_NAME, FavoriteEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(FavoriteEntity, "id");
      assertEntityProperty.uuid(FavoriteEntity, "id");
      assertEntityProperty.required(FavoriteEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.string(FavoriteEntity, "user_id");
      assertEntityProperty.uuid(FavoriteEntity, "user_id");
      assertEntityProperty.required(FavoriteEntity, "user_id");
    });

    it("validates foreign_key property", () => {
      assertEntityProperty.string(FavoriteEntity, "foreign_key");
      assertEntityProperty.uuid(FavoriteEntity, "foreign_key");
      assertEntityProperty.required(FavoriteEntity, "foreign_key");
    });

    it("validates created property", () => {
      assertEntityProperty.string(FavoriteEntity, "created");
      assertEntityProperty.dateTime(FavoriteEntity, "created");
      assertEntityProperty.required(FavoriteEntity, "created");
    });
  });

  describe("FavoriteEntity:constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      expect.assertions(4);
      const dto = defaultFavoriteDto();
      const entity = new FavoriteEntity(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.userId).toEqual(dto.user_id);
      expect(entity.foreignKey).toEqual(dto.foreign_key);
      expect(entity.created).toEqual("2020-08-27T08:35:21+00:00");
    });
  });

  describe("FavoriteEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(2);
      const expectedKeys = [
        "id",
        "user_id",
        "foreign_key",
        "created",
      ];

      const dto = defaultFavoriteDto();
      const entity = new FavoriteEntity(dto);
      const resultDto = entity.toDto();
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
    });
  });
});
