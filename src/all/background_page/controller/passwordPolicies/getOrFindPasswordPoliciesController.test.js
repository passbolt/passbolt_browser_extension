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
 * @since         4.2.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import GetOrFindPasswordPoliciesController from "./getOrFindPasswordPoliciesController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import PasswordPoliciesEntity from "../../model/entity/passwordPolicies/passwordPoliciesEntity";
import {defaultPasswordPolicies} from "../../model/entity/passwordPolicies/passwordPoliciesEntity.test.data";
import {defaultPasswordGeneratorSettings} from "../../model/entity/passwordPolicies/passwordGeneratorSettingsEntity.test.data";

describe("GetOrFindPasswordPoliciesController::exec", () => {
  let account, apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  it("Should return the password policies from the API if local storage is empty", async() => {
    expect.assertions(4);
    const expectedPasswordPolicies = defaultPasswordPolicies({
      default_generator: "passphrase",
    });

    fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(expectedPasswordPolicies));

    const controller = new GetOrFindPasswordPoliciesController(null, null, account, apiClientOptions);
    const spyOnGetOrFind = jest.spyOn(controller.passwordPoliciesModel, "getOrFind");
    const spyOnFind = jest.spyOn(controller.passwordPoliciesModel, "find");

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedPasswordPolicies);
    expect(spyOnGetOrFind).toHaveBeenCalledTimes(1);
    expect(spyOnFind).toHaveBeenCalledTimes(1);
  });

  it("Should return the password policies from the local storage if it exists", async() => {
    expect.assertions(4);
    const expectedPasswordPolicies = defaultPasswordPolicies({
      default_generator: "passphrase",
    });

    fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(expectedPasswordPolicies));

    const controller = new GetOrFindPasswordPoliciesController(null, null, account, apiClientOptions);
    const storage = controller.passwordPoliciesModel.passwordPoliciesLocalStorage;
    await storage.set(new PasswordPoliciesEntity(expectedPasswordPolicies));

    const spyOnGetOrFind = jest.spyOn(controller.passwordPoliciesModel, "getOrFind");
    const spyOnFind = jest.spyOn(controller.passwordPoliciesModel, "find");

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedPasswordPolicies);
    expect(spyOnGetOrFind).toHaveBeenCalledTimes(1);
    expect(spyOnFind).not.toHaveBeenCalled();
  });

  it("Should return the default password policies if something wrong happens on the API", async() => {
    expect.assertions(4);

    fetch.doMockOnceIf(/password-policies\/settings\.json/, () => { throw new Error("something went wrong"); });
    fetch.doMockOnceIf(/password-generator\/settings\.json/, () => { throw new Error("something went wrong"); });

    const controller = new GetOrFindPasswordPoliciesController(null, null, account, apiClientOptions);

    const spyOnGetOrFind = jest.spyOn(controller.passwordPoliciesModel, "getOrFind");
    const spyOnFind = jest.spyOn(controller.passwordPoliciesModel, "find");

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();
    const expectedDto = PasswordPoliciesEntity.createFromDefault().toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedDto);
    expect(spyOnGetOrFind).toHaveBeenCalledTimes(1);
    expect(spyOnFind).toHaveBeenCalledTimes(1);
  });

  it("should fallback to the old endpoint in case the new one is not availabled", async() => {
    expect.assertions(4);

    const passwordGeneratorSettings = {
      default_gnerator: "passphrase"
    };

    fetch.doMockOnceIf(/password-policies\/settings\.json/, () => { throw new Error("something went wrong"); });
    fetch.doMockOnceIf(/password-generator\/settings\.json/, () => mockApiResponse(passwordGeneratorSettings));

    const controller = new GetOrFindPasswordPoliciesController(null, null, account, apiClientOptions);

    const spyOnGetOrFind = jest.spyOn(controller.passwordPoliciesModel, "getOrFind");
    const spyOnFind = jest.spyOn(controller.passwordPoliciesModel, "find");

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();
    const expectedDto = PasswordPoliciesEntity.createFromDefault(passwordGeneratorSettings).toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedDto);
    expect(spyOnGetOrFind).toHaveBeenCalledTimes(1);
    expect(spyOnFind).toHaveBeenCalledTimes(1);
  });

  it("should not take, settings from API that generate too weak passwords and use the default generator instead", async() => {
    expect.assertions(2);

    const weakPasswordPolicies = defaultPasswordPolicies({
      default_generator: "passphrase",
      password_generator_settings: defaultPasswordGeneratorSettings({
        length: 4
      }),
    });

    fetch.doMockOnceIf(/password-policies\/settings\.json/, () => mockApiResponse(weakPasswordPolicies));

    const controller = new GetOrFindPasswordPoliciesController(null, null, account, apiClientOptions);

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();
    const expectedDto = PasswordPoliciesEntity.createFromDefault().toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedDto);
  });

  it("should not take, settings from local storage that generate too weak passwords and use the default generator instead", async() => {
    expect.assertions(2);

    const weakPasswordPolicies = defaultPasswordPolicies({
      default_generator: "passphrase",
      password_generator_settings: defaultPasswordGeneratorSettings({
        length: 4
      }),
    });

    const controller = new GetOrFindPasswordPoliciesController(null, null, account, apiClientOptions);
    const storage = controller.passwordPoliciesModel.passwordPoliciesLocalStorage;
    await storage.set(new PasswordPoliciesEntity(weakPasswordPolicies));

    const resultingPasswordPolicies = await controller.exec();

    const dto = resultingPasswordPolicies.toJSON();
    const expectedDto = PasswordPoliciesEntity.createFromDefault().toJSON();

    expect(resultingPasswordPolicies).toBeInstanceOf(PasswordPoliciesEntity);
    expect(dto).toStrictEqual(expectedDto);
  });
});
