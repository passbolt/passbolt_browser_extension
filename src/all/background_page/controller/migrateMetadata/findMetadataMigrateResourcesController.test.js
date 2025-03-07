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
import FindMetadataMigrateResourcesController from "./findMetadataMigrateResourcesController";
import PassboltResponsePaginationHeaderEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponsePaginationHeaderEntity";
import {defaultPassboltResponsePaginationHeaderDto} from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponsePaginationHeaderEntity.test.data";

describe("FindMetadataMigrateResourcesController", () => {
  describe("::exec", () => {
    it("Find the resource migration details.", async() => {
      expect.assertions(2);

      const controller = new FindMetadataMigrateResourcesController(null, null, defaultApiClientOptions());

      jest.spyOn(controller.findMetadataMigrateResourcesService, "findMigrateDetails")
        .mockReturnValue(new PassboltResponsePaginationHeaderEntity(defaultPassboltResponsePaginationHeaderDto()));

      const result = await controller.exec();

      expect(controller.findMetadataMigrateResourcesService.findMigrateDetails).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PassboltResponsePaginationHeaderEntity);
    });

    it("should not catch the error and let it be thrown if any.", async() => {
      expect.assertions(1);

      const controller = new FindMetadataMigrateResourcesController(null, null, defaultApiClientOptions());

      const error = new Error("Something went wrong!");
      jest.spyOn(controller.findMetadataMigrateResourcesService, "findMigrateDetails")
        .mockImplementation(() => { throw error; });

      expect(() => controller.exec()).rejects.toStrictEqual(error);
    });
  });
});
