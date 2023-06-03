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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {defaultFavoriteDto} from "passbolt-styleguide/src/shared/models/entity/favorite/favoriteEntity.test.data";
import each from "jest-each";

describe("FavoriteEntity", () => {
  describe("FavoriteEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(FavoriteEntity.ENTITY_NAME, FavoriteEntity.getSchema());
    });

    it("constructor works if valid minimal DTO is provided", () => {
      const dto = defaultFavoriteDto();
      const entity = new FavoriteEntity(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.userId).toEqual(dto.user_id);
      expect(entity.foreignKey).toEqual(dto.foreign_key);
      expect(entity.created).toEqual("2020-08-27T08:35:21+00:00");
    });

    // Validate id
    each([
      {scenario: 'required', rule: 'type'},
      {scenario: 'not null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFavoriteDto({
          id: test.value
        });
        try {
          new FavoriteEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('id', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate user_id
    each([
      {scenario: 'required', rule: 'type'},
      {scenario: 'not null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the user_id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFavoriteDto({
          user_id: test.value
        });
        try {
          new FavoriteEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('user_id', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate foreign_key
    each([
      {scenario: 'required', rule: 'type'},
      {scenario: 'not null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the foreign_key", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFavoriteDto({
          foreign_key: test.value
        });
        try {
          new FavoriteEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('foreign_key', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'required', rule: 'type'},
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
    ]).describe("Should validate the created", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultFavoriteDto({
          created: test.value
        });
        try {
          new FavoriteEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('created', test.rule)).toBeTruthy();
        }
      });
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
