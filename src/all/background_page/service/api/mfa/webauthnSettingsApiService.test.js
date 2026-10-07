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
 * @since         5.17.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse, mockApiResponseError } from "../../../../../../test/mocks/mockApiResponse";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import WebauthnSettingsApiService from "./webauthnSettingsApiService";
import { defaultMfaWebauthnSettingsDto } from "../../../model/entity/mfa/mfaWebauthnSettingsEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("WebauthnSettingsApiService", () => {
  let service;

  beforeEach(() => {
    service = new WebauthnSettingsApiService(defaultApiClientOptions());
  });

  it("has the correct resource name", () => {
    expect.assertions(1);
    expect(WebauthnSettingsApiService.RESOURCE_NAME).toEqual("/mfa/settings/webauthn");
  });

  describe("WebauthnSettingsApiService::find", () => {
    it("gets the settings and returns the body", async () => {
      expect.assertions(2);
      const dto = defaultMfaWebauthnSettingsDto();
      fetch.doMockOnceIf(/mfa\/settings\/webauthn\.json/, async (req) => {
        expect(req.method).toEqual("GET");
        return mockApiResponse(dto);
      });
      const passboltResponseEntity = await service.find();
      expect(passboltResponseEntity.body).toEqual(dto);
    });

    it("throws on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/mfa\/settings\/webauthn\.json/, () => mockApiResponseError(500, "Something went wrong"));
      await expect(service.find()).rejects.toThrow(PassboltApiFetchError);
    });
  });
});
