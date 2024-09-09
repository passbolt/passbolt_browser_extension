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
import {mockApiResponse, mockApiResponseError} from '../../../../../../test/mocks/mockApiResponse';
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {v4 as uuidv4} from "uuid";
import {minimalDto} from "../../../model/entity/secret/secretEntity.test.data";
import SecretService from "./secretService";

describe("Secret service", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAllByAcoForeignKey', () => {
    it("Should find the secret on the API from a resource id", async() => {
      expect.assertions(2);
      const resourceId = uuidv4();
      const expectedDto = minimalDto();

      fetch.doMockOnceIf(/secrets\/resource/, async request => {
        const url = new URL(request.url);
        const resourceIdFromUrl = url.pathname.split("/")[3];
        expect(resourceIdFromUrl.substring(0, resourceIdFromUrl.length - 5)).toStrictEqual(resourceId);
        return mockApiResponse(expectedDto);
      });

      const service = new SecretService(apiClientOptions);
      const resultDto = await service.findByResourceId(resourceId);

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("Should throw an error if resource id is not a uuid", async() => {
      expect.assertions(1);

      const service = new SecretService(apiClientOptions);
      try {
        await service.findByResourceId("not a uuid");
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });

    it("Should throw an error if an error happens on the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/secrets\/resource/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new SecretService(apiClientOptions);
      try {
        await service.findByResourceId(uuidv4());
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("Should throw an error if an error happens when requesting the API", async() => {
      expect.assertions(1);

      fetch.doMockOnceIf(/secrets\/resource/, () => { throw new Error("Something wrong happened"); });

      const service = new SecretService(apiClientOptions);
      try {
        await service.findByResourceId(uuidv4());
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
      }
    });
  });
});
