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

let isInvitationAccountRecoveryPostponed = false;
let isInvitationMFAPolicyPostponed = false;

class PostponedUserSettingInvitationService {
  /**
   * Returns true if the user has postponned the account recovery enrollment invitation.
   *
   * @returns {bool}
   */
  static hasPostponedAccountRecovery() {
    return isInvitationAccountRecoveryPostponed;
  }

  /**
   * Returns true if the user has postponned the mfa policy enrollment invitation.
   *
   * @returns {bool}
   */
  static hasPostponedMFAPolicy() {
    return isInvitationMFAPolicyPostponed;
  }

  /**
   * Set the account recovery enrollement invitation as postponed.
   */
  static postponeAccountRecovery() {
    isInvitationAccountRecoveryPostponed = true;
  }

  /**
   * Set the MFA policy enrollement invitation as postponed.
   */
  static postponeMFAPolicy() {
    isInvitationMFAPolicyPostponed = true;
  }

  /**
   * Set the enrollement invitation to its default value.
   */
  static reset() {
    isInvitationAccountRecoveryPostponed = false;
    isInvitationMFAPolicyPostponed = false;
  }
}

export default PostponedUserSettingInvitationService;
