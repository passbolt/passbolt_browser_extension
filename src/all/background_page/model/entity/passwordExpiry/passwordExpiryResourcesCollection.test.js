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
 * @since 4.5.0
 */
import PasswordExpiryResourcesCollection from "./passwordExpiryResourcesCollection";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {
  defaultPasswordExpiryResourceDto,
  defaultPasswordExpiryResourceDtoFromApi
} from "./passwordExpiryResourceEntity.test.data";


describe("PasswordExpiryPasswordExpiryResources Collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PasswordExpiryResourcesCollection.ENTITY_NAME, PasswordExpiryResourcesCollection.getSchema());
  });
  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(4);
    const passwordExpiryPasswordExpiryResource1 = defaultPasswordExpiryResourceDto();
    const passwordExpiryPasswordExpiryResource2 = defaultPasswordExpiryResourceDto();
    const dto = [passwordExpiryPasswordExpiryResource1, passwordExpiryPasswordExpiryResource2];
    const collection = new PasswordExpiryResourcesCollection(dto);
    expect(collection.toDto()).toEqual(dto);
    expect(JSON.stringify(collection)).toEqual(JSON.stringify(dto));
    expect(collection.passwordExpiryResources[0].id).toEqual(passwordExpiryPasswordExpiryResource1.id);
    expect(collection.passwordExpiryResources[1].id).toEqual(passwordExpiryPasswordExpiryResource2.id);
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(3);
    const passwordExpiryPasswordExpiryResource1 = defaultPasswordExpiryResourceDtoFromApi();
    const passwordExpiryPasswordExpiryResource2 = defaultPasswordExpiryResourceDtoFromApi();
    const dto = [passwordExpiryPasswordExpiryResource1, passwordExpiryPasswordExpiryResource2];
    const collection = new PasswordExpiryResourcesCollection(dto);
    expect(collection.toDto()).toEqual(dto);
    expect(collection.passwordExpiryResources[0].id).toEqual(passwordExpiryPasswordExpiryResource1.id);
    expect(collection.passwordExpiryResources[1].id).toEqual(passwordExpiryPasswordExpiryResource2.id);
  });

  it("constructor fails if reusing same resource", () => {
    expect.assertions(1);
    const passwordExpiryPasswordExpiryResource1 = defaultPasswordExpiryResourceDto();
    const dto = [passwordExpiryPasswordExpiryResource1, passwordExpiryPasswordExpiryResource1];

    const t = () => { new PasswordExpiryResourcesCollection(dto); };
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if reusing same id", () => {
    expect.assertions(1);
    const passwordExpiryPasswordExpiryResource1 = defaultPasswordExpiryResourceDto();
    const passwordExpiryPasswordExpiryResource2 = defaultPasswordExpiryResourceDto();
    const passwordExpiryPasswordExpiryResource3 = defaultPasswordExpiryResourceDto({id: passwordExpiryPasswordExpiryResource1.id});
    const dto = [passwordExpiryPasswordExpiryResource1, passwordExpiryPasswordExpiryResource2, passwordExpiryPasswordExpiryResource3];

    const t = () => { new PasswordExpiryResourcesCollection(dto); };
    expect(t).toThrow(EntityCollectionError);
  });
});
