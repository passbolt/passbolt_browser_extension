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
 * @since         5.4.0
 */
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import MetadataSetupSettingsApiService from "./metadataSetupSettingsApiService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {enableMetadataSetupSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataSetupSettingsEntity.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

beforeEach(() => {
  jest.resetAllMocks();
  enableFetchMocks();
});

describe("metadataSetupSettingsApiService", () => {
  describe('::find', () => {
    it("Should return a PassboltResponseEntity if everything goes well.", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const service = new MetadataSetupSettingsApiService(apiClientOptions);
      const expectedBodyResponse = enableMetadataSetupSettingsDto();

      fetch.doMockOnceIf(/\/metadata\/setup\/settings\.json/, () => mockApiResponse(expectedBodyResponse));

      const apiResult = await service.find();

      expect(apiResult).toBeInstanceOf(PassboltResponseEntity);
      expect(apiResult.body).toStrictEqual(expectedBodyResponse);
    });

    it("should throw an error if something goes wrong during the fetch", async() => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();
      const service = new MetadataSetupSettingsApiService(apiClientOptions);

      fetch.doMockOnceIf(/\/metadata\/setup\/settings\.json/, () => { throw new Error("Something went wrong"); });

      await expect(() => service.find()).rejects.toThrowError();
    });
  });
});
