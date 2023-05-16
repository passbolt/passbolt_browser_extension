/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import '../../../../../test/mocks/mockSsoDataStorage';
import '../../../../../test/mocks/mockCryptoKey';
import {enableFetchMocks} from "jest-fetch-mock";
import HasSsoLoginErrorController from './hasSsoLoginErrorController';
import each from 'jest-each';

beforeAll(() => {
  enableFetchMocks();
});

const scenarios = [
  {url: "https://passbolt.test/auth/login", expectedResult: false},
  {url: "https://passbolt.test/auth/login/", expectedResult: false},
  {url: "https://passbolt.test/auth/login?case=else", expectedResult: false},
  {url: "https://passbolt.test/auth/login/?case=else", expectedResult: false},
  {url: "https://passbolt.test/auth/login?case=sso-login-error", expectedResult: true},
  {url: "https://passbolt.test/auth/login/?case=sso-login-error", expectedResult: true},
];

each(scenarios).describe("HasSsoLoginErrorController", scenario => {
  it(`Should return '${scenario.expectedResult}' with the URL: ${scenario.url}`, async() => {
    expect.assertions(1);
    const worker = {
      tab: {
        url: scenario.url
      }
    };
    const controller = new HasSsoLoginErrorController(worker);
    const result = await controller.exec();

    expect(result).toStrictEqual(scenario.expectedResult);
  });
});
