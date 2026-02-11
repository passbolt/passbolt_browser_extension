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
import OpenTrustedDomainTabController from "./openTrustedDomainTabController";
import OpenTrustedDomainTabService from "../../service/ui/openTrustedDomainTabService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenTrustedDomainTabController", () => {
  describe("::exec", () => {
    it("Should call the service to open the trusted domain in a new tab", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(OpenTrustedDomainTabService.prototype, "openTab").mockImplementation(() => {});
      // process
      const controller = new OpenTrustedDomainTabController(null, null);
      await controller.exec();
      // expectations
      expect(OpenTrustedDomainTabService.prototype.openTab).toHaveBeenCalled();
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("Trusted domain is not set");
      // mock functions
      jest.spyOn(OpenTrustedDomainTabService.prototype, "openTab").mockRejectedValue(error);
      // process
      const controller = new OpenTrustedDomainTabController(null, null);
      // expectations
      await expect(controller.exec()).rejects.toThrow(error);
    });
  });
});
