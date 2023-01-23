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
 * @since         3.10.0
 */

import PostponedUserSettingInvitationService from '../../service/api/invitation/postponedUserSettingInvitationService';

class HasUserPostponedUserSettingInvitationMFAPolicyController {
  /**
   * HasUserPostponedUserSettingInvitationMFAPolicyController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Controller executor.
   * @returns {Promise<bool>}
   */
  async _exec() {
    try {
      const hasPostponedInvitation = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", hasPostponedInvitation);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Check if the user has postponed the MFA Policy enrollment invitation.
   */
  exec() {
    return PostponedUserSettingInvitationService.hasPostponedMFAPolicy();
  }
}

export default HasUserPostponedUserSettingInvitationMFAPolicyController;
