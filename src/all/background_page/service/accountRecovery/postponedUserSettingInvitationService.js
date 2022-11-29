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

let isInvitationPostponed = false;

class PostponedUserSettingInvitationService {
  /**
   * Returns true if the user has postponned the account recovery enrollment invitation.
   *
   * @returns {bool}
   */
  static hasPostponed() {
    return isInvitationPostponed;
  }

  /**
   * Set the account recovery enrollement inviration as postponed.
   */
  static postpone() {
    isInvitationPostponed = true;
  }

  /**
   * Set the account recovery enrollement inviration to its default value.
   */
  static reset() {
    isInvitationPostponed = false;
  }

  /**
   * Initialize the service by setting the options to the default values
   * and listens to `passbolt.auth.after-logout`
   */
  static init() {
    this.reset();

    self.addEventListener("passbolt.auth.after-logout", () => {
      this.reset();
    });
  }
}

export default PostponedUserSettingInvitationService;
