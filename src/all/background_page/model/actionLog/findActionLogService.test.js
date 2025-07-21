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
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {enableFetchMocks} from "jest-fetch-mock";
import ActionLogApiService from "../../service/api/actionLog/actionLogApiService";
import FindActionLogService from "./findActionLogService";
import {defaultActionLogsCollection} from "../../model/entity/actionLog/actionLogsCollection.test.data";

describe("FindActionLogService", () => {
  let apiClientOptions, account,
    service;

  beforeEach(async() => {
    enableFetchMocks();
    jest.clearAllMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    service = new FindActionLogService(apiClientOptions, account);
  });

  describe('::findAllFor', () => {
    it("Should call the actionLog service API to get the acitonlog collection", async() => {
      expect.assertions(1);
      const foreignId = uuidv4();
      const actionLogsDto = defaultActionLogsCollection;

      jest.spyOn(ActionLogApiService.prototype, "findAllFor").mockImplementation(() => actionLogsDto);

      const actionLogs = await service.findAllFor("Resource", foreignId, 1, 5);
      expect(actionLogs).toHaveLength(actionLogsDto.length);
    });

    it("should throw an error if id is not defined", async() => {
      expect.assertions(1);
      const promise = service.findAllFor({unknown: true});
      await expect(promise).rejects.toThrowError("ActionLog foreign model should be a valid string.");
    });

    it("should throw an error if foreign model is unsupported", async() => {
      expect.assertions(1);
      const foreignId = uuidv4();
      const promise = service.findAllFor("ChangeTheme", foreignId, 1, 5);
      await expect(promise).rejects.toThrowError("ActionLog foreign model ChangeTheme is not in the list of supported models.");
    });
  });
});
