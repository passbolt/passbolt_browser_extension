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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import GenerateGpgKeyPairOptionsEntity from "./generateGpgKeyPairOptionsEntity";
import {
  customEmailValidationProOrganizationSettings
} from "../../organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsModel from "../../../organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../../organizationSettings/organizationSettingsEntity";
import {defaultDto, minimalDto} from "./generateGpgKeyPairOptionsEntity.test.data";

describe("GenerateGpgKeyPairOptionsEntity entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GenerateGpgKeyPairOptionsEntity.ENTITY_NAME, GenerateGpgKeyPairOptionsEntity.getSchema());
  });

  it("constructor works if minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = minimalDto();
    const entity = new GenerateGpgKeyPairOptionsEntity(dto);
    expect(entity.toDto()).toStrictEqual({
      ...dto,
      type: "rsa",
      keySize: 3072
    });
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(1);
    const dto = defaultDto();
    const entity = new GenerateGpgKeyPairOptionsEntity(dto);
    expect(entity.toDto()).toStrictEqual(dto);
  });

  it("constructor throws an exception if DTO contains invalid field", () => {
    expect.assertions(6);
    try {
      const dto = {
        name: "",
        email: "@passbolt.com",
        passphrase: "1234567",
        keySize: "super strong key size",
        type: "RSB",
      };
      new GenerateGpgKeyPairOptionsEntity(dto);
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.hasError('name', 'minLength')).toBe(true);
      expect(error.hasError('email', 'custom')).toBe(true);
      expect(error.hasError('passphrase', 'minLength')).toBe(true);
      expect(error.hasError('keySize', 'type')).toBe(true);
      expect(error.hasError('type', 'enum')).toBe(true);
    }
  });

  it("constructor returns validation error if the email is not standard.", () => {
    expect.assertions(2);
    try {
      const dto = defaultDto({email: "ada@passbolt.c"});
      new GenerateGpgKeyPairOptionsEntity(dto);
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('email', 'custom')).toBe(true);
    }
  });

  it("constructor works if the email is not standard and the application settings defined a custom validation.", () => {
    expect.assertions(1);
    const organizationSettings = customEmailValidationProOrganizationSettings();
    OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
    const dto = defaultDto({email: "ada@passbolt.c"});
    const entity = new GenerateGpgKeyPairOptionsEntity(dto);
    expect(entity.email).toEqual("ada@passbolt.c");
  });
});
