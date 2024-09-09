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
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  enableFetchMocks();
});

describe("ResourceTypeModel", () => {
  let resourceTypeService, apiClientOptions;

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
    resourceTypeService = new ResourceTypeModel(apiClientOptions);
    jest.spyOn(ResourceTypeLocalStorage, "set").mockImplementation(jest.fn());
    fetch.doMockOnce(() => mockApiResponse(resourceTypesCollectionDto()));
  });

  describe("ResourceCreateService::exec", () => {
    it("Should get resource types from local storage", async() => {
      expect.assertions(3);

      jest.spyOn(resourceTypeService.resourceTypeService, "findAll");
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementationOnce(() => resourceTypesCollectionDto());

      const resourceTypeCollection = await resourceTypeService.getOrFindAll();

      expect(resourceTypeService.resourceTypeService.findAll).toHaveBeenCalledTimes(0);
      expect(resourceTypeCollection.toDto()).toEqual(resourceTypesCollectionDto());
      expect(ResourceTypeLocalStorage.set).toHaveBeenCalledTimes(0);
    });

    it("Should find resource types from api call", async() => {
      expect.assertions(4);
      jest.spyOn(resourceTypeService.resourceTypeService, "findAll").mockImplementationOnce(() => resourceTypesCollectionDto());

      const resourceTypeCollection = await resourceTypeService.getOrFindAll();

      expect(resourceTypeService.resourceTypeService.findAll).toHaveBeenCalledTimes(1);
      expect(resourceTypeCollection.toDto()).toEqual(resourceTypesCollectionDto());
      expect(ResourceTypeLocalStorage.set).toHaveBeenCalledTimes(1);
      expect(ResourceTypeLocalStorage.set).toHaveBeenCalledWith(resourceTypeCollection);
    });
  });
});
