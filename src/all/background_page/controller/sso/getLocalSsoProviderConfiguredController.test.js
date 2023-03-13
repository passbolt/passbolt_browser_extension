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
import "../../../../../test/mocks/mockCryptoKey";
import "../../../../../test/mocks/mockSsoDataStorage";
import GetLocalSsoProviderConfiguredController from "./getLocalSsoProviderConfiguredController";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";

describe("GetLocalSsoProviderConfiguredController", () => {
  describe("GetLocalSsoProviderConfiguredController::exec", () => {
    it("Should return the local SSO kit.", async() => {
      expect.assertions(1);
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);

      const controller = new GetLocalSsoProviderConfiguredController();
      const provider = await controller.exec();
      expect(provider).toStrictEqual(ssoLocalKit.provider);
    });

    it("Should return null if no local SSO kit has been built.", async() => {
      expect.assertions(1);
      SsoDataStorage.setMockedData(null);

      const controller = new GetLocalSsoProviderConfiguredController();
      const provider = await controller.exec();
      expect(provider).toBeNull();
    });

    it("Should return null if the local SSO kit is not complete.", async() => {
      expect.assertions(1);
      const ssoLocalKit = clientSsoKit({id: null});
      SsoDataStorage.setMockedData(ssoLocalKit);

      const controller = new GetLocalSsoProviderConfiguredController();
      const provider = await controller.exec();
      expect(provider).toBeNull();
    });
  });
});
