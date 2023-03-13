/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import SystemRequirementService from "./systemRequirementService";
import {Config} from "../../model/config";
import Log from "../../model/log";
import storage from "../../sdk/storage";

describe("SystemRequirementService", () => {
  describe("SystemRequirementService::get", () => {
    it("Should initialize the configuration", async() => {
      expect.assertions(4);
      // spy on
      jest.spyOn(storage, "init");
      jest.spyOn(Config, "init");
      jest.spyOn(Log, "init");
      jest.spyOn(storage, "getItem");
      // process
      await SystemRequirementService.get();
      // expectations
      expect(storage.init).toHaveBeenCalled();
      expect(Config.init).toHaveBeenCalled();
      expect(Log.init).toHaveBeenCalled();
      expect(storage.getItem).toHaveBeenCalledWith('config');
    });
  });
});
