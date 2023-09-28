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
import PasswordPoliciesEntity from "../../model/entity/passwordPolicies/passwordPoliciesEntity";
import FindPasswordPoliciesController from "./findPasswordPoliciesController";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultPasswordPolicies} from "../../model/entity/passwordPolicies/passwordPoliciesEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

describe("FindPasswordPoliciesController::exec", () => {
  let account, apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    jest.resetAllMocks();
    fetch.doMockIf(/users\/csrf-token\.json/, () => mockApiResponse("csrf-token"));

    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  it("Should return the registered password policies", async() => {
    expect.assertions(4);

    const expectedPasswordPolicies = defaultPasswordPolicies({
      default_generator: "passphrase"
    });

    fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(expectedPasswordPolicies));

    const controller = new FindPasswordPoliciesController(null, null, account, apiClientOptions);
    const spyOnFind = jest.spyOn(controller.passwordPoliciesModel, "find");
    const spyOnGetOrFind = jest.spyOn(controller.passwordPoliciesModel, "getOrFind");

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedPasswordPolicies);
    expect(spyOnFind).toHaveBeenCalledTimes(1);
    expect(spyOnGetOrFind).not.toHaveBeenCalled();
  });

  it("Should return the default password policies if something wrong happens ont the API", async() => {
    expect.assertions(2);

    const throwErrorCallback = () => { throw new Error("Something went wrong!"); };
    fetch.doMockOnceIf(/password-policies\/settings\.json/, throwErrorCallback);
    fetch.doMockOnceIf(/password-generator\/settings\.json/, throwErrorCallback);

    const controller = new FindPasswordPoliciesController(null, null, account, apiClientOptions);
    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();
    const defaultDto = PasswordPoliciesEntity.createFromDefault().toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(defaultDto);
  });

  it("Should return the default password policies if something wrong happens ont the model", async() => {
    expect.assertions(2);

    const controller = new FindPasswordPoliciesController(null, null, account, apiClientOptions);
    jest.spyOn(controller.passwordPoliciesModel, "find").mockImplementation(() => { throw new Error("Something went wrong!"); });

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();
    const defaultDto = PasswordPoliciesEntity.createFromDefault().toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(defaultDto);
  });
});
