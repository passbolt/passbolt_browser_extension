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
import {defaultMfaProviderData} from "../../model/entity/mfa/mfaProviderEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import MfaSetupVerifyProviderController from "./MfaSetupVerifyProviderController";
import {defaultVerifyProviderData} from "../../model/entity/mfa/mfaVerifyProviderEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});


describe("MfaSetupVerifyProviderController", () => {
  let controller;

  beforeEach(() => {
    controller = new MfaSetupVerifyProviderController(null, null, defaultApiClientOptions());
  });

  it("Should retrieve the verify date from totp", async() => {
    expect.assertions(2);
    jest.spyOn(controller.multiFactorAuthenticationModel, "verifyProvider");

    fetch.doMock(() => mockApiResponse(defaultVerifyProviderData()));
    const result = await controller.exec(defaultMfaProviderData());

    expect(controller.multiFactorAuthenticationModel.verifyProvider).toHaveBeenCalledWith(defaultMfaProviderData().provider);
    expect(result).toEqual(defaultVerifyProviderData());
  });

  it("Should validate the mfa provider with entity", async() => {
    expect.assertions(2);

    try {
      await controller.exec({});
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.hasError('provider', 'required')).toBeTruthy();
    }
  });
});
