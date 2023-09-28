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
import MfaSetupRemoveProviderController from "./MfaSetupRemoveProviderController";
import {defaultMfaProviderData} from "../../model/entity/mfa/mfaProviderEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import MfaProviderEntity from "../../model/entity/mfa/mfaProviderEntity";

beforeEach(() => {
  enableFetchMocks();
});


describe("MfaSetupRemoveProviderController", () => {
  let controller;

  beforeEach(() => {
    controller = new MfaSetupRemoveProviderController(null, null, defaultApiClientOptions());
  });

  it("Should remove the totp", async() => {
    expect.assertions(1);
    jest.spyOn(controller.multiFactorAuthenticationModel, "removeProvider");

    fetch.doMock(() => mockApiResponse({}));

    await controller.exec(defaultMfaProviderData());

    expect(controller.multiFactorAuthenticationModel.removeProvider).toHaveBeenCalledWith(new MfaProviderEntity(defaultMfaProviderData()));
  });

  it("Should validate the totp with entity", async() => {
    expect.assertions(2);

    try {
      await controller.exec({});
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.hasError('provider', 'required')).toBeTruthy();
    }
  });
});
