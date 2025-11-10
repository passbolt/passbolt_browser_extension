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
 * @since         5.7.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import DeleteSecretRevisionsSettingsController from "./deleteSecretRevisionsSettingsController";
import {v4 as uuidv4} from "uuid";

describe("DeleteSecretRevisionsSettingsController", () => {
  describe("::exec", () => {
    it("should delete the given secret revisions settings onto the API through the dedicated service", async() => {
      expect.assertions(1);

      const settingsId = uuidv4();
      const controller = new DeleteSecretRevisionsSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.deleteSecretRevisionsSettingsService, "deleteSettings").mockReturnValue();

      await controller.exec(settingsId);

      expect(controller.deleteSecretRevisionsSettingsService.deleteSettings).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors and let them being thrown if something wrong happened", async() => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new DeleteSecretRevisionsSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.deleteSecretRevisionsSettingsService, "deleteSettings").mockImplementation(() => { throw expectedError; });

      try {
        await controller.exec();
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
