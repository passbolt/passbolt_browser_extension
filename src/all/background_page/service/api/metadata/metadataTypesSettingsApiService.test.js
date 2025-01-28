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
 * @since         4.10.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import MetadataTypesSettingsApiService from "./metadataTypesSettingsApiService";
import {mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";

describe("MetadataTypesSettingsApiService", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findSettings', () => {
    it("retrieves the settings from API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/types\/settings/, () => mockApiResponse(defaultMetadataTypesSettingsV50FreshDto()));

      const service = new MetadataTypesSettingsApiService(apiClientOptions);
      const resultDto = await service.findSettings();

      const expectedDto = defaultMetadataTypesSettingsV50FreshDto();
      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/types\/settings/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new MetadataTypesSettingsApiService(apiClientOptions);

      await expect(() => service.findSettings()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/types\/settings/, () => { throw new Error("Service unavailable"); });

      const service = new MetadataTypesSettingsApiService(apiClientOptions);

      await expect(() => service.findSettings()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::save', () => {
    it("Save the settings on the API.", async() => {
      expect.assertions(2);

      const settingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const settings = new MetadataTypesSettingsEntity(settingsDto);
      fetch.doMockOnceIf(/metadata\/types\/settings/, async req => {
        expect(req.method).toEqual("POST");
        const reqPayload = await req.json();
        return mockApiResponse(defaultMetadataTypesSettingsV50FreshDto(reqPayload));
      });

      const service = new MetadataTypesSettingsApiService(apiClientOptions);
      const resultDto = await service.save(settings);

      expect(resultDto).toEqual(expect.objectContaining(settingsDto));
    });

    it("throws an invalid parameter error if the settings parameter is not valid", async() => {
      expect.assertions(1);

      const service = new MetadataTypesSettingsApiService(apiClientOptions);

      await expect(() => service.save(42)).rejects.toThrow(TypeError);
    });
  });
});
