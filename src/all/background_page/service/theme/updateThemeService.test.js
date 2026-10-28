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
 * @since         5.18.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import { mockApiResponse, mockApiResponseError } from "../../../../../test/mocks/mockApiResponse";
import UpdateThemeService from "./updateThemeService";
import ChangeThemeEntity from "../../model/entity/theme/change/ChangeThemeEntity";
import { Config } from "../../model/config";
import { accountSettingsService_midgarThemeDto } from "../api/accountSettings/accountSettingsService.test.data";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("UpdateThemeService", () => {
  let service;

  beforeEach(() => {
    service = new UpdateThemeService(defaultApiClientOptions());
    jest.spyOn(Config, "write");
  });

  describe("::update", () => {
    it("should write the local config only after the API call succeeds.", async () => {
      expect.assertions(3);
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => {
        expect(Config.write).not.toHaveBeenCalled();
        return mockApiResponse(accountSettingsService_midgarThemeDto());
      });

      await service.update(new ChangeThemeEntity({ name: "midgar" }));

      expect(Config.write).toHaveBeenCalledTimes(1);
      expect(Config.write).toHaveBeenCalledWith("user.settings.theme", "midgar");
    });

    it("should leave the local config untouched when the API call fails.", async () => {
      expect.assertions(2);
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => mockApiResponseError(500, "Something went wrong!"));

      await expect(service.update(new ChangeThemeEntity({ name: "midgar" }))).rejects.toThrow(PassboltApiFetchError);
      expect(Config.write).not.toHaveBeenCalled();
    });

    it("should reject a parameter that is not a ChangeThemeEntity without writing the local config.", async () => {
      expect.assertions(2);

      await expect(service.update({ name: "midgar" })).rejects.toThrow(TypeError);
      expect(Config.write).not.toHaveBeenCalled();
    });
  });
});
