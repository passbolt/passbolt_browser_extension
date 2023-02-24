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
 * @since         3.10.0
 */

import MfaGetMfaSettingsController from "./mfaGetMfaSettingsController";
import {enableFetchMocks} from "jest-fetch-mock";
import {mfaDto} from './mfaGetMfaSettingsController.test.data';
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  enableFetchMocks();
});


describe("MfaGetMfaSettingsController", () => {
  it("can get the mfa settings for the current user", async() => {
    // Mock API fetch account recovery organization policy response.
    const mockApiResult = mfaDto();
    fetch.doMock(() => mockApiResponse(mockApiResult));

    expect.assertions(1);
    const controller = new MfaGetMfaSettingsController(null, null, defaultApiClientOptions());
    const result = await controller.exec();
    expect(result.toJSON()).toEqual(mockApiResult);
  });
});
