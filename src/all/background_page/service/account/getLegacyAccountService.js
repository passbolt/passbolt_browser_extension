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
import BuildApiClientOptionsService from "./buildApiClientOptionsService";
import UserModel from "../../model/user/userModel";

class GetLegacyAccountService {
  /**
   * Get the account associated with this extension.
   * @param {Object} option The option to add more data in the account
   * @return {Promise<AccountEntity>}
   * @throw {Error} if no account yet associated with this extension.
   */
  static async get(option = {}) {
    const keyring = new Keyring();
    const user = await User.getInstance().get();
    const serverPublicKeyInfo = keyring.findPublic(Uuid.get(user.settings.domain));
    const userPublicKeyInfo = keyring.findPublic(user.id);
    const userPrivateKeyInfo = keyring.findPrivate();

    // Add in the account the role name if the option object have role (only for authenticated user)
    let userEntity;
    if (option?.role) {
      // Load the application settings, necessary to validate the account username.
      const apiClientOptions = await BuildApiClientOptionsService.buildFromDomain(user.settings.domain);
      userEntity = await (new UserModel(apiClientOptions)).findOne(user.id, {role: true});
    }

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
      role_name: userEntity?.role?.name || null
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
