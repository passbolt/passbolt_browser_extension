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
import FindSecretRevisionsSettingsController from "./findSecretRevisionsSettingsController";
import {defaultSecretRevisionsSettingsDto} from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity.test.data";
import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";

describe("FindSecretRevisionsSettingsController", () => {
  describe("::exec", () => {
    it("should find secret revisions settings", async() => {
      expect.assertions(2);

      const secretRevisionsSettingsDto = defaultSecretRevisionsSettingsDto();
      const entity = new SecretRevisionsSettingsEntity(secretRevisionsSettingsDto);
      const controller = new FindSecretRevisionsSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findSecretRevisionsSettingsService, "findSettings").mockResolvedValue(entity);

      const result = await controller.exec();

      expect(result).toEqual(entity);
      expect(controller.findSecretRevisionsSettingsService.findSettings).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors and let them being thrown if something wrong happened", async() => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new FindSecretRevisionsSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findSecretRevisionsSettingsService, "findSettings").mockImplementation(() => { throw expectedError; });

      try {
        await controller.exec();
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
