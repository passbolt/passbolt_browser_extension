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
import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";
import {defaultSecretRevisionsSettingsDto} from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import SaveSecretRevisionsSettingsService from "./saveSecretRevisionsSettingsService";

describe("SaveSecretRevisionsSettingsService", () => {
  describe("::saveSettings", () => {
    it("should call the api service and return the saved entity", async() => {
      expect.assertions(2);

      const dto = defaultSecretRevisionsSettingsDto();
      const entity = new SecretRevisionsSettingsEntity(dto);
      const apiClientOptions = defaultApiClientOptions();
      const mockPassboltResponse = new PassboltResponseEntity({header: {}, body: dto});

      const service = new SaveSecretRevisionsSettingsService(apiClientOptions);
      jest.spyOn(service.secretRevisionsSettingsApiService, "save").mockReturnValue(mockPassboltResponse);
      const result = await service.saveSettings(entity);

      expect(result).toBeInstanceOf(SecretRevisionsSettingsEntity);
      expect(result.toDto()).toStrictEqual(dto);
    });

    it("should not catch errors and let it throw if something wrong happens", async() => {
      expect.assertions(1);

      const dto = defaultSecretRevisionsSettingsDto();
      const entity = new SecretRevisionsSettingsEntity(dto);
      const apiClientOptions = defaultApiClientOptions();

      const service = new SaveSecretRevisionsSettingsService(apiClientOptions);
      jest.spyOn(service.secretRevisionsSettingsApiService, "save").mockImplementation(() => { throw new Error(); });
      await expect(() => service.saveSettings(entity)).rejects.toThrowError();
    });

    it("should assert its parameters", async() => {
      expect.assertions(1);

      const service = new SaveSecretRevisionsSettingsService(defaultApiClientOptions());
      await expect(() => service.saveSettings(42)).rejects.toThrowError();
    });
  });
});
