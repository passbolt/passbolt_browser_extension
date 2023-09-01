/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.2.0
 */
import ResourceGridUserSettingLocalStorage from "../../service/local_storage/ressourceGridSettingLocalStorage";

class GetResourceGridUserSettingController {
  /**
   * GetResourceGridUserSettingController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {AccountEntity} account The account associated to the worker
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceGridUserSettingLocalStorage = new ResourceGridUserSettingLocalStorage(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the resource grid setting.
   *
   * @return {Promise<GridUserSettingEntity> | null}
   */
  async exec() {
    return this.resourceGridUserSettingLocalStorage.get();
  }
}

export default GetResourceGridUserSettingController;
