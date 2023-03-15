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

import AccountLocalStorage from "../local_storage/accountLocalStorage";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import ParseAccountRecoveryUrlService from "./parseAccountRecoveryUrlService";


class GetRequestLocalAccountService {
  /**
   * Get account recovery temporary account matching continue url.
   * @param {string} continueUrl The account recovery url.
   * @return {Promise<AccountAccountRecoveryEntity|void>}
   * @throw {Error} if cannot parse the account recovery continue url.
   * @throw {Error} if no account found for the given user in the local storage.
   * @throw {Error} if the account found in the local storage does not match the account recovery request url parameters.
   */
  static async getAccountMatchingContinueUrl(continueUrl) {
    const {
      domain: domain,
      user_id: userId,
      authentication_token_token: authenticationTokenToken
    } = ParseAccountRecoveryUrlService.parse(continueUrl);

    const accountDto = await AccountLocalStorage.getAccountByUserIdAndType(userId, AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY);
    if (!accountDto) {
      throw new Error('No account found for the given user in the local storage.');
    }

    const account = new AccountAccountRecoveryEntity(accountDto, {validateUsername: false});
    if (account.domain !== domain
      || account.authenticationTokenToken !== authenticationTokenToken
      || account.userId !== userId) {
      throw new Error('The account found in the local storage does not match the account recovery request url parameters.');
    }

    return account;
  }
}

export default GetRequestLocalAccountService;
