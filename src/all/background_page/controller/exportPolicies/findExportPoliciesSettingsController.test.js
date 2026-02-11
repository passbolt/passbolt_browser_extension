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
 * @since         v5.10.0
 */

import FindExportPoliciesSettingsController from "./findExportPoliciesSettingsController";
import ExportPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultExportPoliciesSettingsDto } from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity.test.data";

describe("FindExportPoliciesSettingsController", () => {
  let apiClientOptions, controller;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    controller = new FindExportPoliciesSettingsController(null, null, apiClientOptions);
  });

  describe("::exec", () => {
    it("should find export policies settings", async () => {
      const exportPoliciesSettingsDto = defaultExportPoliciesSettingsDto();
      const exportPoliciesSettingsEntity = new ExportPoliciesSettingsEntity(exportPoliciesSettingsDto);
      jest.spyOn(controller.findExportPoliciesSettingsService, "find").mockResolvedValue(exportPoliciesSettingsEntity);

      const result = await controller.exec();

      expect(result).toEqual(exportPoliciesSettingsEntity);
      expect(controller.findExportPoliciesSettingsService.find).toHaveBeenCalledTimes(1);
    });

    it("should handle errors when finding export policies settings", async () => {
      const error = new Error("Failed to find export policies settings");
      jest.spyOn(controller.findExportPoliciesSettingsService, "find").mockRejectedValue(error);

      await expect(controller.exec()).rejects.toThrow(error);
      expect(controller.findExportPoliciesSettingsService.find).toHaveBeenCalled();
    });
  });
});
