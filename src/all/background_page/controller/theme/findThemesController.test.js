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

import FindThemesController from "./findThemesController";
import ThemesCollection from "../../model/entity/theme/themesCollection";
import { defaultThemeCollectionDtos } from "../../model/entity/theme/themesCollection.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindThemesController", () => {
  let controller, worker;
  const requestId = "request-id";

  beforeEach(() => {
    worker = { port: { emit: jest.fn() } };
    controller = new FindThemesController(worker, requestId, defaultApiClientOptions());
  });

  describe("::exec", () => {
    it("returns the themes collection", async () => {
      expect.assertions(2);
      const collection = new ThemesCollection(defaultThemeCollectionDtos());
      jest.spyOn(controller.findThemesService, "findAll").mockResolvedValue(collection);

      const result = await controller.exec();

      expect(controller.findThemesService.findAll).toHaveBeenCalled();
      expect(result).toBe(collection);
    });
  });

  describe("::_exec", () => {
    it("emits SUCCESS with the themes", async () => {
      expect.assertions(1);
      const collection = new ThemesCollection(defaultThemeCollectionDtos());
      jest.spyOn(controller.findThemesService, "findAll").mockResolvedValue(collection);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", collection);
    });

    it("emits ERROR with the original error if the service fails", async () => {
      expect.assertions(1);
      const error = new Error("find failed");
      jest.spyOn(controller.findThemesService, "findAll").mockRejectedValue(error);
      jest.spyOn(console, "error").mockImplementation(() => {});

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
