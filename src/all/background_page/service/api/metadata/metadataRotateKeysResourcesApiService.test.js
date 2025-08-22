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
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import {defaultSharedResourcesWithEncryptedMetadataDtos} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import {mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import MetadataRotateKeysResourcesApiService from "./metadataRotateKeysResourcesApiService";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";

describe("MetadataRotateKeysResourcesApiService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAll', () => {
    it("retrieves the resources from API", async() => {
      expect.assertions(2);

      const apiResourcesCollection = defaultSharedResourcesWithEncryptedMetadataDtos();
      fetch.doMockOnceIf(/metadata\/rotate-key\/resources/, () => mockApiResponse(apiResourcesCollection));

      const service = new MetadataRotateKeysResourcesApiService(apiClientOptions);
      const resultDto = await service.findAll();

      expect(resultDto).toBeInstanceOf(Array);
      expect(resultDto).toHaveLength(apiResourcesCollection.length);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/rotate-key\/resources/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new MetadataRotateKeysResourcesApiService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/rotate-key\/resources/, () => { throw new Error("Service unavailable"); });

      const service = new MetadataRotateKeysResourcesApiService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::rotate', () => {
    it("Rotate metadata of resources collection on the API.", async() => {
      expect.assertions(3);

      const dto = defaultSharedResourcesWithEncryptedMetadataDtos();
      const resourcesCollection = new ResourcesCollection(dto);
      let reqPayload;
      fetch.doMockOnceIf(/metadata\/rotate-key\/resources/, async req => {
        expect(req.method).toEqual("POST");
        reqPayload = await req.json();
        return mockApiResponse(reqPayload);
      });

      const service = new MetadataRotateKeysResourcesApiService(apiClientOptions);
      const resultDto = await service.rotate(resourcesCollection);

      expect(resultDto).toEqual(expect.objectContaining(dto));
      expect(reqPayload).toEqual(expect.objectContaining(dto));
    });

    it("throws an invalid parameter error if the resources collection parameter is not valid", async() => {
      expect.assertions(1);

      const service = new MetadataRotateKeysResourcesApiService(apiClientOptions);

      await expect(() => service.rotate(42)).rejects.toThrow(TypeError);
    });
  });
});
