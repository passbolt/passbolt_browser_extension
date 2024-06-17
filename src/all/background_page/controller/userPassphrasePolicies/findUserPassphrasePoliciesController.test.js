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
 * @since         4.3.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import AccountEntity from "../../model/entity/account/accountEntity";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultUserPassphrasePoliciesEntityDto} from "passbolt-styleguide/src/shared/models/userPassphrasePolicies/UserPassphrasePoliciesDto.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import FindUserPassphrasePoliciesController from "./findUserPassphrasePoliciesController";

describe("FindUserPassphrasePoliciesController", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  it("Should return the value from the API", async() => {
    expect.assertions(1);

    const expectedDto = defaultUserPassphrasePoliciesEntityDto({
      entropy_minimum: 112
    });
    const expectedEntity = new UserPassphrasePoliciesEntity(expectedDto);
    fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponse(expectedDto));

    const controller = new FindUserPassphrasePoliciesController(null, null, apiClientOptions);
    const result = await controller.exec();
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should return the default value if the plugin is disabled", async() => {
    expect.assertions(1);

    const expectedEntity = UserPassphrasePoliciesEntity.createFromDefault();
    fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponseError(500, "Something went wrong"));

    const controller = new FindUserPassphrasePoliciesController(null, null, apiClientOptions);
    const result = await controller.exec();
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should return the default value if something goes wrong on the API", async() => {
    expect.assertions(1);

    const expectedEntity = UserPassphrasePoliciesEntity.createFromDefault();
    fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => { throw new Error("Something went wrong"); });

    const controller = new FindUserPassphrasePoliciesController(null, null, apiClientOptions);
    const result = await controller.exec();
    expect(result).toStrictEqual(expectedEntity);
  });
});
