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
 * @since         5.4.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuidv4} from "uuid";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import ActionLogService from "./actionLogApiService";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {defaultActionLogsCollection} from "../../../model/entity/actionLog/actionLogsCollection.test.data";

describe("ActionLogService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAllFor', () => {
    it("Retrieves all action logs for a foreign model", async() => {
      expect.assertions(2);

      const apiResponse = [defaultActionLogsCollection];
      fetch.doMockOnceIf(/actionlog\/resource/, () => mockApiResponse(apiResponse));

      const service = new ActionLogService(apiClientOptions, account);
      const result = await service.findAllFor("Resource", uuidv4(), 1, 5);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(apiResponse.length);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);

      const service = new ActionLogService(apiClientOptions, account);

      await expect(() => service.findAllFor("Resource", uuidv4())).rejects.toThrow(TypeError);
    });
  });
});
