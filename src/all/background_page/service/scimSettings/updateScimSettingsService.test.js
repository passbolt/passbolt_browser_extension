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
import UpdateScimSettingsService from "./updateScimSettingsService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import {v4 as uuidv4} from "uuid";
import {scimSettingsWithoutSecretTokenDto} from "../api/scimSettings/scimSettingsApiService.test.data";

describe("UpdateScimSettingsService", () => {
  let apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    apiClientOptions = defaultApiClientOptions();
  });

  describe('::update', () => {
    it("successfully updates SCIM settings", async() => {
      expect.assertions(2);
      const id = uuidv4();
      const apiResponse = scimSettingsWithoutSecretTokenDto();
      fetch.doMockOnceIf(new RegExp(`scim/settings/${id}\.json`), () => mockApiResponse(apiResponse));
      const expected = {
        ...apiResponse,
        secret_token: ScimSettingsEntity.EMPTY_SECRET_VALUE
      };
      const dto = {...apiResponse, setting_id: null};

      const service = new UpdateScimSettingsService(apiClientOptions);
      const scimSetting = ScimSettingsEntity.createFromScimSettingsUpdate(dto);
      const result = await service.update(id, scimSetting);

      expect(result).toBeInstanceOf(ScimSettingsEntity);
      expect(result).toEqual(new ScimSettingsEntity(expected));
    });

    it("throws an error for invalid UUID", async() => {
      expect.assertions(1);
      const service = new UpdateScimSettingsService(apiClientOptions);
      const scimSetting = new ScimSettingsEntity(scimSettingsWithoutSecretTokenDto());
      const error = new Error("The given parameter is not a valid UUID");

      await expect(() => service.update("invalid-uuid", scimSetting)).rejects.toThrow(error);
    });

    it("throws an error for invalid scimSettings type", async() => {
      expect.assertions(1);
      const service = new UpdateScimSettingsService(apiClientOptions);

      await expect(() => service.update(uuidv4(), {})).rejects.toThrow(TypeError);
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);
      const id = uuidv4();
      fetch.doMockOnceIf(new RegExp(`scim/settings/${id}\.json`), () => { throw new Error("Service unavailable"); });

      const service = new UpdateScimSettingsService(apiClientOptions);
      const scimSetting = new ScimSettingsEntity(scimSettingsWithoutSecretTokenDto());

      await expect(() => service.update(id, scimSetting)).rejects.toThrow(PassboltServiceUnavailableError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      const id = uuidv4();
      fetch.doMockOnceIf(new RegExp(`scim/settings/${id}\.json`), () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new UpdateScimSettingsService(apiClientOptions);
      const scimSetting = new ScimSettingsEntity(scimSettingsWithoutSecretTokenDto());

      await expect(() => service.update(id, scimSetting)).rejects.toThrow(PassboltApiFetchError);
    });
  });
});
