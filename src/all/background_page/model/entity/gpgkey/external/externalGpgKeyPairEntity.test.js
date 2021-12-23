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
 * @since         3.5.0
 */
import Validator from 'validator';
import {ExternalGpgKeyPairEntity} from "./externalGpgKeyPairEntity";
import {ExternalGpgKeyEntityFixtures} from "./externalGpgKeyEntity.test.fixtures";
import {EntitySchema} from "../../abstract/entitySchema";
import {EntityValidationError} from '../../abstract/entityValidationError';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("ExternalGpgKey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalGpgKeyPairEntity.ENTITY_NAME, ExternalGpgKeyPairEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const armored_key = ExternalGpgKeyEntityFixtures.minimal_dto;
    const dto = {
      public_key: armored_key,
      private_key: armored_key
    };

    const entity = new ExternalGpgKeyPairEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid full DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      public_key: ExternalGpgKeyEntityFixtures.full_dto,
      private_key: ExternalGpgKeyEntityFixtures.private_key_dto
    };

    const entity = new ExternalGpgKeyPairEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor throws an exception if DTO is missing required field", () => {
    expect.assertions(3);
    try {
      new ExternalGpgKeyPairEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('private_key', 'required')).toBe(true);
      expect(error.hasError('public_key', 'required')).toBe(true);
    }
  });

  it("constructor throws an exception if private key is public", () => {
    expect.assertions(2);
    const expectedError =
      new EntityValidationError(`Could not validate entity ${ExternalGpgKeyPairEntity.ENTITY_NAME}. The private key part is public`);
    try {
      new ExternalGpgKeyPairEntity({
        public_key: ExternalGpgKeyEntityFixtures.full_dto,
        private_key: ExternalGpgKeyEntityFixtures.full_dto
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error).toEqual(expectedError);
    }
  });

  it("constructor throws an exception if public key is private", () => {
    expect.assertions(2);
    const expectedError =
      new EntityValidationError(`Could not validate entity ${ExternalGpgKeyPairEntity.ENTITY_NAME}. The public key part is private`);
    try {
      new ExternalGpgKeyPairEntity({
        public_key: ExternalGpgKeyEntityFixtures.private_key_dto,
        private_key: ExternalGpgKeyEntityFixtures.private_key_dto
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error).toEqual(expectedError);
    }
  });
});
