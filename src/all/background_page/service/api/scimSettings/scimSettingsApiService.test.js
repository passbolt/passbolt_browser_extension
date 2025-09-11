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
 * @since         5.5.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import ScimSettingsApiService from "./scimSettingsApiService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {
  defaultScimSettingsDto,
  scimSettingsWithoutSecretTokenDto,
} from "./scimSettingsApiService.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import {v4 as uuidv4} from "uuid";

describe("ScimSettingsApiService", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    apiClientOptions = defaultApiClientOptions();
  });

  describe('::get', () => {
    it("retrieves the SCIM settings from API", async() => {
      expect.assertions(1);
      const apiResponse = scimSettingsWithoutSecretTokenDto();
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponse(apiResponse));

      const service = new ScimSettingsApiService(apiClientOptions);
      const result = await service.get();

      expect(result.body).toStrictEqual(apiResponse);
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => { throw new Error("Service unavailable"); });

      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.get()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::create', () => {
    it("creates SCIM settings on the API", async() => {
      expect.assertions(1);
      const apiResponse = new ScimSettingsEntity(defaultScimSettingsDto());
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponse(apiResponse));

      const service = new ScimSettingsApiService(apiClientOptions);
      const result = await service.create(apiResponse);

      expect(result.body).toStrictEqual(apiResponse.toDto());
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => { throw new Error("Service unavailable"); });

      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.create(new ScimSettingsEntity(defaultScimSettingsDto()))).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::update', () => {
    it("updates SCIM settings on the API", async() => {
      expect.assertions(1);
      const apiResponse = defaultScimSettingsDto();
      const settingsDto = {
        ...apiResponse,
        setting_id: undefined
      };
      fetch.doMockOnceIf(new RegExp(`/scim/settings/${apiResponse.id}.json`), () => mockApiResponse(apiResponse));

      const service = new ScimSettingsApiService(apiClientOptions);
      const result = await service.update(settingsDto.id, settingsDto);

      expect(result.body).toStrictEqual(apiResponse);
    });

    it("throws an error if id is invalid", async() => {
      expect.assertions(1);
      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.update("invalid-uuid", {})).rejects.toThrow(TypeError);
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);

      const apiResponse = defaultScimSettingsDto();
      const settingsDto = {
        ...apiResponse,
        setting_id: undefined
      };
      fetch.doMockOnceIf(new RegExp(`/scim/settings/${apiResponse.id}.json`), () => { throw new Error("Service unavailable"); });

      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.update(settingsDto.id, settingsDto)).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::delete', () => {
    it("deletes SCIM settings on the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/scim\/settings/, () => mockApiResponse({}));
      const id = uuidv4();
      const service = new ScimSettingsApiService(apiClientOptions);
      const result = await service.delete(id);

      expect(result.body).toStrictEqual({});
    });

    it("throws an error if id is invalid", async() => {
      expect.assertions(1);
      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.delete("invalid-uuid")).rejects.toThrow(TypeError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.delete(defaultScimSettingsDto().id)).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings/, () => { throw new Error("Service unavailable"); });

      const service = new ScimSettingsApiService(apiClientOptions);

      await expect(() => service.delete(defaultScimSettingsDto().id)).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });
});
