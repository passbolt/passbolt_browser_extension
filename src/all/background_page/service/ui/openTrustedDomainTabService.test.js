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
import OpenTrustedDomainTabService from "./openTrustedDomainTabService";
import BrowserTabService from "./browserTab.service";
import User from "../../model/user";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenTrustedDomainTabService", () => {
  describe("::openTab", () => {
    it("Should open a new tab with the trusted domain", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "openTab").mockImplementation(() => {});
      // process
      const service = new OpenTrustedDomainTabService();
      await service.openTab();
      // expectations
      expect(BrowserTabService.openTab).toHaveBeenCalledWith(domain);
    });

    it("Should open a new tab with the trusted domain including port", async () => {
      expect.assertions(1);
      // mock data
      const domain = "https://passbolt.local:4443";
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => domain,
        },
      }));
      jest.spyOn(BrowserTabService, "openTab").mockImplementation(() => {});
      // process
      const service = new OpenTrustedDomainTabService();
      await service.openTab();
      // expectations
      expect(BrowserTabService.openTab).toHaveBeenCalledWith(domain);
    });

    it("Should propagate errors from User.getInstance", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(User, "getInstance").mockImplementation(() => ({
        settings: {
          getDomain: () => {
            throw new Error("Trusted domain is not set");
          },
        },
      }));
      // process
      const service = new OpenTrustedDomainTabService();
      // expectations
      await expect(service.openTab()).rejects.toThrow("Trusted domain is not set");
    });
  });
});
