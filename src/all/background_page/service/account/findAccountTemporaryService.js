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
 * @since         4.7.0
 */
import AccountTemporarySessionStorageService from "../sessionStorage/accountTemporarySessionStorageService";
import i18n from "../../sdk/i18n";

class FindAccountTemporaryService {
  /**
   * Find an account temporary in the session storage
   * @param {string} workerId The worker id
   * @returns {Promise<AccountTemporaryEntity>}
   * @throws {Error} if no temporary account is found
   */
  static async exec(workerId) {
    const temporaryAccount = await AccountTemporarySessionStorageService.get(workerId);
    if (!temporaryAccount) {
      throw new Error(i18n.t('You have already started the process on another tab.'));
    }
    return temporaryAccount;
  }
}

export default FindAccountTemporaryService;
