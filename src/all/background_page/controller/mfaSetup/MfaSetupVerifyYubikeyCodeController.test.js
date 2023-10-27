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
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import MfaSetupVerifyYubikeyCodeController from "./MfaSetupVerifyYubikeyCodeController";
import {defaultSetupYubikeyData} from "../../model/entity/mfa/mfaSetupYubikeyEntity.test.data";
import MfaSetupYubikeyEntity from "../../model/entity/mfa/mfaSetupYubikeyEntity";

beforeEach(() => {
  enableFetchMocks();
});


describe("MfaSetupVerifyYubikeyCodeController", () => {
  let controller;

  beforeEach(() => {
    controller = new MfaSetupVerifyYubikeyCodeController(null, null, defaultApiClientOptions());
  });

  it("Should verify the otp code", async() => {
    expect.assertions(1);
    jest.spyOn(controller.multiFactorAuthenticationModel, "setupYubikey");

    fetch.doMock(() => mockApiResponse({}));

    await controller.exec(defaultSetupYubikeyData());

    expect(controller.multiFactorAuthenticationModel.setupYubikey).toHaveBeenCalledWith(new MfaSetupYubikeyEntity(defaultSetupYubikeyData()));
  });

  it("Should validate the hotp code with entity", async() => {
    expect.assertions(2);

    try {
      await controller.exec({});
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.hasError('hotp', 'required')).toBeTruthy();
    }
  });
});
