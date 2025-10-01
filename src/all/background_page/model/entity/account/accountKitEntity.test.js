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
 * @since         4.3.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import AccountKitEntity from "./accountKitEntity";
import {defaultAccountDto} from "./accountEntity.test.data";
import {expectedKeys} from "./accountKitEntity.test.data";
import AbstractAccountEntity from "./abstractAccountEntity";

describe("AccountKitEntity", () => {
  describe("AccountKitEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AccountKitEntity.ENTITY_NAME, AccountKitEntity.getSchema());
    });

    it("it should instantiate the entity with a minimal dto", () => {
      expect.assertions(1);
      const dto = defaultAccountDto();
      const entity = new AccountKitEntity(dto);
      expect(entity).toBeInstanceOf(AccountKitEntity);
    });

    it("it should not valided with required fields missing", () => {
      expect.assertions(9);
      const dto = {};
      try {
        new AccountKitEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('domain', 'required')).toBeTruthy();
        expect(error.hasError('user_id', 'required')).toBeTruthy();
        expect(error.hasError('username', 'required')).toBeTruthy();
        expect(error.hasError('first_name', 'required')).toBeTruthy();
        expect(error.hasError('last_name', 'required')).toBeTruthy();
        expect(error.hasError('user_private_armored_key', 'required')).toBeTruthy();
        expect(error.hasError('server_public_armored_key', 'required')).toBeTruthy();
        expect(error.hasError('security_token', 'required')).toBeTruthy();
      }
    });

    it("it should apply AbstractAccountEntity schema validation", () => {
      expect.assertions(6);
      const schema = AccountKitEntity.getSchema();
      const abstractAccountEntitySchema = AbstractAccountEntity.getSchema();

      expect(schema.properties.domain).toEqual(abstractAccountEntitySchema.properties.domain);
      expect(schema.properties.user_id).toEqual(abstractAccountEntitySchema.properties.user_id);
      expect(schema.properties.username).toEqual(abstractAccountEntitySchema.properties.username);
      expect(schema.properties.first_name).toEqual(abstractAccountEntitySchema.properties.first_name);
      expect(schema.properties.last_name).toEqual(abstractAccountEntitySchema.properties.last_name);
      expect(schema.properties.security_token).toEqual(abstractAccountEntitySchema.properties.security_token);
    });

    it("it should not validate the server private key if the key is higher than 50000", () => {
      expect.assertions(2);
      const dto = defaultAccountDto({server_public_armored_key: 'a'.repeat(50001)});
      try {
        new AccountKitEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('server_public_armored_key', 'maxLength')).toBeTruthy();
      }
    });

    it("it should not validate the user private key if the key is higher than 50000", () => {
      expect.assertions(2);
      const dto = defaultAccountDto({user_private_armored_key: 'a'.repeat(50001)});
      try {
        new AccountKitEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('user_private_armored_key', 'maxLength')).toBeTruthy();
      }
    });
  });

  describe("AccountEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(2);

      const dto = defaultAccountDto();
      const entity = new AccountKitEntity(dto);
      const resultDto = entity.toDto();
      const keys = Object.keys(resultDto);

      expect(keys.length).toBe(9);
      expect(keys).toEqual(expectedKeys);
    });
  });
});
