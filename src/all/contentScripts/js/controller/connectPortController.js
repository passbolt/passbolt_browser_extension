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
 * @since         4.0.0
 */

class ConnectPortController {
  /**
   * ConnectPortController constructor
   * @param {Port} port
   */
  constructor(port) {
    this.port = port;
  }

  /**
   * Connect port.
   *
   * @param portId {string} The port id
   * @return {Promise<string>}
   */
  async exec(portId) {
    if (this.port._name === portId) {
      await this.port.connectIfDisconnected();
    }
  }
}

export default ConnectPortController;
