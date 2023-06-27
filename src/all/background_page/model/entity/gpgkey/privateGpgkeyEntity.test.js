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
import PrivateGpgkeyEntity from "./privateGpgkeyEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {pgpKeys} from "../../../../../../test/fixtures/pgpKeys/keys";

const validDto = {
  armored_key: pgpKeys.ada.private,
  passphrase: "passphrase"
};

describe("PrivateGpgkey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PrivateGpgkeyEntity.ENTITY_NAME, PrivateGpgkeyEntity.getSchema());
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(1);
    try {
      const key = new PrivateGpgkeyEntity(validDto);
      expect(key.toDto()).toEqual(validDto);
    } catch (error) {
      console.error(error);
    }
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    expect.assertions(3);
    try {
      new PrivateGpgkeyEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('armored_key', 'required')).toBe(true);
      expect(error.hasError('passphrase', 'required')).toBe(true);
    }
  });
});
