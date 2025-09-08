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
import FindScimSettingsController from "./findScimSettingsController";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultScimSettingsDto} from "../../service/api/scimSettings/scimSettingsApiService.test.data";

describe("FindScimSettingsController", () => {
  let apiClientOptions, controller;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    controller = new FindScimSettingsController(null, null, apiClientOptions);
  });

  describe("::exec", () => {
    it("should find SCIM settings", async() => {
      const scimSettingsDto = defaultScimSettingsDto();
      const scimSettingsEntity = new ScimSettingsEntity(scimSettingsDto);
      jest.spyOn(controller.findScimSettingsService, "get").mockResolvedValue(scimSettingsEntity);

      const result = await controller.exec();

      expect(result).toEqual(scimSettingsEntity);
      expect(controller.findScimSettingsService.get).toHaveBeenCalled();
    });

    it("should handle errors when finding SCIM settings", async() => {
      const error = new Error("Failed to find SCIM settings");
      jest.spyOn(controller.findScimSettingsService, "get").mockRejectedValue(error);

      await expect(controller.exec()).rejects.toThrow(error);
      expect(controller.findScimSettingsService.get).toHaveBeenCalled();
    });
  });
});
