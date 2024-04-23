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

const ACCOUNT_TEMPORARY_KEY = "account-temporary";

/**
 * A cache service used to store the temporary account during a setup, recover or account recovery.
 */
class AccountTemporarySessionStorageService {
  /**
   * Get an account temporary for a given worker id.
   * @param {string} workerId The worker id to get the cached data for.
   * @returns {Promise<AccountTemporaryEntity|null>} Return the account temporary entity or null.
   */
  static async get(workerId) {
    const storageData = await browser.storage.session.get(ACCOUNT_TEMPORARY_KEY);
    const accountTemporaryDto = storageData?.[ACCOUNT_TEMPORARY_KEY];
    if (accountTemporaryDto) {
      const accountTemporaryEntity = new AccountTemporaryEntity(accountTemporaryDto);
      if (accountTemporaryEntity.workerId === workerId) {
        return accountTemporaryEntity;
      }
    }
    return null;
  }

  /**
   * Store a temporary account in the session storage.
   * @param {AccountTemporaryEntity} account The account to store
   * @throws {Error} If the account is not an AccountTemporaryEntity
   * @returns {Promise<void>}
   */
  static async set(account) {
    // Prevent any wrong data set in the session storage
    if (account instanceof AccountTemporaryEntity) {
      await navigator.locks.request(ACCOUNT_TEMPORARY_KEY, async() => {
        await browser.storage.session.set({[ACCOUNT_TEMPORARY_KEY]: account.toDto(AccountTemporaryEntity.ALL_CONTAIN_OPTIONS)});
      });
    } else {
      throw new Error("The account is not an AccountTemporaryEntity, storage has not been set");
    }
  }

  /**
   * Remove the temporary account in the session storage.
   * @returns {Promise<void>}
   */
  static async remove() {
    await navigator.locks.request(ACCOUNT_TEMPORARY_KEY, async() => {
      await browser.storage.session.remove(ACCOUNT_TEMPORARY_KEY);
    });
  }
}

export default AccountTemporarySessionStorageService;
