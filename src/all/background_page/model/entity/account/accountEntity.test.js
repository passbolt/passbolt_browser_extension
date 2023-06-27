/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.12.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import AccountEntity from "./accountEntity";
import {defaultAccountDto} from "./accountEntity.test.data";

describe("AccountEntity", () => {
  describe("AccountEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AccountEntity.ENTITY_NAME, AccountEntity.getSchema());
    });

    it("it should instantiate the entity with a minimal dto", () => {
      expect.assertions(2);
      const dto = defaultAccountDto();
      const entity = new AccountEntity(dto);
      expect(entity).toBeInstanceOf(AccountEntity);
      expect(entity.isUsernameValidated).toBeTruthy();
    });

    it("it should validate the username by default", () => {
      expect.assertions(2);
      const dto = defaultAccountDto({username: 'invalid-username'});
      try {
        new AccountEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('username', 'custom')).toBeTruthy();
      }
    });

    it("it should not validate the username if requested", () => {
      expect.assertions(2);
      const dto = defaultAccountDto({username: 'invalid-username'});
      const entity = new AccountEntity(dto, {validateUsername: false});
      expect(entity).toBeInstanceOf(AccountEntity);
      expect(entity.isUsernameValidated).toBeFalsy();
    });
  });

  describe("AccountEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(2);
      const expectedKeys = [
        'type',
        'domain',
        'user_id',
        'user_key_fingerprint',
        'user_public_armored_key',
        'server_public_armored_key',
        'username',
        'first_name',
        'last_name',
        'locale'
      ];

      const dto = defaultAccountDto();
      const entity = new AccountEntity(dto);
      const resultDto = entity.toDto();
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(10);
      expect(keys).toEqual(expectedKeys);
    });

    it("it should return the user private key if requested", () => {
      expect.assertions(2);
      const expectedKeys = [
        'type',
        'domain',
        'user_id',
        'user_key_fingerprint',
        'user_public_armored_key',
        'server_public_armored_key',
        'username',
        'first_name',
        'last_name',
        'locale',
        'user_private_armored_key'
      ];

      const dto = defaultAccountDto();
      const entity = new AccountEntity(dto);
      const resultDto = entity.toDto({user_private_armored_key: true});
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(11);
      expect(keys).toEqual(expectedKeys);
    });

    it("it should return the user security token if requested", () => {
      expect.assertions(2);
      const expectedKeys = [
        'type',
        'domain',
        'user_id',
        'user_key_fingerprint',
        'user_public_armored_key',
        'server_public_armored_key',
        'username',
        'first_name',
        'last_name',
        'locale',
        'security_token'
      ];

      const dto = defaultAccountDto();
      const entity = new AccountEntity(dto);
      const resultDto = entity.toDto({security_token: true});
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(11);
      expect(keys).toEqual(expectedKeys);
    });
  });
});
