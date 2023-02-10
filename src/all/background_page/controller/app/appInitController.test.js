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
import MockExtension from "../../../../../test/mocks/mockExtension";
import AppInitController from "./appInitController";
import User from "../../model/user";
import SsoKitTemporaryStorageService from "../../service/session_storage/ssoKitTemporaryStorageService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import {v4 as uuid} from "uuid";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {generateSsoKitServerData} from "../../model/entity/sso/ssoKitServerPart.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("AppInitController", () => {
  describe("AppInitController::main", () => {
    it("Should sync the user.", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const userInstance = User.getInstance();
      const spyOnUserSync = jest.spyOn(userInstance.settings, "sync");

      jest.spyOn(SsoKitTemporaryStorageService, "getAndFlush").mockImplementation(() => null);

      const controller = new AppInitController();
      await controller.main();

      expect(spyOnUserSync).toHaveBeenCalledTimes(1);
      expect(SsoDataStorage.updateLocalKitIdWith).not.toHaveBeenCalled();
    });

    it("Should call for the user default settings if the sync fails.", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const userInstance = User.getInstance();
      const spyOnUserSetDefaults = jest.spyOn(userInstance.settings, "setDefaults");

      jest.spyOn(userInstance.settings, "sync").mockImplementation(async() => { throw new Error("This is really bad"); });
      jest.spyOn(SsoKitTemporaryStorageService, "getAndFlush").mockImplementation(() => null);

      const controller = new AppInitController();
      await controller.main();

      expect(spyOnUserSetDefaults).toHaveBeenCalledTimes(1);
      expect(SsoDataStorage.updateLocalKitIdWith).not.toHaveBeenCalled();
    });

    it("Should sync the SSO kit if any.", async() => {
      expect.assertions(3);
      await MockExtension.withConfiguredAccount();
      const userInstance = User.getInstance();
      const storedServerSsoKit = {data: generateSsoKitServerData({})};
      const ssoKitServerResponse = Object.assign({}, storedServerSsoKit, {id: uuid()});

      jest.spyOn(userInstance.settings, "sync").mockImplementation(async() => null);
      jest.spyOn(SsoKitTemporaryStorageService, "getAndFlush").mockImplementation(async() => storedServerSsoKit);

      fetch.doMockOnceIf(new RegExp('/users/csrf-token.json'), async() => mockApiResponse("csrf-token"));
      fetch.doMockOnceIf(new RegExp('/sso/keys.json'), async req => {
        const body = JSON.parse(await req.text());
        expect(body).toStrictEqual(storedServerSsoKit);
        return mockApiResponse(ssoKitServerResponse);
      });

      const controller = new AppInitController();
      await controller.main();

      expect(SsoDataStorage.updateLocalKitIdWith).toHaveBeenCalledTimes(1);
      expect(SsoDataStorage.updateLocalKitIdWith).toHaveBeenCalledWith(ssoKitServerResponse.id);
    });
  });
});
