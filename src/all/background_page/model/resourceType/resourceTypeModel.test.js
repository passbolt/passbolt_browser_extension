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
 * @since         4.9.4
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypeModel from "./resourceTypeModel";
import ResourceTypeLocalStorage from "../../service/local_storage/resourceTypeLocalStorage";
import {resourceTypePasswordDescriptionTotpDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("ResourceTypeModel", () => {
  let resourceTypeModel;

  beforeEach(() => {
    resourceTypeModel = new ResourceTypeModel(defaultApiClientOptions());
    jest.spyOn(ResourceTypeLocalStorage, "set").mockImplementation(jest.fn());
  });

  describe("::getOrFindAll", () => {
    it("Should get resource types from local storage", async() => {
      expect.assertions(3);

      jest.spyOn(resourceTypeModel.resourceTypeService, "findAll");
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementationOnce(() => resourceTypesCollectionDto());

      const resourceTypeCollection = await resourceTypeModel.getOrFindAll();

      expect(resourceTypeModel.resourceTypeService.findAll).toHaveBeenCalledTimes(0);
      expect(resourceTypeCollection.toDto()).toEqual(resourceTypesCollectionDto());
      expect(ResourceTypeLocalStorage.set).toHaveBeenCalledTimes(0);
    });

    it("Should find resource types from api call", async() => {
      expect.assertions(4);
      jest.spyOn(resourceTypeModel.resourceTypeService, "findAll").mockImplementationOnce(() => resourceTypesCollectionDto());

      const resourceTypeCollection = await resourceTypeModel.getOrFindAll();

      expect(resourceTypeModel.resourceTypeService.findAll).toHaveBeenCalledTimes(1);
      expect(resourceTypeCollection.toDto()).toEqual(resourceTypesCollectionDto());
      expect(ResourceTypeLocalStorage.set).toHaveBeenCalledTimes(1);
      expect(ResourceTypeLocalStorage.set).toHaveBeenCalledWith(resourceTypeCollection);
    });
  });

  describe("::getSecretSchemaById", () => {
    it("Should return the right secret schema based on the resource type id", async() => {
      expect.assertions(1);

      const availableResourceType = resourceTypesCollectionDto();
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementationOnce(() => availableResourceType);

      const expectedResourceType = availableResourceType.find(rt => rt.slug === "password-description-totp");

      const secretSchema = await resourceTypeModel.getSecretSchemaById(expectedResourceType.id);
      const expectedSchema = resourceTypePasswordDescriptionTotpDto().definition.secret;

      expect(secretSchema).toStrictEqual(expectedSchema);
    });

    it("Should find the data from the API before returning the right secret schema based", async() => {
      expect.assertions(1);

      const availableResourceType = resourceTypesCollectionDto();
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementationOnce(() => undefined);
      jest.spyOn(resourceTypeModel.resourceTypeService, "findAll").mockImplementationOnce(() => availableResourceType);

      const expectedResourceType = availableResourceType.find(rt => rt.slug === "password-description-totp");

      const secretSchema = await resourceTypeModel.getSecretSchemaById(expectedResourceType.id);
      const expectedSchema = resourceTypePasswordDescriptionTotpDto().definition.secret;

      expect(secretSchema).toStrictEqual(expectedSchema);
    });

    it("Should assert the parameter is a proper UUID", async() => {
      expect.assertions(1);

      expect(() => resourceTypeModel.getSecretSchemaById("non-uuid")).rejects.toThrow(new Error('The resource type id should be a valid UUID'));
    });
  });
});
