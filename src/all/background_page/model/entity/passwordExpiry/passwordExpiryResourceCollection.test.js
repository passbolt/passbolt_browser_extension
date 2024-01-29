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
 * @since         4.5.0
 */
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import PasswordExpiryResourcesCollection from "./passwordExpiryResourcesCollection";
import {defaultPasswordExpiryCollectionDto} from "./passwordExpiryResourceCollection.test.data";
import {defaultPasswordExpiryResourceDto} from "./passwordExpiryResourceEntity.test.data";

describe("PasswordExpiryResource Collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PasswordExpiryResourcesCollection.ENTITY_NAME, PasswordExpiryResourcesCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const collectionDto = defaultPasswordExpiryCollectionDto();
    const collection = new PasswordExpiryResourcesCollection(collectionDto);

    expect(collection.toDto()).toEqual(collectionDto);
  });

  it("constructor works with empty collection", () => {
    expect.assertions(1);
    const collection = new PasswordExpiryResourcesCollection([]);
    expect(collection.toDto()).toEqual([]);
  });

  it("constructor should filter same id", () => {
    expect.assertions(1);
    const passwordExpiryResource = defaultPasswordExpiryResourceDto();
    const dto = [passwordExpiryResource, passwordExpiryResource];

    expect(() => new PasswordExpiryResourcesCollection(dto)).toThrow(EntityCollectionError);
  });
});
