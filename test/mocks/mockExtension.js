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

import User from "../../src/all/background_page/model/user";
import {defaultSecurityTokenDto} from "../../src/all/background_page/model/entity/securityToken/SecurityTokenEntity.test.data";
import {v4 as uuidv4} from "uuid";
import Keyring from "../../src/all/background_page/model/keyring";
import {pgpKeys} from "../fixtures/pgpKeys/keys";

class MockExtension {
  /**
   * Mock the extension with a configured account. Ada by default.
   * @returns {Promise<void>}
   */
  static async withConfiguredAccount(keyData = pgpKeys.ada) {
    const user = this.withMissingPrivateKeyAccount(keyData);

    // Mock user private key
    const keyring = new Keyring();
    await keyring.importPrivate(keyData.private);

    return user;
  }

  /**
   * Mock the extension with a partially configured account. Ada by default without the private key set.
   *
   * @returns {Promise<User>}
   */
  static withMissingPrivateKeyAccount(keyData = pgpKeys.ada) {
    const user = User.getInstance();
    user.settings.setDomain("https://passbolt.local");
    user.settings.setSecurityToken(defaultSecurityTokenDto());
    const nameSplitted = keyData.user_ids[0].name.split(" ");
    const userDto = {
      id: uuidv4(),
      username: keyData.user_ids[0].email,
      firstname: nameSplitted.shift(),
      lastname: nameSplitted.join(" "),
    };
    user.set(userDto);

    const keyring = new Keyring();
    keyring.flush(Keyring.PRIVATE);

    return user;
  }
}
export default MockExtension;
