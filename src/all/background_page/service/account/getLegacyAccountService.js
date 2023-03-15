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

import Keyring from "../../model/keyring";
import {Uuid} from "../../utils/uuid";
import AccountEntity from "../../model/entity/account/accountEntity";
import User from "../../model/user";

class GetLegacyAccountService {
  /**
   * Get the account associated with this extension.
   * @return {Promise<AccountEntity>}
   * @throw {Error} if no account yet associated with this extension.
   */
  static async get() {
    const keyring = new Keyring();
    const user = await User.getInstance().get();
    const serverPublicKeyInfo = keyring.findPublic(Uuid.get(user.settings.domain));
    const userPublicKeyInfo = keyring.findPublic(user.id);
    const userPrivateKeyInfo = keyring.findPrivate();

    const accountDto = {
      domain: user.settings.domain,
      user_id: user.id,
      username: user.username,
      first_name: user.firstname,
      last_name: user.lastname,
      server_public_armored_key: serverPublicKeyInfo.armoredKey,
      user_key_fingerprint: userPublicKeyInfo.fingerprint.toUpperCase(),
      user_public_armored_key: userPublicKeyInfo.armoredKey,
      user_private_armored_key: userPrivateKeyInfo.armoredKey,
      security_token: user.settings.securityToken,
    };

    /*
     * Do not validate the username. This validation can happen only when the application settings are loaded as the
     * username validation can be customized. The application settings are not retrieved at this stage to not add a time
     * penalty on all the flows that require the account.
     */
    return new AccountEntity(accountDto, {validateUsername: false});
  }
}

export default GetLegacyAccountService;
