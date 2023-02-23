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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import MfaGetPolicyController from './mfaGetPolicyController';
import MfaPolicyEntity from '../../model/entity/mfa/mfaPolicyEntity';

beforeEach(() => {
  enableFetchMocks();
});


describe("MfaGetPolicyController", () => {
  it("can get the current mfa policy", async() => {
    const apiResult = {policy: MfaPolicyEntity.MANDATORY, remember_me_for_a_month: true};
    // Mock API fetch account recovery organization policy response.
    fetch.doMock(() => mockApiResponse(apiResult));

    expect.assertions(1);
    const controller = new MfaGetPolicyController(null, null, defaultApiClientOptions());
    const result = await controller.exec();
    expect(result.toJSON()).toEqual(apiResult);
  });
});

