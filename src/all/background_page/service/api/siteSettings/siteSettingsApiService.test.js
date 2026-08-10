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
 * @since         6.0.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse, mockApiResponseError } from "passbolt-styleguide/test/mocks/mockApiResponse";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import { defaultProSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import SiteSettingsApiService from "./siteSettingsApiService";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  jest.clearAllMocks();
});

describe("SiteSettingsApiService", () => {
  describe("::findSiteSettings", () => {
    it("issues a GET /settings.json request and returns the body", async () => {
      expect.assertions(3);
      const expectedDto = defaultProSiteSettings();
      fetch.doMockOnceIf(/settings\.json/, () => mockApiResponse(expectedDto));

      const service = new SiteSettingsApiService(defaultApiClientOptions());
      const result = await service.findSiteSettings();

      expect(result.app).toEqual(expectedDto.app);
      expect(result.passbolt).toEqual(expectedDto.passbolt);
      expect(result.serverTimeDiff).toBeNull();
    });

    it("merges the servertime header into serverTimeDiff (ms)", async () => {
      expect.assertions(1);
      const expectedDto = defaultProSiteSettings();
      const nowSec = Math.floor(Date.now() / 1000);
      const serverAheadSec = nowSec + 60;
      fetch.doMockOnceIf(/settings\.json/, () => mockApiResponse(expectedDto, { servertime: serverAheadSec }));

      const service = new SiteSettingsApiService(defaultApiClientOptions());
      const result = await service.findSiteSettings();

      // serverTimeDiff should be positive (server ahead). Allow ~5s of fuzz for test runtime.
      expect(result.serverTimeDiff).toBeGreaterThan(55_000);
    });

    it("throws PassboltApiFetchError on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/settings\.json/, () => mockApiResponseError(500, "boom"));
      const service = new SiteSettingsApiService(defaultApiClientOptions());
      await expect(() => service.findSiteSettings()).rejects.toThrow(PassboltApiFetchError);
    });
  });
});
