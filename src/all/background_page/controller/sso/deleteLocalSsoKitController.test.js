/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import "../../../../../test/mocks/mockSsoDataStorage";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import DeleteLocalSsoKitController from "./deleteLocalSsoKitController";

describe("DeleteLocalSsoKitController", () => {
  describe("DeleteLocalSsoKitController::exec", () => {
    it("Should flush the SSO data stroage", async() => {
      expect.assertions(1);

      const controller = new DeleteLocalSsoKitController();
      await controller.exec();

      expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
    });
  });
});
