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
import {withAzureSsoSettings} from "./saveSsoConfigurationAsDraftController.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import TestAzureSsoAuthenticationController from "./testAzureSsoAuthenticationController";
import PassboltApiFetchError from "../../error/passboltApiFetchError";

const mock_getCodeFromThirdParty = jest.fn();
const mock_closeHandler = jest.fn();

jest.mock("../../service/sso/azurePopupHandlerService", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getCodeFromThirdParty: mock_getCodeFromThirdParty,
    closeHandler: mock_closeHandler
  }))
}));

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("TestAzureSsoAuthenticationController", () => {
  const fakeUrlToHit = "https://fakeurl.passbolt.com";
  const account = {domain: fakeUrlToHit};
  describe("TestAzureSsoAuthenticationController::exec", () => {
    it("Should save the given configuration as a draft.", async() => {
      expect.assertions(5);

      const ssoLoginSuccessToken = uuid();
      const configurationId = uuid();
      const configuration = withAzureSsoSettings({id: configurationId});

      fetch.doMockOnceIf(new RegExp(`/sso/settings/${configurationId}.json`), async() => mockApiResponse(configuration));
      fetch.doMockOnceIf(new RegExp(`/sso/${configuration.provider}/login/dry-run.json`), async req => {
        const body = JSON.parse(await req.text());
        expect(body).toStrictEqual({
          sso_settings_id: configurationId
        });

        return mockApiResponse({
          url: fakeUrlToHit
        });
      });

      mock_getCodeFromThirdParty.mockImplementation(async() => ssoLoginSuccessToken);

      const controller = new TestAzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      const resultingToken = await controller.exec(configurationId);

      expect(mock_getCodeFromThirdParty).toHaveBeenCalledTimes(1);
      expect(mock_getCodeFromThirdParty).toHaveBeenCalledWith(new URL(fakeUrlToHit));
      expect(mock_closeHandler).toHaveBeenCalledTimes(1);
      expect(resultingToken).toBe(ssoLoginSuccessToken);
    });
  });

  it("Should throw an error if something wrong happens during the rertieval of the draft configuration.", async() => {
    expect.assertions(2);

    const configurationId = uuid();
    const expectedError = new PassboltApiFetchError("Something wrong happened!");

    fetch.doMockOnceIf(new RegExp(`/sso/settings/${configurationId}.json`), () => mockApiResponseError(500, expectedError.message));

    const controller = new TestAzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
    try {
      await controller.exec(configurationId);
    } catch (e) {
      expect(e).toStrictEqual(expectedError);
      expect(mock_closeHandler).not.toHaveBeenCalled();
    }
  });

  it("Should throw an error if something wrong happens during the dry run SSO login.", async() => {
    expect.assertions(2);

    const configurationId = uuid();
    const configuration = withAzureSsoSettings({id: configurationId});
    const expectedError = new PassboltApiFetchError("Something wrong happened!");

    fetch.doMockOnceIf(new RegExp(`/sso/settings/${configurationId}.json`), async() => mockApiResponse(configuration));
    fetch.doMockOnceIf(new RegExp(`/sso/${configuration.provider}/login/dry-run.json`), () => mockApiResponseError(500, expectedError.message));

    const controller = new TestAzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
    try {
      await controller.exec(configurationId);
    } catch (e) {
      expect(e).toStrictEqual(expectedError);
      expect(mock_closeHandler).not.toHaveBeenCalled();
    }
  });
});
