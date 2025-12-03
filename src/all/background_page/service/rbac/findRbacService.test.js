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
 * @since         5.8.0
 */

import FindRbacService from "./findRbacService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import {defaultSettingsRbacsCollectionData} from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection.test.data";

describe('FindRbacService', () => {
  beforeEach(async() => {
    jest.clearAllMocks();
  });

  describe('::findMe', () => {
    it("should find all rbac for the current logged in user", async() => {
      expect.assertions(3);

      const collectionDto = defaultSettingsRbacsCollectionData;
      const service = new FindRbacService(defaultApiClientOptions());
      jest.spyOn(service.rbacApiService, "findMe").mockImplementation(async() => new PassboltResponseEntity({header: {}, body: collectionDto}));

      const result = await service.findMe();
      expect(result).toBeInstanceOf(RbacsCollection);
      expect(result).toHaveLength(collectionDto.length);
      expect(result.toDto()).toStrictEqual(collectionDto);
    });

    it("should let error be thrown from the api service", async() => {
      expect.assertions(1);

      const service = new FindRbacService(defaultApiClientOptions());
      jest.spyOn(service.rbacApiService, "findMe").mockImplementation(async() => { throw new Error("Something went wrong"); });

      await expect(() => service.findMe()).rejects.toThrowError();
    });

    it("should throw an error if the data is invalid", async() => {
      expect.assertions(1);

      const collectionDto = defaultSettingsRbacsCollectionData;
      delete collectionDto[0].id;

      const service = new FindRbacService(defaultApiClientOptions());
      jest.spyOn(service.rbacApiService, "findMe").mockImplementation(async() => new PassboltResponseEntity({header: {}, body: collectionDto}));

      await expect(() => service.findMe()).rejects.toThrowError();
    });
  });
});
