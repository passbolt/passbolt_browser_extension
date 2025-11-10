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
import FindSecretRevisionsSettingsService from "./findSecretRevisionsSettingsService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

describe("FindSecretRevisionsSettingsService", () => {
  describe("::findSettings", () => {
    it("should call the api service and return an entity", async() => {
      expect.assertions(2);

      const dto = defaultSecretRevisionsSettingsDto();
      const apiClientOptions = defaultApiClientOptions();
      const mockPassboltResponse = new PassboltResponseEntity({header: {}, body: dto});

      const service = new FindSecretRevisionsSettingsService(apiClientOptions);
      jest.spyOn(service.secretRevisionsSettingsApiService, "findSettings").mockReturnValue(mockPassboltResponse);
      const result = await service.findSettings();

      expect(result).toBeInstanceOf(SecretRevisionsSettingsEntity);
      expect(result.toDto()).toStrictEqual(dto);
    });

    it("should call the api service and return an entity event if the API returns nothing", async() => {
      expect.assertions(2);

      const defaultDto = SecretRevisionsSettingsEntity.createFromDefault().toDto();
      const apiClientOptions = defaultApiClientOptions();

      const service = new FindSecretRevisionsSettingsService(apiClientOptions);
      jest.spyOn(service.secretRevisionsSettingsApiService, "findSettings").mockImplementation(() => { throw new Error(); });
      const result = await service.findSettings();

      expect(result).toBeInstanceOf(SecretRevisionsSettingsEntity);
      expect(result.toDto()).toStrictEqual(defaultDto);
    });
  });
});
