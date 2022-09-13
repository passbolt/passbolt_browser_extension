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
 * @since         3.0.0
 */
import ApiClientOptions from "../apiClient/apiClientOptions";
import AbstractService from "./abstractService";

describe("Abstract service", () => {
  it("constructor works", () => {
    const options = (new ApiClientOptions()).setBaseUrl('https://test.passbolt.test/');
    const service = new AbstractService(options, 'test');

    // Basics
    let t = () => { service.assertValidId('test'); };
    expect(t).toThrow(TypeError);
    t = () => { service.assertNonEmptyData(null); };
    expect(t).toThrow(TypeError);
  });

  it("constructor works", () => {
    const options = (new ApiClientOptions()).setBaseUrl('https://test.passbolt.test/');
    const service = new AbstractService(options, 'test');

    const formated = service.formatContainOptions(
      {"user": true, "user.profile": false},
      ['user', 'user.profile', 'user.profile.avatar', 'gpgkey'],
    );
    expect(formated).toEqual({"contain[user]": "1", "contain[user.profile]": "0"});
  });
});
