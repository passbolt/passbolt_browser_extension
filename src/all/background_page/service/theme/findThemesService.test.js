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
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import { mockApiResponse, mockApiResponseError } from "../../../../../test/mocks/mockApiResponse";
import FindThemesService from "./findThemesService";
import ThemesCollection from "../../model/entity/theme/themesCollection";
import { defaultThemeCollectionDtos } from "../../model/entity/theme/themesCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("FindThemesService", () => {
  let service;

  beforeEach(() => {
    service = new FindThemesService(defaultApiClientOptions());
  });

  describe("::findAll", () => {
    it("should retrieve the themes as a collection.", async () => {
      expect.assertions(2);
      const dtos = defaultThemeCollectionDtos();
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => mockApiResponse(dtos));

      const collection = await service.findAll();

      expect(collection).toBeInstanceOf(ThemesCollection);
      expect(collection.toDto()).toStrictEqual(dtos);
    });

    it("should not intercept the error from the API if something goes wrong.", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => mockApiResponseError(500, "Something went wrong!"));

      await expect(service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });

    it("should throw if the API returns invalid themes.", async () => {
      expect.assertions(1);
      const dtos = defaultThemeCollectionDtos();
      delete dtos[0].id;
      fetch.doMockOnceIf(/account\/settings\/themes\.json/, () => mockApiResponse(dtos));

      await expect(service.findAll()).rejects.toThrow(CollectionValidationError);
    });
  });
});
