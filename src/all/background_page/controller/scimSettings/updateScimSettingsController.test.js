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
import UpdateScimSettingsController from "./updateScimSettingsController";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultScimSettingsDto} from "../../service/api/scimSettings/scimSettingsApiService.test.data";
import {v4 as uuidv4} from "uuid";

describe("UpdateScimSettingsController", () => {
  let apiClientOptions, controller;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    controller = new UpdateScimSettingsController(null, null, apiClientOptions);
  });

  describe("::exec", () => {
    it("should update SCIM settings", async() => {
      expect.assertions(3);
      const scimSettingsDto = defaultScimSettingsDto();
      const scimSettingsEntity = new ScimSettingsEntity(scimSettingsDto);
      const id = uuidv4();
      jest.spyOn(controller.updateScimSettingsService, "update").mockResolvedValue(scimSettingsEntity);
      const expected = {
        ...scimSettingsDto,
        setting_id: undefined
      };
      const result = await controller.exec(id, scimSettingsDto);

      expect(result).toEqual(scimSettingsEntity);
      expect(controller.updateScimSettingsService.update).toHaveBeenCalledWith(id, new ScimSettingsEntity(expected));
      expect(result).toBeInstanceOf(ScimSettingsEntity);
    });

    it("should handle errors when updating SCIM settings", async() => {
      expect.assertions(2);
      const error = new Error("Failed to update SCIM settings");
      const id = uuidv4();
      jest.spyOn(controller.updateScimSettingsService, "update").mockRejectedValue(error);

      await expect(controller.exec(id, defaultScimSettingsDto())).rejects.toThrow(error);
      expect(controller.updateScimSettingsService.update).toHaveBeenCalled();
    });
  });
});
