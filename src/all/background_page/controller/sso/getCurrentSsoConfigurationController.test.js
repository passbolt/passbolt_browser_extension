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
import GetCurrentSsoConfigurationController from "./getCurrentSsoConfigurationController";
import {withAzureSsoSettings} from "./getCurrentSsoConfigurationController.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import SsoConfigurationEntity from "../../model/entity/sso/ssoConfigurationEntity";

beforeEach(() => {
  enableFetchMocks();
});

describe("GetCurrentSsoConfigurationController", () => {
  describe("GetCurrentSsoConfigurationController::exec", () => {
    it("Should retrieve the current SSO configuration.", async() => {
      expect.assertions(1);
      const ssoSettingsDto = withAzureSsoSettings();
      fetch.doMockOnceIf(new RegExp(`/sso/settings/current.json`), () => mockApiResponse(ssoSettingsDto));

      const controller = new GetCurrentSsoConfigurationController(null, null, defaultApiClientOptions());
      const settings = await controller.exec();

      expect(settings).toStrictEqual(new SsoConfigurationEntity(ssoSettingsDto));
    });
  });
});
