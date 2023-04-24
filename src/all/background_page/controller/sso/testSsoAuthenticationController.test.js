/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuid} from "uuid";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {withAzureSsoSettings} from "./saveSsoSettingsAsDraftController.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import TestSsoAuthenticationController from "./testSsoAuthenticationController";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import SsoLoginUrlEntity from "../../model/entity/sso/ssoLoginUrlEntity";
import SsoSettingsEntity from "../../model/entity/sso/ssoSettingsEntity";

const mock_getSsoTokenFromThirdParty = jest.fn();
const mock_closeHandler = jest.fn();

jest.mock("../../service/sso/popupHandlerService", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getSsoTokenFromThirdParty: mock_getSsoTokenFromThirdParty,
    closeHandler: mock_closeHandler
  }))
}));

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("TestSsoAuthenticationController", () => {
  const urlToHit = {url: "https://login.microsoftonline.us"};
  const account = {domain: urlToHit.url};

  describe("TestSsoAuthenticationController::exec", () => {
    it("Should save the given settings as a draft.", async() => {
      expect.assertions(5);

      const ssoLoginSuccessToken = uuid();
      const settingsId = uuid();
      const settings = withAzureSsoSettings({id: settingsId});

      fetch.doMockOnceIf(new RegExp(`/sso/settings/${settingsId}.json`), async() => mockApiResponse(settings));
      fetch.doMockOnceIf(new RegExp(`/sso/${settings.provider}/login/dry-run.json`), async req => {
        const body = JSON.parse(await req.text());
        expect(body).toStrictEqual({
          sso_settings_id: settingsId
        });

        return mockApiResponse(urlToHit);
      });

      mock_getSsoTokenFromThirdParty.mockImplementation(async() => ssoLoginSuccessToken);

      const controller = new TestSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      const resultingToken = await controller.exec(settingsId);

      expect(mock_getSsoTokenFromThirdParty).toHaveBeenCalledTimes(1);
      expect(mock_getSsoTokenFromThirdParty).toHaveBeenCalledWith(new SsoLoginUrlEntity(urlToHit, SsoSettingsEntity.AZURE));
      expect(mock_closeHandler).toHaveBeenCalledTimes(1);
      expect(resultingToken).toBe(ssoLoginSuccessToken);
    });
  });

  it("Should throw an error if something wrong happens during the rertieval of the draft settings.", async() => {
    expect.assertions(2);

    const settingsId = uuid();
    const expectedError = new PassboltApiFetchError("Something wrong happened!");

    fetch.doMockOnceIf(new RegExp(`/sso/settings/${settingsId}.json`), () => mockApiResponseError(500, expectedError.message));

    const controller = new TestSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
    try {
      await controller.exec(settingsId);
    } catch (e) {
      expect(e).toStrictEqual(expectedError);
      expect(mock_closeHandler).not.toHaveBeenCalled();
    }
  });

  it("Should throw an error if something wrong happens during the dry run SSO login.", async() => {
    expect.assertions(2);

    const settingsId = uuid();
    const settings = withAzureSsoSettings({id: settingsId});
    const expectedError = new PassboltApiFetchError("Something wrong happened!");

    fetch.doMockOnceIf(new RegExp(`/sso/settings/${settingsId}.json`), async() => mockApiResponse(settings));
    fetch.doMockOnceIf(new RegExp(`/sso/${settings.provider}/login/dry-run.json`), () => mockApiResponseError(500, expectedError.message));

    const controller = new TestSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
    try {
      await controller.exec(settingsId);
    } catch (e) {
      expect(e).toStrictEqual(expectedError);
      expect(mock_closeHandler).not.toHaveBeenCalled();
    }
  });
});
