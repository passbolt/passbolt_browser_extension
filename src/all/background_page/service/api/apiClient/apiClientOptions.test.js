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
 * @since         2.13.0
 */
import {ApiClientOptions} from "./apiClientOptions";

describe("ApiClientOption testsuite", () => {
  it("should throw an error if url is empty", () => {
    expect(() => {
      (new ApiClientOptions()).setBaseUrl();
    }).toThrow(TypeError);
  });

  it("should throw an error if url is not correct", () => {
    expect(() => {
      (new ApiClientOptions()).setBaseUrl('url');
    }).toThrow(TypeError);
  });

  it("should throw an error if url is not correct type", () => {
    expect(() => {
      (new ApiClientOptions()).setBaseUrl({'url': 'nope'});
    }).toThrow(TypeError);
  });

  it("should throw an error if resource name is empty", () => {
    expect(() => {
      (new ApiClientOptions()).setResourceName();
    }).toThrow(TypeError);
  });

  it("should throw an error if resource name is not a string", () => {
    expect(() => {
      (new ApiClientOptions()).setResourceName({'test': 'test'});
    }).toThrow(TypeError);
  });
});
