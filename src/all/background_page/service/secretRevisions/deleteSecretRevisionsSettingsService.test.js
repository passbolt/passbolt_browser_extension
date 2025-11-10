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
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import {v4 as uuidv4} from "uuid";
import DeleteSecretRevisionsSettingsService from "./deleteSecretRevisionsSettingsService";

describe("DeleteSecretRevisionsSettingsService", () => {
  describe("::deleteSettings", () => {
    it("should call the api service", async() => {
      expect.assertions(1);

      const settingsId = uuidv4();
      const apiClientOptions = defaultApiClientOptions();
      const mockPassboltResponse = new PassboltResponseEntity({header: {}, body: null});

      const service = new DeleteSecretRevisionsSettingsService(apiClientOptions);
      jest.spyOn(service.secretRevisionsSettingsApiService, "delete").mockReturnValue(mockPassboltResponse);
      await service.deleteSettings(settingsId);

      expect(service.secretRevisionsSettingsApiService.delete).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors and let it throw if something wrong happens", async() => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();

      const service = new DeleteSecretRevisionsSettingsService(apiClientOptions);
      jest.spyOn(service.secretRevisionsSettingsApiService, "delete").mockImplementation(() => { throw new Error(); });

      await expect(() => service.deleteSettings()).rejects.toThrowError();
    });
  });
});
