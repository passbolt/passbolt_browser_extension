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
 * @since         4.7.0
 */
import AccountTemporaryEntity from "../../model/entity/account/accountTemporaryEntity";
import {temporarySetupAccountDto} from "../../model/entity/account/accountTemporaryEntity.test.data";
import AccountTemporarySessionStorageService from "../sessionStorage/accountTemporarySessionStorageService";
import FindAccountTemporaryService from "./findAccountTemporaryService";

describe("FindAccountTemporaryService", () => {
  it("FindAccountTemporaryService:exec", async() => {
    expect.assertions(1);
    // data
    const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
    await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
    // execution
    const temporaryAccount = await FindAccountTemporaryService.exec(accountTemporaryEntity.workerId);
    // expectations
    expect(temporaryAccount).not.toBeNull();
  });

  it("FindAccountTemporaryService:exec with workerId unknown", async() => {
    expect.assertions(1);
    // execution
    try {
      await FindAccountTemporaryService.exec(null);
    } catch (error) {
      // expectations
      expect(error.message).toStrictEqual("You have already started the process on another tab.");
    }
  });
});
