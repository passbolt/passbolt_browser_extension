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
 */
import Keyring from "../../model/keyring";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import GroupModel from "../../model/group/groupModel";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import GroupUpdateService from "../../service/group/groupUpdateService";
import GroupEntity from "../../model/entity/group/groupEntity";

class GroupsUpdateController {
  /**
   * @constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.groupModel = new GroupModel(apiClientOptions);
    this.keyring = new Keyring();

    this.getPassphraseService = new GetPassphraseService(account);

    this.progressService = new ProgressService(this.worker, i18n.t('Updating group ...'));
    this.groupUpdateService = new GroupUpdateService(apiClientOptions, account, this.progressService);
  }

  async _exec(groupDto) {
    try {
      await this.exec(groupDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Update a group.
   * @param {object} groupDto
   */
  async exec(groupDto) {
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    const groupEntity = new GroupEntity(groupDto);
    try {
      await this.groupUpdateService.exec(groupEntity, passphrase);
    } finally {
      this.progressService.close();
    }
  }
}

export default GroupsUpdateController;
