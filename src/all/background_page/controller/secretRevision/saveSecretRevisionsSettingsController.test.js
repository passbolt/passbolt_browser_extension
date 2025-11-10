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
import {defaultSecretRevisionsSettingsDto} from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity.test.data";
import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";
import SaveSecretRevisionsSettingsController from "./saveSecretRevisionsSettingsController";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("SaveSecretRevisionsSettingsController", () => {
  describe("::exec", () => {
    it("should save the given secret revisions settings onto the API through the dedicated service", async() => {
      expect.assertions(3);

      const secretRevisionsSettingsDto = defaultSecretRevisionsSettingsDto();
      const secretRevisionsSettingsEntity = new SecretRevisionsSettingsEntity(secretRevisionsSettingsDto);
      const controller = new SaveSecretRevisionsSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.saveSecretRevisionsSettingsService, "saveSettings").mockResolvedValue(secretRevisionsSettingsEntity);

      const result = await controller.exec(secretRevisionsSettingsDto);
      const expectedEntity = new SecretRevisionsSettingsEntity(secretRevisionsSettingsDto);

      expect(result).toEqual(expectedEntity);
      expect(controller.saveSecretRevisionsSettingsService.saveSettings).toHaveBeenCalledTimes(1);
      expect(controller.saveSecretRevisionsSettingsService.saveSettings).toHaveBeenCalledWith(secretRevisionsSettingsEntity);
    });

    it("should throw an error if the entity does not validate", async() => {
      expect.assertions(1);

      const dto = defaultSecretRevisionsSettingsDto({id: 42});
      const controller = new SaveSecretRevisionsSettingsController(null, null, defaultApiClientOptions());

      try {
        await controller.exec(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
      }
    });

    it("should not catch errors and let them being thrown if something wrong happened", async() => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new SaveSecretRevisionsSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.saveSecretRevisionsSettingsService, "saveSettings").mockImplementation(() => { throw expectedError; });

      try {
        await controller.exec(defaultSecretRevisionsSettingsDto());
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
