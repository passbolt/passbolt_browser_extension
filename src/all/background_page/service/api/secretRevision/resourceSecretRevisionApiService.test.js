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

import ResourceSecretRevisionApiService from "./resourceSecretRevisionApiService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import {v4 as uuidv4} from "uuid";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultResourceSecretRevisionsDtos} from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";

beforeEach(() => {
  enableFetchMocks();
  jest.resetModules();
});

describe("ResourceSecretRevisionApiService", () => {
  describe("::findAllByResourceId", () => {
    it("should call the right endpoint with the right parameters", async() => {
      expect.assertions(1);

      const resource_id = uuidv4();
      const secretRevisionCollection = defaultResourceSecretRevisionsDtos({resource_id});

      fetch.doMockOnceIf(new RegExp(`/secret-revisions/resource/${resource_id}.json`), () => mockApiResponse(secretRevisionCollection));

      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      const result = await apiService.findAllByResourceId(resource_id);

      const expectedResult = new PassboltResponseEntity({header: {}, body: secretRevisionCollection});
      expect(result).toStrictEqual(expectedResult);
    });

    it("should call the right endpoint with the right parameters and all contains", async() => {
      expect.assertions(12);
      const resource_id = uuidv4();
      const secretRevisionCollection = defaultResourceSecretRevisionsDtos({resource_id});
      const contains = {
        creator: true,
        owner_accessors: true,
        secret: true,
        ["creator.profile"]: true,
        ["owner_accessors.profile"]: true,
      };

      let request;
      fetch.doMockOnceIf(new RegExp(`/secret-revisions/resource/${resource_id}.json`), req => {
        request = req;
        return mockApiResponse(secretRevisionCollection);
      });

      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      const result = await apiService.findAllByResourceId(resource_id, contains);

      const expectedResult = new PassboltResponseEntity({header: {}, body: secretRevisionCollection});
      expect(result).toStrictEqual(expectedResult);
      expect(request.method).toStrictEqual("GET");

      const url = new URL(request.url);
      expect(url.searchParams.has("contain[creator]")).toStrictEqual(true);
      expect(url.searchParams.has("contain[owner_accessors]")).toStrictEqual(true);
      expect(url.searchParams.has("contain[secret]")).toStrictEqual(true);
      expect(url.searchParams.has("contain[creator.profile]")).toStrictEqual(true);
      expect(url.searchParams.has("contain[owner_accessors.profile]")).toStrictEqual(true);
      expect(url.searchParams.get("contain[creator]")).toStrictEqual("1");
      expect(url.searchParams.get("contain[owner_accessors]")).toStrictEqual("1");
      expect(url.searchParams.get("contain[secret]")).toStrictEqual("1");
      expect(url.searchParams.get("contain[creator.profile]")).toStrictEqual("1");
      expect(url.searchParams.get("contain[owner_accessors.profile]")).toStrictEqual("1");
    });

    it("should call the right endpoint with the right parameters and no contains", async() => {
      expect.assertions(7);
      const resource_id = uuidv4();
      const secretRevisionCollection = defaultResourceSecretRevisionsDtos({resource_id});
      const contains = {};

      let request;
      fetch.doMockOnceIf(new RegExp(`/secret-revisions/resource/${resource_id}.json`), req => {
        request = req;
        return mockApiResponse(secretRevisionCollection);
      });

      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      const result = await apiService.findAllByResourceId(resource_id, contains);

      const expectedResult = new PassboltResponseEntity({header: {}, body: secretRevisionCollection});
      expect(result).toStrictEqual(expectedResult);
      expect(request.method).toStrictEqual("GET");

      const url = new URL(request.url);
      expect(url.searchParams.has("contain[creator]")).toStrictEqual(false);
      expect(url.searchParams.has("contain[owner_accessors]")).toStrictEqual(false);
      expect(url.searchParams.has("contain[secret]")).toStrictEqual(false);
      expect(url.searchParams.has("contain[creator.profile]")).toStrictEqual(false);
      expect(url.searchParams.has("contain[owner_accessors.profile]")).toStrictEqual(false);
    });

    it("should throw an error if a 404 is received from the API", async() => {
      expect.assertions(1);
      const resourceId = uuidv4();

      fetch.doMockOnceIf(new RegExp(`/secret-revisions/resource/${resourceId}.json`), () => mockApiResponseError(404, "Endpoint not found"));

      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      try {
        await apiService.findAllByResourceId(resourceId);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("should throw an error if a resourceId is not a valid uuid", async() => {
      expect.assertions(1);
      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      await expect(() => apiService.findAllByResourceId(42)).rejects.toThrowError();
    });

    it("should throw an error if a resourceId is null", async() => {
      expect.assertions(1);
      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      await expect(() => apiService.findAllByResourceId(null)).rejects.toThrowError();
    });

    it("should throw an error if a contains is not an object", async() => {
      expect.assertions(1);
      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      await expect(() => apiService.findAllByResourceId(uuidv4(), 42)).rejects.toThrowError();
    });

    it("should throw an error if a wrong contain is passed", async() => {
      expect.assertions(1);
      const contains = {wrong: true};
      const apiClientOptions = defaultApiClientOptions();
      const apiService = new ResourceSecretRevisionApiService(apiClientOptions);
      await expect(() => apiService.findAllByResourceId(uuidv4(), contains)).rejects.toThrowError();
    });
  });
});
