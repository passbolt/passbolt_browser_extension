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
import {v4 as uuidv4} from "uuid";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import FindSecretService from "./findSecretService";
import {minimalDto} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";

describe("FindSecretService", () => {
  describe("FindSecretService::exec", () => {
    it("Should call Secret service to find all Secret from a resource id", async() => {
      expect.assertions(3);
      // initialisation
      const account = new AccountEntity(defaultAccountDto());
      const service = new FindSecretService(account, defaultApiClientOptions());
      const resourceId = uuidv4();
      const expectedDto = minimalDto();
      // mocked function
      jest.spyOn(service.secretService, "findByResourceId").mockImplementationOnce(() => expectedDto);
      // process
      const secretEntity = await service.findByResourceId(resourceId);
      // expectations
      expect(service.secretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(service.secretService.findByResourceId).toHaveBeenCalledWith(resourceId);
      expect(secretEntity.toDto()).toStrictEqual(expectedDto);
    });

    it("Should fail if the resource id is not a uuid", async() => {
      expect.assertions(1);
      // initialisation
      const account = new AccountEntity(defaultAccountDto());
      const service = new FindSecretService(account, defaultApiClientOptions());
      const resourceId = "not a uuid";
      try {
        // process
        await service.findByResourceId(resourceId);
      } catch (error) {
        // expectations
        expect(error.message).toBe("The given parameter is not a valid UUID");
      }
    });
  });
});
