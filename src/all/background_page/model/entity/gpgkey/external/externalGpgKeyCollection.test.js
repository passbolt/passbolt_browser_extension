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
import ExternalGpgKeyCollection from "./externalGpgKeyCollection";
import {ExternalGpgKeyEntityFixtures} from "./externalGpgKeyEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("ExternalGpgKey Collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalGpgKeyCollection.ENTITY_NAME, ExternalGpgKeyCollection.getSchema());
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(2);

    const entity1 = ExternalGpgKeyEntityFixtures.full_dto;
    const entity2 = ExternalGpgKeyEntityFixtures.minimal_dto;
    const dto = [entity1, entity2];
    const collection = new ExternalGpgKeyCollection(dto);

    expect(collection.toDto()).toEqual(dto);
    expect(JSON.stringify(collection)).toEqual(JSON.stringify(dto));
  });

  it("constructor works with empty collection", () => {
    expect.assertions(1);
    const collection = new ExternalGpgKeyCollection([]);
    expect(collection.toDto()).toEqual([]);
  });
});
