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

      jest.spyOn(service.duoApiService, "promptUserForDuoSignin").mockResolvedValue({
        headers: new Headers({ Location: duoLocation }),
      });
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});

      await service.startSetup();

      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(duoLocation);
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

    it("Should not throw for a valid Duo URL", () => {
      expect.assertions(1);

      expect(() => service.assertDuoUrl("https://duo.example.com/auth", "duo.example.com")).not.toThrow();
    });
  });
});
