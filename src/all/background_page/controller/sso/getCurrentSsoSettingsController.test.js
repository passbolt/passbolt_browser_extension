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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import GetCurrentSsoSettingsController from "./getCurrentSsoSettingsController";
import {withAzureSsoSettings} from "./getCurrentSsoSettingsController.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import SsoSettingsEntity from "../../model/entity/sso/ssoSettingsEntity";

beforeEach(() => {
  enableFetchMocks();
});

describe("GetCurrentSsoSettingsController", () => {
  describe("GetCurrentSsoSettingsController::exec", () => {
    it("Should retrieve the current SSO settings.", async() => {
      expect.assertions(1);
      const ssoSettingsDto = withAzureSsoSettings();
      fetch.doMockOnceIf(new RegExp(`/sso/settings/current.json`), () => mockApiResponse(ssoSettingsDto));

      const controller = new GetCurrentSsoSettingsController(null, null, defaultApiClientOptions());
      const settings = await controller.exec();

      expect(settings).toStrictEqual(new SsoSettingsEntity(ssoSettingsDto));
    });
  });
});
