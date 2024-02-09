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
 * @since         4.4.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import MultiFactorAuthenticationModel from "./multiFactorAuthenticationModel";
import {defaultSetupTotpData} from "../entity/mfa/mfaSetupTotpEntity.test.data";
import {defaultVerifyProviderData} from "../entity/mfa/mfaVerifyProviderEntity.test.data";
import MfaVerifyProviderEntity from "../entity/mfa/mfaVerifyProviderEntity";
import {defaultMfaProviderData} from "../entity/mfa/mfaProviderEntity.test.data";
import MfaSetupTotpEntity from "../entity/mfa/mfaSetupTotpEntity";
import MfaProviderEntity from "../entity/mfa/mfaProviderEntity";
import {defaultTotpQrCodeData} from "../entity/mfa/mfaTotpSetupInfoEntity.test.data";

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

    await model.setupTotp(new MfaSetupTotpEntity(defaultSetupTotpData()));

    expect(model.multiFactorAuthenticationService.setupTotp).toHaveBeenCalledWith(defaultSetupTotpData());
  });

  it("Should able to verify a MFA configuration", async() => {
    expect.assertions(2);
    jest.spyOn(model.multiFactorAuthenticationService, "verifyProvider");

    fetch.doMock(() => mockApiResponse(defaultVerifyProviderData()));

    const result = await model.verifyProvider(new defaultMfaProviderData());

    expect(model.multiFactorAuthenticationService.verifyProvider).toHaveBeenCalledWith("totp");
    expect(result).toEqual(new MfaVerifyProviderEntity(defaultVerifyProviderData()));
  });

  it("Should able to remove a MFA provider", async() => {
    expect.assertions(1);
    jest.spyOn(model.multiFactorAuthenticationService, "removeProvider");

    fetch.doMock(() => mockApiResponse({}));

    await model.removeProvider(new MfaProviderEntity(defaultMfaProviderData()));

    expect(model.multiFactorAuthenticationService.removeProvider).toHaveBeenCalledWith("totp");
  });

  it("Should retrieve the QR code uri from API", async() => {
    expect.assertions(2);
    jest.spyOn(model.multiFactorAuthenticationService, "getMfaToTpSetupInfo");

    fetch.doMock(() => mockApiResponse(defaultTotpQrCodeData()));

    const result = await model.getMfaToTpSetupInfo();

    expect(model.multiFactorAuthenticationService.getMfaToTpSetupInfo).toHaveBeenCalled();
    expect(result).toEqual(defaultTotpQrCodeData().otpProvisioningUri);
  });
});
