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
import ProfileEntity from "./profileEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {
  defaultProfileDto,
  minimalProfileDto
} from "passbolt-styleguide/src/shared/models/entity/profile/ProfileEntity.test.data";
import each from "jest-each";
import {defaultAvatarDto} from "passbolt-styleguide/src/shared/models/entity/avatar/avatarEntity.test.data";

describe("ProfileEntity", () => {
  describe("ProfileEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ProfileEntity.ENTITY_NAME, ProfileEntity.getSchema());
    });

    it("constructor works if valid minimal DTO is provided", () => {
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

    it("constructor works if valid DTO is provided with optional properties", () => {
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

    // Validate id
    each([
      {scenario: 'is not required but null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultProfileDto({
          id: test.value
        });
        try {
          new ProfileEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('id', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate user_id
    each([
      {scenario: 'is not required but null', rule: 'type', value: null},
      {scenario: 'valid uuid', rule: 'format', value: 'invalid-id'},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the user_id", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultProfileDto({
          user_id: test.value
        });
        try {
          new ProfileEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('user_id', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate first_name
    each([
      {scenario: 'is required', rule: 'type'},
      {scenario: 'is null', rule: 'type', value: null},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the first_name", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultProfileDto({
          first_name: test.value
        });
        try {
          new ProfileEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('first_name', test.rule)).toBeTruthy();
        }
      });
    });

    // Validate last_name
    each([
      {scenario: 'is required', rule: 'type'},
      {scenario: 'is null', rule: 'type', value: null},
      {scenario: 'valid format', rule: 'type', value: 42},
    ]).describe("Should validate the last_name", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultProfileDto({
          last_name: test.value
        });
        try {
          new ProfileEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('last_name', test.rule)).toBeTruthy();
        }
      });
    });

    each([
      {scenario: 'is not required but cannot be null', rule: null},
      {scenario: 'valid url object', rule: 'type', value: 42},
    ]).describe("Should validate the created", test => {
      it(`Should not accept: ${test.scenario}`, async() => {
        expect.assertions(2);
        const dto = defaultProfileDto({
          created: test.value
        });
        try {
          new ProfileEntity(dto);
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
        const dto = defaultProfileDto({
          modified: test.value
        });
        try {
          new ProfileEntity(dto);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('modified', test.rule)).toBeTruthy();
        }
      });
    });

    it('Should not accept invalid associated avatar', async() => {
      expect.assertions(2);
      const dto = defaultProfileDto({
        avatar: defaultAvatarDto({id: "invalid-id"})
      });
      try {
        new ProfileEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('id', 'format')).toBeTruthy();
      }
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
