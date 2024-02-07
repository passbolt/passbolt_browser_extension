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
import FindPasswordExpirySettingsController from "./findPasswordExpirySettingsController";
import {defaultPasswordExpirySettingsDtoFromApi} from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity.test.data";
import PasswordExpirySettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";
import {defaultProOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import browser from "../../sdk/polyfill/browserPolyfill";

const mockedOrganisationSettings = new OrganizationSettingsEntity(defaultProOrganizationSettings());
jest.mock('../../model/organizationSettings/organizationSettingsModel', () => ({
  __esModule: true,
  default: () => ({
    getOrFind: () => mockedOrganisationSettings
  }),
}));

describe("FindPasswordExpirySettingsController", () => {
  let account, apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    jest.resetAllMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));

    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
  });

  it("Should return the value from the API", async() => {
    expect.assertions(1);

    const expectedDto = defaultPasswordExpirySettingsDtoFromApi();
    const expectedEntity = new PasswordExpirySettingsEntity(expectedDto);
    fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => mockApiResponse(expectedDto));

    const controller = new FindPasswordExpirySettingsController(null, null, account, apiClientOptions);
    const result = await controller.exec();
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should return the default value if the plugin is disabled", async() => {
    expect.assertions(1);

    const expectedEntity = PasswordExpirySettingsEntity.createFromDefault();
    fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => mockApiResponseError(500, "Something went wrong"));

    const controller = new FindPasswordExpirySettingsController(null, null, account, apiClientOptions);
    const result = await controller.exec();
    expect(result).toStrictEqual(expectedEntity);
  });

  it("Should return the default value if something goes wrong on the API", async() => {
    expect.assertions(1);

    const expectedEntity = PasswordExpirySettingsEntity.createFromDefault();
    fetch.doMockOnceIf(/password-expiry\/settings\.json/, () => { throw new Error("Something went wrong"); });

    const controller = new FindPasswordExpirySettingsController(null, null, account, apiClientOptions);
    const result = await controller.exec();
    expect(result).toStrictEqual(expectedEntity);
  });
});