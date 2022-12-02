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
 * @since         3.9.0
 */
import "../../../../../test/mocks/mockSsoDataStorage";
import "../../../../../test/mocks/mockCryptoKey";
import GetSsoClientDataController from "./getSsoClientDataController";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import SsoKitClientPartEntity from "../../model/entity/sso/ssoKitClientPartEntity";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";

describe("GetSsoClientDataController", () => {
  describe("GetSsoClientDataController::exec", () => {
    it("Should return the local SSO kit.", async() => {
      expect.assertions(1);
      const ssoLocalKit = await clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);

      const controller = new GetSsoClientDataController();
      const ssoKit = await controller.exec();
      expect(ssoKit).toStrictEqual(new SsoKitClientPartEntity(ssoLocalKit));
    });
  });
});
