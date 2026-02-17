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
 * @since         5.10.0
 */

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { mockMfaSettings } from "passbolt-styleguide/src/react-extension/components/Administration/DisplayMfaAdministration/DisplayMfaAdministration.test.data";
import DuoUserSettingsService from "./duoUserSettingsService";
import BrowserTabService from "../ui/browserTab.service";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DuoUserSettingsService", () => {
  let service;

  beforeEach(() => {
    service = new DuoUserSettingsService(defaultApiClientOptions());
  });

  describe("DuoUserSettingsService::startSetup", () => {
    it("Should redirect the user to the Duo sign-in URL", async () => {
      expect.assertions(1);

      const duoLocation = `https://${mockMfaSettings.duo.hostName}/oauth/v1/authorize`;

      jest.spyOn(service.mfaService, "findAllSettings").mockResolvedValue(mockMfaSettings);
      jest.spyOn(service.duoApiService, "promptUserForDuoSignin").mockResolvedValue({
        headers: new Headers({ Location: duoLocation }),
      });
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});

      await service.startSetup();

      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(duoLocation);
    });

    it("Should throw if Duo hostname is not a string", async () => {
      expect.assertions(1);

      const settingsWithoutHostname = Object.assign({}, mockMfaSettings, {
        duo: { hostName: null, integrationKey: "key", secretKey: "secret" },
      });

      jest.spyOn(service.mfaService, "findAllSettings").mockResolvedValue(settingsWithoutHostname);

      await expect(service.startSetup()).rejects.toThrow("The MFA Duo settings is not valid");
    });

    it("Should throw if Duo clientId is not a string", async () => {
      expect.assertions(1);

      const settingsWithoutClientId = Object.assign({}, mockMfaSettings, {
        duo: { hostName: "api-123456af.duosecurity.com", integrationKey: null, secretKey: "secret" },
      });

      jest.spyOn(service.mfaService, "findAllSettings").mockResolvedValue(settingsWithoutClientId);

      await expect(service.startSetup()).rejects.toThrow("The MFA Duo settings is not valid");
    });

    it("Should throw if Duo clientSecret is not a string", async () => {
      expect.assertions(1);

      const settingsWithoutSecret = Object.assign({}, mockMfaSettings, {
        duo: { hostName: "api-123456af.duosecurity.com", integrationKey: "key", secretKey: null },
      });

      jest.spyOn(service.mfaService, "findAllSettings").mockResolvedValue(settingsWithoutSecret);

      await expect(service.startSetup()).rejects.toThrow("The MFA Duo settings is not valid");
    });
  });

  describe("DuoUserSettingsService::assertDuoUrl", () => {
    it("Should throw if the redirect URL is not a valid string", () => {
      expect.assertions(1);

      expect(() => service.assertDuoUrl(null, "duo.example.com")).toThrow("The given URL is not a valid string");
    });

    it("Should throw if the redirect URL is not https", () => {
      expect.assertions(1);

      expect(() => service.assertDuoUrl("http://duo.example.com/auth", "duo.example.com")).toThrow(
        "The given URL must use the protocol https:",
      );
    });

    //@todo: to unskip when the domain is checked again
    it.skip("Should throw if the redirect URL host doesn't match the configured Duo hostname", () => {
      expect.assertions(1);

      expect(() => service.assertDuoUrl("https://evil.example.com/auth", "duo.example.com")).toThrow(
        "The given URL must use the configured domain to sign in with Duo",
      );
    });

    it("Should not throw for a valid Duo URL", () => {
      expect.assertions(1);

      expect(() => service.assertDuoUrl("https://duo.example.com/auth", "duo.example.com")).not.toThrow();
    });
  });
});
