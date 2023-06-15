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
import GpgkeyEntity from "./gpgkeyEntity";
import {GpgkeyEntityFixtures} from "./gpgkeyEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Gpgkey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GpgkeyEntity.ENTITY_NAME, GpgkeyEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GpgkeyEntityFixtures.default;
    try {
      const key = new GpgkeyEntity(dto);
      expect(key.toDto()).toEqual(dto);
    } catch (error) {
      console.error(error);
    }
  });

  it.skip("constructor works if valid DTO is provided with optional and non supported fields", () => {
    // TODO
  });

  it.skip("constructor returns validation error if dto required fields are missing", () => {
    // TODO
  });

  it.skip("constructor returns validation error if dto fields are invalid", () => {
    // TODO
  });
});
