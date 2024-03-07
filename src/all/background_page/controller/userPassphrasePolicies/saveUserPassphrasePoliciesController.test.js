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
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";
import {defaultUserPassphrasePoliciesEntityDto, userPassphrasePoliciesEntityDtoFromApi} from "passbolt-styleguide/src/shared/models/userPassphrasePolicies/UserPassphrasePoliciesDto.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import SaveUserPassphrasePoliciesController from "./saveUserPassphrasePoliciesController";

describe("SaveUserPassphrasePoliciesController", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  it("Should save the given dto on the API", async() => {
    expect.assertions(2);

    const dtoToSave = defaultUserPassphrasePoliciesEntityDto({
      entropy_minimum: 112,
      external_dictionary_check: false
    });
    const expectedDto = userPassphrasePoliciesEntityDtoFromApi(dtoToSave);
    const expectedEntity = new UserPassphrasePoliciesEntity(expectedDto);

    fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, async request => {
      const body = JSON.parse(await request.text());
      expect(body).toStrictEqual(dtoToSave);
      return mockApiResponse(expectedDto);
    });

    const controller = new SaveUserPassphrasePoliciesController(null, null, apiClientOptions);
    const result = await controller.exec(dtoToSave);
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should throw an exception if something wrong happens on the API", async() => {
    expect.assertions(1);

    fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => mockApiResponseError(500, "Something went wrong"));

    const dto = defaultUserPassphrasePoliciesEntityDto();
    const controller = new SaveUserPassphrasePoliciesController(null, null, apiClientOptions);
    expect(() => controller.exec(dto)).rejects.toBeInstanceOf(PassboltApiFetchError);
  });

  it("Should return the default value if something goes when requesting the API", async() => {
    expect.assertions(1);
    fetch.doMockOnceIf(/user-passphrase-policies\/settings\.json/, () => { throw new Error("Something went wrong"); });

    const dto = defaultUserPassphrasePoliciesEntityDto();
    const controller = new SaveUserPassphrasePoliciesController(null, null, apiClientOptions);
    expect(() => controller.exec(dto)).rejects.toBeInstanceOf(PassboltServiceUnavailableError);
  });
});
