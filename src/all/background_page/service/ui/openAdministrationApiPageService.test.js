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
import OpenAdministrationApiPageService from "./openAdministrationApiPageService";
import BrowserTabService from "./browserTab.service";
import User from "../../model/user";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenAdministrationApiPageService", () => {
  describe("::openPage", () => {
    it("Should open the mfa-policy administration page", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});
      // process
      const service = new OpenAdministrationApiPageService();
      await service.openPage("/app/administration/mfa-policy");
      // expectations
      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(`${domain}/app/administration/mfa-policy`);
    });

    it("Should open the mfa administration page", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});
      // process
      const service = new OpenAdministrationApiPageService();
      await service.openPage("/app/administration/mfa");
      // expectations
      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(`${domain}/app/administration/mfa`);
    });

    it("Should open the users-directory administration page", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});
      // process
      const service = new OpenAdministrationApiPageService();
      await service.openPage("/app/administration/users-directory");
      // expectations
      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(
        `${domain}/app/administration/users-directory`,
      );
    });

    it("Should open the healthcheck administration page", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});
      // process
      const service = new OpenAdministrationApiPageService();
      await service.openPage("/app/administration/healthcheck");
      // expectations
      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(`${domain}/app/administration/healthcheck`);
    });

    it("Should handle domain with trailing slash", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local/";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "updateCurrentTabUrl").mockImplementation(() => {});
      // process
      const service = new OpenAdministrationApiPageService();
      await service.openPage("/app/administration/mfa");
      // expectations
      expect(BrowserTabService.updateCurrentTabUrl).toHaveBeenCalledWith(
        "https://passbolt.local/app/administration/mfa",
      );
    });

    it("Should throw an error if the page name is not a string", async () => {
      expect.assertions(1);
      // process & expectations
      const service = new OpenAdministrationApiPageService();
      await expect(service.openPage(123)).rejects.toThrow();
    });

    it("Should throw an error if the page name is not in the allowed list", async () => {
      expect.assertions(1);
      // process & expectations
      const service = new OpenAdministrationApiPageService();
      await expect(service.openPage("/app/administration/unknown-page")).rejects.toThrow(
        "Unknown administration page: /app/administration/unknown-page",
      );
    });

    it("Should throw an error if the page name is null", async () => {
      expect.assertions(1);
      // process & expectations
      const service = new OpenAdministrationApiPageService();
      await expect(service.openPage(null)).rejects.toThrow();
    });
  });
});
