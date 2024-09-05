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
 * @since         4.10.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindPermissionsService from "./findPermissionsService";
import {v4 as uuidv4} from "uuid";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

describe("FindPermissionService", () => {
  describe("FindPermissionService::exec", () => {
    it("Should call permission service to find all permission from a resource id", async() => {
      expect.assertions(2);
      // initialisation
      const account = new AccountEntity(defaultAccountDto());
      const service = new FindPermissionsService(account, defaultApiClientOptions());
      const resourceId = uuidv4();
      // mocked function
      jest.spyOn(service.permissionService, "findAllByAcoForeignKey").mockImplementationOnce(jest.fn());
      // process
      await service.findAllByAcoForeignKeyForDisplay(resourceId);
      // expectations
      expect(service.permissionService.findAllByAcoForeignKey).toHaveBeenCalledTimes(1);
      expect(service.permissionService.findAllByAcoForeignKey).toHaveBeenCalledWith(resourceId, FindPermissionsService.DEFAULT_CONTAIN);
    });

    it("Should fail if the resource id is not a uuid", async() => {
      expect.assertions(1);
      // initialisation
      const account = new AccountEntity(defaultAccountDto());
      const service = new FindPermissionsService(account, defaultApiClientOptions());
      const resourceId = "not a uuid";
      try {
        // process
        await service.findAllByAcoForeignKeyForDisplay(resourceId);
      } catch (error) {
        // expectations
        expect(error.message).toBe(`Service error. The id '${resourceId}' is not a valid uuid.`);
      }
    });
  });
});
