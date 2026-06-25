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
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultProSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import SiteSettingsApiService from "../api/siteSettings/siteSettingsApiService";
import FindSiteSettingsService from "./findSiteSettingsService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindSiteSettingsService", () => {
  describe("::findSiteSettings", () => {
    it("returns a SiteSettingsEntity built from the API DTO", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      jest.spyOn(SiteSettingsApiService.prototype, "findSiteSettings").mockResolvedValue(dto);

      const service = new FindSiteSettingsService(defaultApiClientOptions());
      const entity = await service.findSiteSettings();

      expect(entity).toBeInstanceOf(SiteSettingsEntity);
      expect(entity.toDto()).toEqual(dto);
    });

    it("returns a disabled SiteSettingsEntity on 403 (cloud disabled-org)", async () => {
      expect.assertions(2);
      const error = new PassboltApiFetchError("Forbidden", { code: 403 });
      jest.spyOn(SiteSettingsApiService.prototype, "findSiteSettings").mockRejectedValue(error);

      const service = new FindSiteSettingsService(defaultApiClientOptions());
      const entity = await service.findSiteSettings();

      expect(entity).toBeInstanceOf(SiteSettingsEntity);
      expect(entity.toDto()).toEqual({ status: "disabled" });
    });

    it("rethrows non-403 API errors", async () => {
      expect.assertions(1);
      const error = new PassboltApiFetchError("Server error", { code: 500 });
      jest.spyOn(SiteSettingsApiService.prototype, "findSiteSettings").mockRejectedValue(error);

      const service = new FindSiteSettingsService(defaultApiClientOptions());
      await expect(service.findSiteSettings()).rejects.toThrow(PassboltApiFetchError);
    });

    it("rethrows non-PassboltApiFetchError errors", async () => {
      expect.assertions(1);
      jest.spyOn(SiteSettingsApiService.prototype, "findSiteSettings").mockRejectedValue(new Error("network down"));

      const service = new FindSiteSettingsService(defaultApiClientOptions());
      await expect(service.findSiteSettings()).rejects.toThrow("network down");
    });
  });
});
