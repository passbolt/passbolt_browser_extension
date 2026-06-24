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
 * @since         6.0.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindResourceTypesService from "./getOrFindResourceTypesService";
import ResourceTypeLocalStorage from "../local_storage/resourceTypeLocalStorage";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import { resourceTypesCollectionDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";

describe("GetOrFindResourceTypesService", () => {
  let service, account, storage;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindResourceTypesService(account, defaultApiClientOptions());
    storage = new ResourceTypeLocalStorage(account);
    await storage.flush();
  });

  describe("::getOrFindAll", () => {
    it("returns the resource types collection from the local storage on hot cache without delegating to the find-all service.", async () => {
      expect.assertions(2);
      const resourceTypesDto = resourceTypesCollectionDto();
      await storage.setData(new ResourceTypesCollection(resourceTypesDto));
      jest.spyOn(service.resourceTypeService, "findAll");

      const result = await service.getOrFindAll();

      expect(service.resourceTypeService.findAll).not.toHaveBeenCalled();
      expect(result.toDto(storage.DEFAULT_CONTAIN)).toEqual(
        new ResourceTypesCollection(resourceTypesDto).toDto(storage.DEFAULT_CONTAIN),
      );
    });

    it("delegates to the find-and-update service on cold cache and returns its result.", async () => {
      expect.assertions(2);
      const resourceTypesDto = resourceTypesCollectionDto();
      const expected = new ResourceTypesCollection(resourceTypesDto);
      jest.spyOn(service.resourceTypeService, "findAll").mockImplementation(() => expected);

      const result = await service.getOrFindAll();

      expect(service.resourceTypeService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });
  });
});
