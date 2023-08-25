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
import ExternalGpgKeyPairEntity from "./externalGpgKeyPairEntity";
import {ExternalGpgKeyEntityFixtures} from "./externalGpgKeyEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("ExternalGpgKey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalGpgKeyPairEntity.ENTITY_NAME, ExternalGpgKeyPairEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const externalGpgKeyDto = ExternalGpgKeyEntityFixtures.minimal_dto;
    const dto = {
      public_key: externalGpgKeyDto,
      private_key: externalGpgKeyDto
    };

    const entity = new ExternalGpgKeyPairEntity(dto);
    expect(entity.toDto(ExternalGpgKeyPairEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
  });

  it("constructor works if valid full DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      public_key: ExternalGpgKeyEntityFixtures.full_dto,
      private_key: ExternalGpgKeyEntityFixtures.private_key_dto
    };

    const entity = new ExternalGpgKeyPairEntity(dto);
    expect(entity.toDto(ExternalGpgKeyPairEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
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
});
