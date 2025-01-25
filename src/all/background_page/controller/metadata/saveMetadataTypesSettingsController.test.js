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
import SaveMetadataTypesSettingsController from "./saveMetadataTypesSettingsController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";

describe("SaveMetadataTypesController", () => {
  describe("::exec", () => {
    let controller, account, apiClientOptions;

    beforeEach(async() => {
      account = new AccountEntity(defaultAccountDto());
      apiClientOptions = defaultApiClientOptions();
      controller = new SaveMetadataTypesSettingsController(null, null, apiClientOptions, account);
      // flush account related storage before each.
      await controller.saveMetadaSettingsService.metadataTypesSettingsLocalStorage.flush();
    });

    it("saves metadata types settings and update the local storage with it.", async() => {
      expect.assertions(3);

      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      // mock metadata types settings api service.
      jest.spyOn(controller.saveMetadaSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(settings => settings.toDto());
      // spy on local storage service
      jest.spyOn(controller.saveMetadaSettingsService.metadataTypesSettingsLocalStorage, "set");

      const savedMetadataKeysSettings = await controller.exec(metadataTypesSettingsDto);

      expect(savedMetadataKeysSettings).toBeInstanceOf(MetadataTypesSettingsEntity);
      expect(controller.saveMetadaSettingsService.metadataTypesSettingsApiService.save)
        .toHaveBeenCalledWith(new MetadataTypesSettingsEntity(metadataTypesSettingsDto));
      expect(controller.saveMetadaSettingsService.metadataTypesSettingsLocalStorage.set)
        .toHaveBeenCalledWith(new MetadataTypesSettingsEntity(metadataTypesSettingsDto));
    });

    it("throws if the parameters are not valid.", async() => {
      expect.assertions(1);
      await expect(() => controller.exec("invalid metadata types settings entity", {}))
        .toThrowEntityValidationError("default_resource_types", "required");
    });
  });
});
