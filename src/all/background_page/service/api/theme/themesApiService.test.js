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
import { mockApiResponse, mockApiResponseError } from "../../../../../../test/mocks/mockApiResponse";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import ThemesApiService from "./themesApiService";
import ChangeThemeEntity from "../../../model/entity/theme/change/ChangeThemeEntity";
import { defaultThemeCollectionDtos } from "../../../model/entity/theme/themesCollection.test.data";
import { accountSettingsService_midgarThemeDto } from "../accountSettings/accountSettingsService.test.data";

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("ThemesApiService", () => {
  let service;

  beforeEach(() => {
    service = new ThemesApiService(defaultApiClientOptions());
  });

  it("has the correct resource name", () => {
    expect.assertions(1);
    expect(ThemesApiService.RESOURCE_NAME).toEqual("account/settings/themes");
  });

  describe("ThemesApiService::findAll", () => {
    it("gets the themes and returns the body", async () => {
      expect.assertions(2);
      const dtos = defaultThemeCollectionDtos();
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, async (req) => {
        expect(req.method).toEqual("GET");
        return mockApiResponse(dtos);
      });
      const body = await service.findAll();
      expect(body).toEqual(dtos);
    });

    it("throws on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => mockApiResponseError(500, "Something went wrong"));
      await expect(service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });
  });

  describe("ThemesApiService::update", () => {
    it("posts the theme name and returns the body", async () => {
      expect.assertions(3);
      const dto = accountSettingsService_midgarThemeDto();
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, async (req) => {
        expect(req.method).toEqual("POST");
        expect(await req.json()).toEqual({ value: "midgar" });
        return mockApiResponse(dto);
      });
      const body = await service.update(new ChangeThemeEntity({ name: "midgar" }));
      expect(body).toEqual(dto);
    });

    it("throws if the parameter is not a ChangeThemeEntity", async () => {
      expect.assertions(1);
      await expect(service.update({ name: "midgar" })).rejects.toThrow(TypeError);
    });

    it("throws on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => mockApiResponseError(500, "Something went wrong"));
      await expect(service.update(new ChangeThemeEntity({ name: "midgar" }))).rejects.toThrow(PassboltApiFetchError);
    });
  });
});
