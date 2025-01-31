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
 * @since         4.11.0
 */

import expect from "expect";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import SaveMetadataKeysController from "./saveMetadataKeysSettingsController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";

describe("SaveMetadataKeysController", () => {
  describe("::exec", () => {
    let controller, account, apiClientOptions;

    beforeEach(async() => {
      account = new AccountEntity(defaultAccountDto());
      apiClientOptions = defaultApiClientOptions();
      controller = new SaveMetadataKeysController(null, null, apiClientOptions, account);
      // flush account related storage before each.
      await controller.saveMetadaSettingsService.metadataKeysSettingsLocalStorage.flush();
    });

    it("saves metadata keys settings and update the local storage with it.", async() => {
      expect.assertions(3);

      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      // mock metadata keys settings api service.
      jest.spyOn(controller.saveMetadaSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(settings => settings.toDto());
      // spy on local storage service
      jest.spyOn(controller.saveMetadaSettingsService.metadataKeysSettingsLocalStorage, "set");

      const savedMetadataKeysSettings = await controller.exec(metadataKeysSettingsDto);

      expect(savedMetadataKeysSettings).toBeInstanceOf(MetadataKeysSettingsEntity);
      expect(controller.saveMetadaSettingsService.metadataKeysSettingsApiService.save)
        .toHaveBeenCalledWith(new MetadataKeysSettingsEntity(metadataKeysSettingsDto));
      expect(controller.saveMetadaSettingsService.metadataKeysSettingsLocalStorage.set)
        .toHaveBeenCalledWith(new MetadataKeysSettingsEntity(metadataKeysSettingsDto));
    });

    it("throws if the parameters are not valid.", async() => {
      expect.assertions(1);
      await expect(() => controller.exec("invalid metadata keys settings entity", {}))
        .toThrowEntityValidationError("allow_usage_of_personal_keys", "required");
    });
  });
});
