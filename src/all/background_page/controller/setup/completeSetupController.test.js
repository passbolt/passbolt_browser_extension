/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
const app = require("../../app");
import {CompleteSetupController} from "./completeSetupController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {withSecurityTokenAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import {AccountSetupEntity} from "../../model/entity/account/accountSetupEntity";

jest.mock("../../app");

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("CompleteSetupController", () => {
  describe("CompleteSetupController::exec", () => {
    it.todo("Should complete the setup.");

    it("Should complete the setup.", async() => {
      const account = new AccountSetupEntity(withSecurityTokenAccountSetupDto());
      const controller = new CompleteSetupController(null, null, defaultApiClientOptions(), account);

      // Mock API complete request.
      fetch.doMockOnce(() => mockApiResponse());
      // Mock pagemods to assert the complete start the auth and inform menu pagemods.
      app.pageMods.WebIntegration.init = jest.fn();

      expect.assertions(2);
      await controller.exec();
      // @todo refactoring-account-recover should test the account is created.
      expect(app.pageMods.WebIntegration.init).toHaveBeenCalled();
      expect(app.pageMods.AuthBootstrap.init).toHaveBeenCalled();
    });
  });
});
