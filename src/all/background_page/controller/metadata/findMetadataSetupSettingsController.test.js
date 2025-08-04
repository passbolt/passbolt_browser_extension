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
 * @since         5.4.0
 */
import FindMetadataSetupSettingsController from "./findMetadataSetupSettingsController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MetadataSetupSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataSetupSettingsEntity";
import {enableMetadataSetupSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataSetupSettingsEntity.test.data";

describe("FindMetadataSetupSettingsController", () => {
  describe("::exec", () => {
    it("find metadata keys settings and update session storage.", async() => {
      expect.assertions(1);

      const expectedResult = new MetadataSetupSettingsEntity(enableMetadataSetupSettingsDto());
      const controller = new FindMetadataSetupSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findMetadataSetupSettingsService, "findSetupSettings").mockImplementation(() => expectedResult);

      const result = await controller.exec();

      expect(result).toStrictEqual(expectedResult);
    });

    it("should not intercept unexpected error.", async() => {
      expect.assertions(1);

      const controller = new FindMetadataSetupSettingsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findMetadataSetupSettingsService, "findSetupSettings").mockImplementation(() => { throw new Error("Something went wrong!"); });

      await expect(() => controller.exec()).rejects.toThrowError();
    });
  });
});
