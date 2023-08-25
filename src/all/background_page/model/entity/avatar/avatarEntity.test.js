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

import each from "jest-each";
import AvatarEntity from "./avatarEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {
  defaultAvatarDto,
  minimalAvatarDto
} from "passbolt-styleguide/src/shared/models/entity/avatar/avatarEntity.test.data";
import Validator from "validator";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("AvatarEntity", () => {
  describe("AvatarEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AvatarEntity.ENTITY_NAME, AvatarEntity.getSchema());
    });

    it("constructor works if valid minimal DTO is provided", () => {
      const dto = minimalAvatarDto();
      const entity = new AvatarEntity(dto);
      expect(entity.id).toBeNull();
      expect(entity.urlMedium).toEqual('img/avatar/user_medium.png');
      expect(entity.urlSmall).toEqual('img/avatar/user.png');
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
    });

    it("constructor works if valid DTO is provided with optional properties", () => {
      const dto = defaultAvatarDto();
      const entity = new AvatarEntity(dto);
      expect(Validator.isUUID(entity.id)).toBe(true);
      expect(entity.urlMedium).toEqual('/avatars/view/e6927385-195c-4c7f-a107-a202ea86de40/medium.jpg');
      expect(entity.urlSmall).toEqual('/avatars/view/e6927385-195c-4c7f-a107-a202ea86de40/small.jpg');
      expect(entity.created).toEqual('2023-06-03T12:03:46+00:00');
      expect(entity.modified).toEqual('2023-06-03T12:03:46+00:00');
    });

    each([
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultAvatarDto({
          id: test.value
        });
        try {
          new AvatarEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('id', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'required', rule: 'type'},
      {scenario: 'valid url object', rule: 'type', value: 42},
      /*
       * @todo Should validate small & medium urls
       * {scenario: 'valid medium url', rule: 'type', value: {
       *     medium: 42
       *   }},
       * {scenario: 'valid small url', rule: 'type', value: {
       *     medium: 42
       *   }},
       */
    ]).describe("Should validate the url", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultAvatarDto({
          url: test.value
        });
        try {
          new AvatarEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('url', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
    ]).describe("Should validate the created", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultAvatarDto({
          created: test.value
        });
        try {
          new AvatarEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('created', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
    ]).describe("Should validate the modified", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultAvatarDto({
          modified: test.value
        });
        try {
          new AvatarEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('modified', test.rule)).toBeTruthy();
        }
      });
    });
  });

  describe("AvatarEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(2);
      const expectedKeys = [
        "id",
        "url",
        "created",
        "modified",
      ];

      const dto = defaultAvatarDto();
      const entity = new AvatarEntity(dto);
      const resultDto = entity.toDto();
      const keys = Object.keys(resultDto);
      expect(keys).toEqual(expectedKeys);
      expect(Object.keys(resultDto).length).toBe(expectedKeys.length);
    });
  });
});
