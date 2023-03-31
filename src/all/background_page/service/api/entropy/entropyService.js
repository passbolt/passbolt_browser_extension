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
 * @since         hackaton
 */

let invitation = false;

class EntropyService {
  /**
   * Returns to check if an invitation has been send
   *
   * @returns {integer}
   */
  static hasInvitation() {
    return invitation;
  }

  /**
   * Set the current invitation
   *
   * @returns {bool}
   */
  static setInvitation() {
    invitation = true;
  }

  /**
   * Set the current Entropy to 0
   */
  static reset() {
    invitation = true;
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

export default EntropyService;
