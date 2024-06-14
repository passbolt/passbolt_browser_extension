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
 * @since         4.8.2
 */
import {GetActiveAccountService} from "./getActiveAccountService";
import GetLegacyAccountService from "./getLegacyAccountService";
import MockExtension from "../../../../../test/mocks/mockExtension";
import UserModel from "../../model/user/userModel";

describe("GetActiveAccountService", () => {
  beforeEach(async() => {
    jest.clearAllMocks();
    await MockExtension.withConfiguredAccount();
  });

  it("GetActiveAccountService:get", async() => {
    expect.assertions(1);
    // data
    const getActiveAccountService = new GetActiveAccountService();
    // spy function
    jest.spyOn(GetLegacyAccountService, "get");
    // execution
    await getActiveAccountService.get();
    // expectations
    expect(GetLegacyAccountService.get).toHaveBeenCalledTimes(1);
  });

  it("GetActiveAccountService:get should call GetLegacyAccountService each time", async() => {
    expect.assertions(3);
    // data
    const getActiveAccountService = new GetActiveAccountService();
    // spy function
    jest.spyOn(UserModel.prototype, "findOne").mockImplementation(() => ({role: {name: "admin"}}));
    jest.spyOn(GetLegacyAccountService, "get");
    // execution
    const account = await getActiveAccountService.get({role: true});
    const account2 = await getActiveAccountService.get({role: true});
    const account3 = await getActiveAccountService.get();
    // expectations
    expect(GetLegacyAccountService.get).toHaveBeenCalledTimes(3);
    expect(account).toStrictEqual(account2);
    expect(account3.roleName).toBeNull();
  });
});
