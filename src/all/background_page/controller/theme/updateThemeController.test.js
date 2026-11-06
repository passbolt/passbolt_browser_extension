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
 * @since         5.18.0
 */

import UpdateThemeController from "./updateThemeController";
import ChangeThemeEntity from "../../model/entity/theme/change/ChangeThemeEntity";
import { midgarThemeDto } from "../../model/entity/theme/themeEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UpdateThemeController", () => {
  let controller, worker;
  const requestId = "request-id";
  const name = midgarThemeDto().name;

  beforeEach(() => {
    worker = { port: { emit: jest.fn() } };
    controller = new UpdateThemeController(worker, requestId, defaultApiClientOptions());
    jest.spyOn(controller.updateThemeService, "update").mockResolvedValue();
  });

  describe("::exec", () => {
    it("updates the theme with a change theme entity built from the name", async () => {
      expect.assertions(1);

      await controller.exec(name);

      expect(controller.updateThemeService.update).toHaveBeenCalledWith(new ChangeThemeEntity({ name }));
    });
  });

  describe("::_exec", () => {
    it("emits SUCCESS once the theme is updated", async () => {
      expect.assertions(1);

      await controller._exec(name);

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("emits ERROR with the validation error if the name is invalid", async () => {
      expect.assertions(2);
      jest.spyOn(console, "error").mockImplementation(() => {});

      await controller._exec("not a valid name!");

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", expect.any(EntityValidationError));
      expect(controller.updateThemeService.update).not.toHaveBeenCalled();
    });

    it("emits ERROR with the original error if the API call fails", async () => {
      expect.assertions(1);
      const error = new Error("update failed");
      controller.updateThemeService.update.mockRejectedValue(error);
      jest.spyOn(console, "error").mockImplementation(() => {});

      await controller._exec(name);

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
