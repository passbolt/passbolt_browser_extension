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
import AccountEntity from "../model/entity/account/accountEntity";
import {defaultAccountDto} from "../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAllForActionLogController from "./findAllForActionLogController";
import {defaultActionLogsCollection} from "../model/entity/actionLog/actionLogsCollection.test.data";
import ActionLogsCollection from "../model/entity/actionLog/actionLogsCollection";
import {v4 as uuid} from "uuid";

describe("FindAllForActionLogController", () => {
  let controller, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    controller = new FindAllForActionLogController(null, null, apiClientOptions, account);
  });

  describe("FindAllForActionLogController::exec", () => {
    it("Find all action logs for the resource", async() => {
      expect.assertions(2);

      const actionLogsDto = defaultActionLogsCollection;
      jest.spyOn(controller.findAllForActionLogService, "findAllFor").mockImplementationOnce(() => new ActionLogsCollection(actionLogsDto));

      const actionLogsCollection = await controller.exec("Resource", uuid(), {page: 1, limit: 5});
      expect(actionLogsCollection).toBeInstanceOf(ActionLogsCollection);
      expect(actionLogsCollection.toDto()).toEqual(actionLogsDto);
    });
  });
});
