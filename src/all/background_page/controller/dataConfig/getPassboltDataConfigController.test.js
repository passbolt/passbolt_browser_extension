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
 * @since         4.6.0
 */

import PassboltDataLocalStorage from "../../service/local_storage/passboltDataLocalStorage";
import GetPassboltDataConfigController from "./getPassboltDataConfigController";
import {defaultPassboltData} from "./passboltData.test.data";

describe("GetPassboltDataConfigController", () => {
  const storage = new PassboltDataLocalStorage();
  const controller = new GetPassboltDataConfigController(null, null);

  it("Should return false if the local storage is not set", async() => {
    expect.assertions(1);
    storage.flush();

    const result = await controller.exec();
    expect(result).toStrictEqual(null);
  });

  it("Should return the value stored in the _passbolt_data.config from the local storage", async() => {
    expect.assertions(2);
    storage.flush();

    const passboltData = defaultPassboltData();
    storage.set(passboltData);
    let result = await controller.exec();
    expect(result).toStrictEqual(passboltData.config);

    const passboltData2 = defaultPassboltData({
      config: "modified config",
    });
    storage.set(passboltData2);
    result = await controller.exec();
    expect(result).toStrictEqual(passboltData2.config);
  });
});
