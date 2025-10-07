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
 * @since         5.6.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import DeleteMetadataKeyService from "./deleteMetadataKeyService";
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuidv4} from "uuid";

describe("DeleteMetadataKeyService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::delete', () => {
    it("delete the metadata key on the API.", async() => {
      expect.assertions(1);

      const expectedId = uuidv4();
      const service = new DeleteMetadataKeyService(apiClientOptions);
      jest.spyOn(service.metadataKeysApiService, "delete").mockImplementationOnce(jest.fn());

      await service.delete(expectedId);
      expect(service.metadataKeysApiService.delete).toHaveBeenCalledWith(expectedId);
    });

    it("throws an invalid parameter error if the settings parameter is not valid uuid", async() => {
      expect.assertions(1);

      const service = new DeleteMetadataKeyService(apiClientOptions);

      await expect(() => service.delete(42)).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });
});
