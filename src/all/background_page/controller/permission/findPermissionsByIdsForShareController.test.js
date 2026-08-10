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
 * @since         5.14.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindPermissionsByIdsForShareController from "./findPermissionsByIdsForShareController";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindPermissionsByIdsForShareController", () => {
  describe("::exec", () => {
    it("Should retrieve the permissions of the resources matching the given ids.", async () => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const resourcesDto = [defaultResourceDto(), defaultResourceDto()];
      const resourcesCollection = new ResourcesCollection(resourcesDto);
      const requestedIds = resourcesDto.map((resource) => resource.id);
      const controller = new FindPermissionsByIdsForShareController(null, null, defaultApiClientOptions(), account);
      jest
        .spyOn(controller.findResourcesService, "findAllPermissionsByIdsForShare")
        .mockImplementation(() => resourcesCollection);

      const result = await controller.exec(requestedIds);

      expect(result).toBeInstanceOf(ResourcesCollection);
      expect(result).toStrictEqual(resourcesCollection);
      expect(controller.findResourcesService.findAllPermissionsByIdsForShare).toHaveBeenCalledWith(requestedIds);
    });

    it("Should let error been thrown from the service if any.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new FindPermissionsByIdsForShareController(null, null, defaultApiClientOptions(), account);
      const requestedIds = [defaultResourceDto().id];
      jest.spyOn(controller.findResourcesService, "findAllPermissionsByIdsForShare").mockImplementation(() => {
        throw new Error("Something went wrong!");
      });

      await expect(() => controller.exec(requestedIds)).rejects.toThrow();
    });

    it("Should assert its parameter.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new FindPermissionsByIdsForShareController(null, null, defaultApiClientOptions(), account);

      await expect(() => controller.exec(["not-a-uuid"])).rejects.toThrow(
        "The given parameter is not a valid array of uuid",
      );
    });
  });
});
