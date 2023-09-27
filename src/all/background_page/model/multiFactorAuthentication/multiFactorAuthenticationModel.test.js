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
 * @since         4.3.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import MultiFactorAuthenticationModel from "./multiFactorAuthenticationModel";
import {defaultSetupTotpData} from "../entity/mfa/mfaSetupTotpEntity.test.data";
import {defaultVerifyProviderData} from "../entity/mfa/mfaVerifyProviderEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});


describe("MultiFactorAuthenticationModel", () => {
  let model;

  beforeEach(() => {
    model = new MultiFactorAuthenticationModel(defaultApiClientOptions());
  });

  it("Should able to setup totp", async() => {
    expect.assertions(1);
    jest.spyOn(model.multiFactorAuthenticationService, "setupTotp");

    fetch.doMock(() => mockApiResponse({}));

    await model.setupTotp(defaultSetupTotpData());

    expect(model.multiFactorAuthenticationService.setupTotp).toHaveBeenCalledWith(defaultSetupTotpData());
  });

  it("Should able to verify a MFA configuration", async() => {
    expect.assertions(2);
    jest.spyOn(model.multiFactorAuthenticationService, "verifyProvider");

    fetch.doMock(() => mockApiResponse(defaultVerifyProviderData()));

    const result = await model.verifyProvider("totp");

    expect(model.multiFactorAuthenticationService.verifyProvider).toHaveBeenCalledWith("totp");
    expect(result).toEqual(defaultVerifyProviderData());
  });

  it("Should able to remove a MFA provider", async() => {
    expect.assertions(1);
    jest.spyOn(model.multiFactorAuthenticationService, "removeProvider");

    fetch.doMock(() => mockApiResponse({}));

    await model.removeProvider("totp");

    expect(model.multiFactorAuthenticationService.removeProvider).toHaveBeenCalledWith("totp");
  });
});
