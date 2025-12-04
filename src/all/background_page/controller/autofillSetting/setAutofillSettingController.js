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
 * @since         5.8.0
 */

import AutofillSettingLocalStorage from "../../service/local_storage/autofillSettingLocalStorage";
import AutofillSettingEntity from "../../model/entity/autofillSetting/autofillSettingEntity";

class SetAutofillSettingController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.autofillSettingLocalStorage = new AutofillSettingLocalStorage(account);
  }

  /**
   * Controller executor.
   * @param {Object} autofillSettingDto The autofill setting DTO
   * @returns {Promise<void>}
   */
  async _exec(autofillSettingDto) {
    try {
      await this.exec(autofillSettingDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Set the autofill settings
   * @param {Object} autofillSettingDto The autofill setting DTO
   * @return {Promise<void>}
   */
  async exec(autofillSettingDto) {
    const entity = new AutofillSettingEntity(autofillSettingDto);
    await this.autofillSettingLocalStorage.set(entity);
  }
}

export default SetAutofillSettingController;
