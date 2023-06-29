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
 * @since         4.2.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import RememberMeLocalStorage from "../../service/local_storage/rememberMeLocalStorage";
import GetLastRememberMeChoiceController from "./getLastRememberMeChoiceController";

describe("getLastRememberMeChoiceController", () => {
  const account = new AccountEntity(defaultAccountDto());
  const storage = new RememberMeLocalStorage(account);
  const controller = new GetLastRememberMeChoiceController(null, null, account);

  it("Should return false if the local storage is not set", async() => {
    expect.assertions(1);
    storage.flush();

    const result = await controller.exec();
    expect(result).toStrictEqual(false);
  });

  it("Should return the value stored in local storage", async() => {
    expect.assertions(2);
    storage.flush();

    storage.set(false);
    let result = await controller.exec();
    expect(result).toStrictEqual(false);

    storage.set(true);
    result = await controller.exec();
    expect(result).toStrictEqual(true);
  });
});
