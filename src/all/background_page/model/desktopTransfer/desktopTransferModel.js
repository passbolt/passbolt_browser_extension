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
 * @since         4.3.0
 */

import AccountKitEntity from "../../model/entity/account/accountKitEntity";

class DesktopTransferModel {
  /**
   * Get account kit.
   *
   * @params {AccountEntity} account The account entity.
   * @return {AccountKitEntity}
   */
  async getAccountKit(account) {
    const accountKitDto = account.toDto({
      user_private_armored_key: true,
      security_token: true
    });
    const accountToExport = new AccountKitEntity(accountKitDto);
    return accountToExport;
  }
}

export default DesktopTransferModel;
