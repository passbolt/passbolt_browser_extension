/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {initialAccountRecoverDto} from "../../model/entity/account/accountRecoverEntity.test.data";
import AbortAndRequestHelp from "./abortAndRequestHelpController";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

beforeEach(() => {
  enableFetchMocks();
});

describe("AbortAndRequestHelpController", () => {
  describe("AbortAndRequestHelpController::exec", () => {
    it("Should request help to an administrator and abort the recover request.", async() => {
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      const controller = new AbortAndRequestHelp({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

      // Mock the API response.
      const mockApiFetch = fetch.doMockOnceIf(new RegExp(`/setup/recover/abort/${account.userId}.json`), () => mockApiResponse());

      await controller.exec();

      expect.assertions(1);
      // Expect the API to have been called.
      expect(mockApiFetch).toHaveBeenCalled();
    });

    it("Should raise an error if no account has been found.", async() => {
      const controller = new AbortAndRequestHelp({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());
      expect.assertions(1);
      try {
        await controller.exec();
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
