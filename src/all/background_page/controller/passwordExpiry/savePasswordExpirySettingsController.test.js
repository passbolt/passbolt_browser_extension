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
import AccountEntity from "../../model/entity/account/accountEntity";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import SavePasswordExpirySettingsController from "./savePasswordExpirySettingsController";
import PasswordExpirySettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity";
import {defaultPasswordExpiryProSettingsDto, defaultPasswordExpirySettingsDto, defaultPasswordExpirySettingsDtoFromApi} from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity.test.data";
import PasswordExpiryProSettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiryPro/passwordExpiryProSettingsEntity";
import {defaultProOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";

const mockedOrganisationSettings = new OrganizationSettingsEntity(defaultProOrganizationSettings());
jest.mock('../../model/organizationSettings/organizationSettingsModel', () => ({
  __esModule: true,
  default: () => ({
    getOrFind: () => mockedOrganisationSettings
  }),
}));

describe("SavePasswordExpirySettingsController", () => {
  let account, apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  it("Should save the given dto on the API using PasswordExpirySettingsEntity", async() => {
    expect.assertions(2);

    const dtoToSave = defaultPasswordExpirySettingsDto();
    const expectedDto = defaultPasswordExpirySettingsDtoFromApi(dtoToSave);
    const expectedEntity = new PasswordExpirySettingsEntity(expectedDto);

    fetch.doMockOnceIf(/password-expiry\/settings\.json/, async request => {
      const body = JSON.parse(await request.text());
      expect(body).toStrictEqual(dtoToSave);
      return mockApiResponse(expectedDto);
    });

    const controller = new SavePasswordExpirySettingsController(null, null, account, apiClientOptions);
    const result = await controller.exec(dtoToSave);
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should save the given dto on the API using PasswordExpiryProSettingsEntity", async() => {
    expect.assertions(2);

    const dtoToSave = defaultPasswordExpiryProSettingsDto();
    const expectedDto = defaultPasswordExpirySettingsDtoFromApi(dtoToSave);
    const expectedEntity = new PasswordExpiryProSettingsEntity(expectedDto);

    fetch.doMockOnceIf(/password-expiry\/settings\.json/, async request => {
      const body = JSON.parse(await request.text());
      expect(body).toStrictEqual(dtoToSave);
      return mockApiResponse(expectedDto);
    });

    const controller = new SavePasswordExpirySettingsController(null, null, account, apiClientOptions);
    jest.spyOn(controller.organisationSettingsModel, "getOrFind").mockImplementation(() => (Promise.resolve({
      isPluginEnabled: () => true
    })));
    jest.spyOn(controller.passwordExpirySettingsModel.organisationSettingsModel, "getOrFind").mockImplementation(() => (Promise.resolve({
      isPluginEnabled: () => true
    })));
    const result = await controller.exec(dtoToSave);
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should throw an exception if something wrong happens on the API", async() => {
    expect.assertions(1);

    fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => mockApiResponseError(500, "Something went wrong"));

    const dto = defaultPasswordExpirySettingsDto();
    const controller = new SavePasswordExpirySettingsController(null, null, account, apiClientOptions);
    await expect(() => controller.exec(dto)).rejects.toBeInstanceOf(PassboltApiFetchError);
  });

  it("Should return the default value if something goes when requesting the API", async() => {
    expect.assertions(1);
    fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => { throw new Error("Something went wrong"); });

    const dto = defaultPasswordExpirySettingsDto();
    const controller = new SavePasswordExpirySettingsController(null, null, account, apiClientOptions);
    await expect(() => controller.exec(dto)).rejects.toBeInstanceOf(PassboltServiceUnavailableError);
  });
});
