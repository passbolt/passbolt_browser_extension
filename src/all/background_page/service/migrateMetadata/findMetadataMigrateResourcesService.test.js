
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
 * @since         4.12.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindMetadataMigrateResourcesService from "./findMetadataMigrateResourcesService";
import PassboltResponsePaginationHeaderEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponsePaginationHeaderEntity";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import {defaultPassboltResponseDto} from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindMetadataMigrateResourcesService", () => {
  describe("::findMigrateDetails", () => {
    it("should return the count details of the resources to migrate", async() => {
      expect.assertions(4);

      const service = new FindMetadataMigrateResourcesService(defaultApiClientOptions());
      const headerEntity = new PassboltResponseEntity(defaultPassboltResponseDto());
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockReturnValue(headerEntity);

      const result = await service.findMigrateDetails();
      expect(result).toBeInstanceOf(PassboltResponsePaginationHeaderEntity);
      const pagination = headerEntity.header.pagination;
      expect(result._props.count).toStrictEqual(pagination._props.count);
      expect(result._props.limit).toStrictEqual(pagination._props.limit);
      expect(result._props.page).toStrictEqual(pagination._props.page);
    });

    it("should not catch error and let throw the error from the API if any", async() => {
      expect.assertions(1);

      const service = new FindMetadataMigrateResourcesService(defaultApiClientOptions());
      const error = new Error("Something went wrong");
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockImplementation(() => { throw error; });

      expect(() => service.findMigrateDetails()).rejects.toStrictEqual(error);
    });
  });
});
