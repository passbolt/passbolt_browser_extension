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
 * @since         4.10.1
 */

import {v4 as uuidv4} from "uuid";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import MoveService from "./moveService";

describe("MoveService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::moveResource', () => {
    it("Move a resource on the API.", async() => {
      expect.assertions(1);

      const resourceId = uuidv4();
      const destinationFolderId = uuidv4();

      fetch.doMockOnceIf(new RegExp(`/move\/resource\/${resourceId}\.json`), async req => {
        expect(req.method).toEqual("PUT");
        return mockApiResponse({});
      });

      const service = new MoveService(apiClientOptions);
      await service.moveResource(resourceId, destinationFolderId);
    });

    it("throws an invalid parameter error if the `id` or `destinationFolderId` parameter is not valid", async() => {
      expect.assertions(2);

      const service = new MoveService(apiClientOptions);

      await expect(() => service.moveResource(42)).rejects.toThrow("The parameter 'id' should be a UUID.");
      await expect(() => service.moveResource(uuidv4(), 42)).rejects.toThrow("The parameter 'destinationFolderId' should be a UUID or null.");
    });
  });
});
