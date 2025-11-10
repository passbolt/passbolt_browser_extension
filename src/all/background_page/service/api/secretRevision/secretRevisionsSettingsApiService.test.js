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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "passbolt-styleguide/test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultSecretRevisionsSettingsDto} from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity.test.data";
import SecretRevisionsSettingsApiService from "./secretRevisionsSettingsApiService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";
import {mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";

describe("SecretRevisionsSettingsApiService", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    apiClientOptions = defaultApiClientOptions();
  });

  describe("::findSettings", () => {
    it("should call the API with GET and return its response", async() => {
      expect.assertions(3);

      let request;
      const serverResponse = defaultSecretRevisionsSettingsDto();

      fetch.doMockOnceIf(/secret-revisions\/settings\.json/, req => {
        request = req;
        return mockApiResponse(serverResponse);
      });

      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      const response = await apiService.findSettings();

      expect(response).toBeInstanceOf(PassboltResponseEntity);
      expect(response.body).toStrictEqual(serverResponse);
      expect(request.method).toStrictEqual("GET");
    });

    it("should let the error be thrown if something wrong happens on the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/secret-revisions\/settings\.json/, () => mockApiResponseError(500, "Something went wrong!"));
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);

      try {
        await apiService.findSettings();
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });
  });

  describe("::save", () => {
    it("should call the API with POST and return its response", async() => {
      expect.assertions(3);

      let request;
      const dto = defaultSecretRevisionsSettingsDto();
      const entity = new SecretRevisionsSettingsEntity(dto);
      fetch.doMockOnceIf(/secret-revisions\/settings\.json/, req => {
        request = req;
        return mockApiResponse(dto);
      });

      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      const response = await apiService.save(entity);

      expect(response).toBeInstanceOf(PassboltResponseEntity);
      expect(response.body).toStrictEqual(dto);
      expect(request.method).toStrictEqual("POST");
    });

    it("should assert its parameters: wrong type", async() => {
      expect.assertions(1);
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      await expect(() => apiService.save(42)).rejects.toThrowError();
    });

    it("should assert its parameters: null", async() => {
      expect.assertions(1);
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      await expect(() => apiService.save(null)).rejects.toThrowError();
    });

    it("should assert its parameters: wrong string", async() => {
      expect.assertions(1);
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      await expect(() => apiService.save("wrong")).rejects.toThrowError();
    });
  });

  describe("::delete", () => {
    it("should call the API with DELETE and return its response", async() => {
      expect.assertions(3);

      const urlRegExp = new RegExp(`/secret-revisions/settings.json`);
      let request;
      fetch.doMockOnceIf(urlRegExp, req => {
        request = req;
        return mockApiResponse(null);
      });

      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      const response = await apiService.delete();

      expect(response).toBeInstanceOf(PassboltResponseEntity);
      expect(response.body).toBeNull();
      expect(request.method).toStrictEqual("DELETE");
    });

    it("should assert its parameters: wrong type", async() => {
      expect.assertions(1);
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      await expect(() => apiService.delete(42)).rejects.toThrowError();
    });

    it("should assert its parameters: null", async() => {
      expect.assertions(1);
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      await expect(() => apiService.delete(null)).rejects.toThrowError();
    });

    it("should assert its parameters: wrong string", async() => {
      expect.assertions(1);
      const apiService = new SecretRevisionsSettingsApiService(apiClientOptions);
      await expect(() => apiService.delete("wrong")).rejects.toThrowError();
    });
  });
});
