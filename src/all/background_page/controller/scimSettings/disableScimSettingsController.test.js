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
 * @since         5.5.0
 */

import expect from "expect";
import DisableScimSettingsController from "./disableScimSettingsController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {v4 as uuidv4} from "uuid";

describe("DisableScimSettingsController", () => {
  let apiClientOptions, controller;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    controller = new DisableScimSettingsController(null, null, apiClientOptions);
  });

  describe("::exec", () => {
    it("should disable SCIM settings", async() => {
      expect.assertions(2);
      const id = uuidv4();
      const expectedResult = {success: true};
      jest.spyOn(controller.disableScimSettingsService, "disable").mockResolvedValue(expectedResult);

      const result = await controller.exec(id);

      expect(result).toEqual(expectedResult);
      expect(controller.disableScimSettingsService.disable).toHaveBeenCalledWith(id);
    });

    it("should handle errors when disabling SCIM settings", async() => {
      expect.assertions(2);
      const error = new Error("Failed to disable SCIM settings");
      const id = uuidv4();
      jest.spyOn(controller.disableScimSettingsService, "disable").mockRejectedValue(error);

      await expect(controller.exec(id)).rejects.toThrow(error);
      expect(controller.disableScimSettingsService.disable).toHaveBeenCalledWith(id);
    });
  });
});
