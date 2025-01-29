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
 * @since         5.0.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import GetCsrfTokenController from "./getCsrfTokenController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
beforeEach(() => {
  enableFetchMocks();
});

describe("GetCsrfTokenController", () => {
  let controller, apiClientOptions;

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
    controller = new GetCsrfTokenController(null, null, apiClientOptions);
  });


  describe("::exec", () => {
    it("Should retrieve CSRF token from apiClientOptions.", async() => {
      expect.assertions(1);

      const csrfToken = "csrf-token";
      jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: csrfToken}));
      const result = await controller.exec();

      expect(result).toEqual(csrfToken);
    });
  });
});
