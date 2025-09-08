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
import CreateScimSettingsController from "./createScimSettingsController";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultScimSettingsDto, scimSettingsWithoutSecretTokenDto} from "../../service/api/scimSettings/scimSettingsApiService.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("CreateScimSettingsController", () => {
  let apiClientOptions, controller;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    controller = new CreateScimSettingsController(null, null, apiClientOptions);
  });

  describe("::exec", () => {
    it("should create SCIM settings", async() => {
      expect.assertions(3);
      const scimSettingsDto = defaultScimSettingsDto();
      const scimSettingsEntity = new ScimSettingsEntity(scimSettingsDto);
      jest.spyOn(controller.enableScimSettingsService, "enable").mockResolvedValue(scimSettingsEntity);

      const result = await controller.exec(scimSettingsDto);

      expect(result).toEqual(scimSettingsEntity);
      expect(controller.enableScimSettingsService.enable).toHaveBeenCalledWith(scimSettingsEntity);
      expect(result).toBeInstanceOf(ScimSettingsEntity);
    });

    it("should handle errors when creating SCIM settings", async() => {
      expect.assertions(2);
      const error = new Error("Failed to create SCIM settings");
      jest.spyOn(controller.enableScimSettingsService, "enable").mockRejectedValue(error);

      await expect(controller.exec(defaultScimSettingsDto())).rejects.toThrow(error);
      expect(controller.enableScimSettingsService.enable).toHaveBeenCalled();
    });

    it("should throw error if secret_token is missing", async() => {
      expect.assertions(2);
      jest.spyOn(controller.enableScimSettingsService, "enable");

      const scimSettingsDto = scimSettingsWithoutSecretTokenDto();
      delete scimSettingsDto.secret_token;

      await expect(controller.exec(scimSettingsDto)).rejects.toThrowError(EntityValidationError);
      expect(controller.enableScimSettingsService.enable).not.toHaveBeenCalled();
    });
  });
});
