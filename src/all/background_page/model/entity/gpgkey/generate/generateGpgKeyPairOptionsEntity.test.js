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
import EntitySchema from "../../abstract/entitySchema";
import EntityValidationError from '../../abstract/entityValidationError';
import GenerateGpgKeyPairOptionsEntity from "./generateGpgKeyPairOptionsEntity";

describe("GenerateGpgKeyPairOptionsEntity entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GenerateGpgKeyPairOptionsEntity.ENTITY_NAME, GenerateGpgKeyPairOptionsEntity.getSchema());
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      name: "Jean-Jacky",
      email: "jj@passbolt.com",
      passphrase: "ultra-secure",
      keySize: 4096,
      type: "rsa",
      date: (new Date()).getTime(),
    };
    const entity = new GenerateGpgKeyPairOptionsEntity(dto);
    expect(entity.toDto()).toStrictEqual(dto);
  });

  it("constructor works if minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      name: "Jean-Jacky",
      email: "jj@passbolt.com",
      passphrase: "ultra-secure"
    };
    const entity = new GenerateGpgKeyPairOptionsEntity(dto);
    expect(entity.toDto()).toStrictEqual({
      ...dto,
      type: "rsa",
      keySize: 3072
    });
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
});
