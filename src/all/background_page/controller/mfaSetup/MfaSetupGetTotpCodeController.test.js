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
 * @since         4.5.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import MfaSetupGetTotpCodeController from "./MfaSetupGetTotpCodeController";
import {defaultTotpQrCodeData} from "../../model/entity/mfa/mfaTotpSetupInfoEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});


describe("MfaSetupGetTotpCodeController", () => {
  let controller;

  beforeEach(() => {
    controller = new MfaSetupGetTotpCodeController(null, null, defaultApiClientOptions());
  });

  it("Should retrieve the totp uri", async() => {
    expect.assertions(2);
    jest.spyOn(controller.multiFactorAuthenticationModel, "getMfaToTpSetupInfo");

    fetch.doMock(() => mockApiResponse(defaultTotpQrCodeData()));

    const result = await controller.exec();

    expect(controller.multiFactorAuthenticationModel.getMfaToTpSetupInfo).toHaveBeenCalled();
    expect(result).toEqual(defaultTotpQrCodeData().otpProvisioningUri);
  });
});
