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

import {User} from "../../background_page/model/user";
import {defaultSecurityTokenDto} from "../../background_page/model/entity/securityToken/SecurityTokenEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {Keyring} from "../../background_page/model/keyring";
import {pgpKeys} from "../fixtures/pgpKeys/keys";

class MockExtension {
  /**
   * Mock the extension with a configured account. Ada by default.
   * @returns {Promise<void>}
   */
  static async withConfiguredAccount() {
    this.withMissingPrivateKeyAccount();

    // Mock user private key
    const keyring = new Keyring();
    await keyring.importPrivate(pgpKeys.ada.private);
  }

  /**
   * Mock the extension with a partially configured account. Ada by default without the private key set.
   *
   * @returns {Promise<void>}
   */
  static withMissingPrivateKeyAccount() {
    const user = User.getInstance();
    user.settings.setDomain("https://localhost");
    user.settings.setSecurityToken(defaultSecurityTokenDto());
    const userDto = {
      id: uuidv4(),
      username: "ada@passbolt.com",
      firstname: "Ada",
      lastname: "Lovelace",
    };
    user.set(userDto);

    const keyring = new Keyring();
    keyring.flush(Keyring.PRIVATE);
  }
}
exports.MockExtension = MockExtension;
