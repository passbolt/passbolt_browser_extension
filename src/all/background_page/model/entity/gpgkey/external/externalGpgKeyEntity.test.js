/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import ExternalGpgKeyEntity from "./externalGpgKeyEntity";
import {ExternalGpgKeyEntityFixtures} from "./externalGpgKeyEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("ExternalGpgKey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalGpgKeyEntity.ENTITY_NAME, ExternalGpgKeyEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = ExternalGpgKeyEntityFixtures.minimal_dto;
    const entity = new ExternalGpgKeyEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid full DTO is provided", () => {
    const dto = ExternalGpgKeyEntityFixtures.full_dto;
    const entity = new ExternalGpgKeyEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if non RSA key information is provided", () => {
    const dto = ExternalGpgKeyEntityFixtures.eddsa;
    const entity = new ExternalGpgKeyEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid legacy full DTO is provided", () => {
    const legacyDto = ExternalGpgKeyEntityFixtures.legacy_full_dto;
    const entity = new ExternalGpgKeyEntity(legacyDto);
    const sanitizedDto = {
      ...legacyDto,
      armored_key: legacyDto.key,
      key_id: legacyDto.keyId,
      user_ids: legacyDto.userIds,
      created: "2015-10-26T12:45:08.000Z",
      expires: "2024-10-26T12:45:08.000Z"
    };
    delete sanitizedDto.key;
    delete sanitizedDto.keyId;
    delete sanitizedDto.userIds;
    expect(entity.toDto()).toEqual(sanitizedDto);
  });

  it("constructor throws an exception if DTO is missing required field", () => {
    try {
      const dto = ExternalGpgKeyEntityFixtures.missing_required_field_dto;
      new ExternalGpgKeyEntity(dto);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('armored_key', 'required')).toBe(true);
    }
  });

  it("constructor throws an exception if DTO contains invalid field", () => {
    try {
      const dto = ExternalGpgKeyEntityFixtures.broken_fields_dto;
      new ExternalGpgKeyEntity(dto);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('key_id', 'minLength')).toBe(true);
      //expect(error.hasError('user_ids', 'format')).toBe(true); //checks in array are apparently not done
      expect(error.hasError('fingerprint', 'maxLength')).toBe(true);
      expect(error.hasError('created', 'type')).toBe(true);
      expect(error.hasError('length', 'type')).toBe(true);
      expect(error.hasError('curve', 'type')).toBe(true);
      expect(error.hasError('private', 'type')).toBe(true);
      expect(error.hasError('revoked', 'type')).toBe(true);
    }
  });

  it.todo("constructor returns validation error if the user id email is not standard.");

  it.todo("constructor works if the user id email is not standard and the application settings defined a custom validation.");
});
