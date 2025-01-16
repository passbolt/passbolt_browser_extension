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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindMetadataKeysSettingsController
  from "./findMetadataKeysSettingsController";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";

describe("FindMetadataKeysSettingsController", () => {
  let controller, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    controller = new FindMetadataKeysSettingsController(null, null, apiClientOptions, account);
  });

  describe("::exec", () => {
    it("find metadata keys settings and update session storage.", async() => {
      expect.assertions(4);

      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      jest.spyOn(controller.findAndUpdateMetadataSettingsSessionStorageService.findMetadataSettingsService, "findKeysSettings")
        .mockImplementationOnce(() => new MetadataKeysSettingsEntity(metadataKeysSettingsDto));

      const metadataKeysSettings = await controller.exec();

      expect(controller.findAndUpdateMetadataSettingsSessionStorageService.findMetadataSettingsService.findKeysSettings).toHaveBeenCalled();
      expect(metadataKeysSettings).toBeInstanceOf(MetadataKeysSettingsEntity);
      expect(metadataKeysSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await controller.findAndUpdateMetadataSettingsSessionStorageService.metadataKeysSettingsLocalStorage.get();
      expect(storageValue).toEqual(metadataKeysSettingsDto);
    });
  });
});
